import { MongoClient, ObjectId } from "mongodb"

const GUEST_SESSION_TTL_INDEX = "guest_sessions_expiresAt_ttl"
const CONVERSATION_TTL_INDEX = "conversations_expiresAt_ttl"
const CURRENT_GUEST_CONVERSATION_INDEX = "conversations_guestSessionId_active_unique"
const CURRENT_USER_CONVERSATION_INDEX = "conversations_userId_active_unique"

const globalForPragyaMongo = globalThis as unknown as {
  pragyaMongoInitPromise?: Promise<void>
  pragyaMongoClient?: MongoClient
  pragyaMongoClientPromise?: Promise<MongoClient>
}

async function connect() {
  const databaseUrl = process.env.DATABASE_URL?.trim()
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for Pragya Mongo initialization")
  }

  if (globalForPragyaMongo.pragyaMongoClient) {
    return globalForPragyaMongo.pragyaMongoClient
  }

  if (!globalForPragyaMongo.pragyaMongoClientPromise) {
    globalForPragyaMongo.pragyaMongoClientPromise = (async () => {
      const client = new MongoClient(databaseUrl)
      await client.connect()
      return client
    })()
  }

  const client = await globalForPragyaMongo.pragyaMongoClientPromise
  globalForPragyaMongo.pragyaMongoClient = client
  return client
}

export async function getPragyaMongoDb() {
  const client = await connect()
  return client.db()
}

// ---------------------------------------------------------------------------
// Shared collection-existence guard
// ---------------------------------------------------------------------------

/**
 * Returns true when `name` already exists as a collection in the current
 * database.
 *
 * WHY THIS EXISTS:
 * On a fresh deployment the three collections (guest_sessions, conversations,
 * messages) are created lazily — MongoDB Atlas / the upstream Pragya service
 * inserts the first document and the collection appears at that point.
 * Before any chat has happened, calling collection.indexes() on a
 * non-existent namespace raises:
 *
 *   MongoServerError: NamespaceNotFound
 *
 * By filtering with db.listCollections({ name }) we avoid touching the
 * namespace at all; the cursor returns zero or one document so the check is
 * O(1) regardless of how many other collections exist.
 */
async function collectionExists(collectionName: string): Promise<boolean> {
  const db = await getPragyaMongoDb()
  const found = await db
    .listCollections({ name: collectionName }, { nameOnly: true })
    .toArray()
  return found.length > 0
}

// ---------------------------------------------------------------------------
// ensureGuestSessionTtlIndex
// ---------------------------------------------------------------------------

/**
 * Ensures that the `guest_sessions` collection has a TTL index on `expiresAt`
 * with expireAfterSeconds = 0 so MongoDB automatically purges documents once
 * their `expiresAt` timestamp passes.
 *
 * CHANGE:
 *   Added `if (!(await collectionExists("guest_sessions"))) return` at the top.
 *
 * Before this guard, calling `collection.indexes()` on a non-existent
 * collection threw NamespaceNotFound on every server cold-start before the
 * first guest chat.  The guard makes the function a silent no-op on a fresh
 * database; all original index-management logic below is unchanged.
 */
async function ensureGuestSessionTtlIndex() {
  // Skip on a fresh database — collection is created by the first chat write.
  if (!(await collectionExists("guest_sessions"))) {
    return
  }

  const collection = (await getPragyaMongoDb()).collection("guest_sessions")
  const indexes = await collection.indexes()
  const existing = indexes.find((index) => {
    const key = index.key as Record<string, unknown>
    return Object.keys(key).length === 1 && key.expiresAt === 1
  })

  if (existing?.expireAfterSeconds === 0) {
    // Correct TTL index already in place — nothing to do.
    return
  }

  if (existing) {
    // Same key but wrong TTL value — drop before recreating to avoid a
    // MongoDB "index already exists with different options" error.
    // existing.name is typed string|undefined by the driver but is always
    // present for a named index; assert non-null so TS is satisfied.
    await collection.dropIndex(existing.name!)
  }

  await collection.createIndex(
    { expiresAt: 1 },
    {
      name: GUEST_SESSION_TTL_INDEX,
      expireAfterSeconds: 0,
    },
  )
}

// ---------------------------------------------------------------------------
// removeConversationTtlIndex
// ---------------------------------------------------------------------------

/**
 * Removes any legacy TTL index on `conversations.expiresAt` that may have
 * been created by an earlier version of the schema.
 *
 * CHANGE:
 *   Added `if (!(await collectionExists("conversations"))) return` at the top.
 *
 * Same root cause as above: calling `collection.indexes()` on a
 * non-existent collection raised NamespaceNotFound before the guard was added.
 * All existing drop logic is unchanged.
 */
async function removeConversationTtlIndex() {
  // Skip on a fresh database.
  if (!(await collectionExists("conversations"))) {
    return
  }

  const collection = (await getPragyaMongoDb()).collection("conversations")
  const indexes = await collection.indexes()
  const ttlIndex = indexes.find((index) => {
    const key = index.key as Record<string, unknown>
    return (
      Object.keys(key).length === 1 &&
      key.expiresAt === 1 &&
      index.expireAfterSeconds === 0
    )
  })

  if (ttlIndex) {
    await collection.dropIndex(ttlIndex.name ?? CONVERSATION_TTL_INDEX)
  }
}

// ---------------------------------------------------------------------------
// pruneDuplicateActiveConversations (internal helper)
// ---------------------------------------------------------------------------

/**
 * Deletes all but the most-recent ACTIVE conversation for each distinct owner
 * (identified by `field`), then removes the now-orphaned messages.
 *
 * CHANGE: None directly.
 * This function is only ever called from ensureCurrentConversationUniqueIndexes(),
 * which now has its own collection-existence guard, so pruneDuplicate… is never
 * reached on a fresh database.  The body is identical to the original.
 */
async function pruneDuplicateActiveConversations(field: "guestSessionId" | "userId") {
  const db = await getPragyaMongoDb()
  const conversations = db.collection("conversations")
  const messages = db.collection("messages")

  const activeConversations = await conversations
    .find(
      {
        [field]: { $ne: null },
        status: "ACTIVE",
      },
      {
        projection: {
          _id: 1,
          [field]: 1,
        },
      },
    )
    .sort({
      [field]: 1,
      updatedAt: -1,
      createdAt: -1,
      _id: -1,
    })
    .toArray()

  const keepByOwner = new Set<string>()
  const duplicateIds = activeConversations
    .filter((conversation) => {
      const ownerId = conversation[field]?.toString()
      if (!ownerId) {
        return false
      }

      if (keepByOwner.has(ownerId)) {
        return true
      }

      keepByOwner.add(ownerId)
      return false
    })
    .map((conversation) => conversation._id)

  if (duplicateIds.length === 0) {
    return
  }

  await messages.deleteMany({
    conversationId: { $in: duplicateIds },
  })

  await conversations.deleteMany({
    _id: { $in: duplicateIds },
  })
}

// ---------------------------------------------------------------------------
// ensureUniquePartialIndex (internal helper)
// ---------------------------------------------------------------------------

/**
 * Idempotently creates (or recreates) a unique partial index on a collection.
 *
 * CHANGE: None directly.
 * All callers that target "conversations" are now guarded upstream by
 * ensureCurrentConversationUniqueIndexes(), so this function is never reached
 * on a fresh database.  The body is identical to the original.
 */
async function ensureUniquePartialIndex(
  collectionName: string,
  indexName: string,
  key: Record<string, 1>,
  partialFilterExpression: Record<string, unknown>,
) {
  const collection = (await getPragyaMongoDb()).collection(collectionName)
  const indexes = await collection.indexes()
  const existing = indexes.find((index) => index.name === indexName)

  if (
    existing &&
    existing.unique === true &&
    JSON.stringify(existing.partialFilterExpression ?? null) ===
      JSON.stringify(partialFilterExpression) &&
    JSON.stringify(existing.key) === JSON.stringify(key)
  ) {
    return
  }

  if (existing) {
    await collection.dropIndex(indexName)
  }

  await collection.createIndex(key, {
    name: indexName,
    unique: true,
    partialFilterExpression,
  })
}

// ---------------------------------------------------------------------------
// ensureCurrentConversationUniqueIndexes
// ---------------------------------------------------------------------------

/**
 * Deduplicates active conversations (prevents duplicate-key errors on index
 * creation) and then creates the two unique partial indexes that enforce the
 * one-active-conversation-per-owner invariant going forward.
 *
 * CHANGE:
 *   Added `if (!(await collectionExists("conversations"))) return` at the top.
 *
 * Both pruneDuplicateActiveConversations() calls and both
 * ensureUniquePartialIndex() calls target "conversations".  A single guard
 * here covers all four callsites, preventing NamespaceNotFound from any of
 * them on a fresh database.
 */
async function ensureCurrentConversationUniqueIndexes() {
  // Skip on a fresh database.
  if (!(await collectionExists("conversations"))) {
    return
  }

  await pruneDuplicateActiveConversations("guestSessionId")
  await pruneDuplicateActiveConversations("userId")

  await ensureUniquePartialIndex(
    "conversations",
    CURRENT_GUEST_CONVERSATION_INDEX,
    { guestSessionId: 1 },
    {
      guestSessionId: { $exists: true, $ne: null },
      status: "ACTIVE",
    },
  )

  await ensureUniquePartialIndex(
    "conversations",
    CURRENT_USER_CONVERSATION_INDEX,
    { userId: 1 },
    {
      userId: { $exists: true, $ne: null },
      status: "ACTIVE",
    },
  )
}

// ---------------------------------------------------------------------------
// cleanupExpiredGuestConversationData
// ---------------------------------------------------------------------------

/**
 * Deletes guest conversations whose guest session has expired or no longer
 * exists, then sweeps up any orphaned messages.
 *
 * CHANGE:
 *   Added an independent existence check for BOTH "conversations" AND
 *   "messages" at the top of the function, returning early if either is
 *   absent.
 *
 * WHY BOTH:
 *   - The first aggregate pipeline does a $lookup from "conversations" into
 *     "guest_sessions"; if "conversations" is missing the pipeline throws.
 *   - The second aggregate pipeline queries "messages" directly; if "messages"
 *     is missing that also throws.
 *   - Using a single combined guard (`||`) means we bail out if either
 *     collection is not yet created, which is the correct safe state.
 *
 * All cleanup logic inside the guards is identical to the original.
 */
export async function cleanupExpiredGuestConversationData() {
  // Both collections must exist before we attempt any reads.
  if (
    !(await collectionExists("conversations")) ||
    !(await collectionExists("messages"))
  ) {
    return
  }

  const db = await getPragyaMongoDb()
  const conversations = db.collection("conversations")
  const messages = db.collection("messages")

  // Type the aggregate result as ObjectId so that the arrays produced by
  // .map(doc => doc._id) are ObjectId[] and satisfy $in's type constraint.
  const expiredGuestConversations = await conversations.aggregate<{ _id: ObjectId }>([
    {
      $match: {
        guestSessionId: { $ne: null },
        userId: null,
      },
    },
    {
      $lookup: {
        from: "guest_sessions",
        localField: "guestSessionId",
        foreignField: "_id",
        as: "guestSession",
      },
    },
    {
      $match: {
        $expr: {
          $or: [
            {
              $eq: [{ $size: "$guestSession" }, 0],
            },
            {
              $lte: [{ $arrayElemAt: ["$guestSession.expiresAt", 0] }, new Date()],
            },
          ],
        },
      },
    },
    {
      $project: {
        _id: 1,
      },
    },
  ]).toArray()

  const expiredConversationIds = expiredGuestConversations.map((doc) => doc._id)

  if (expiredConversationIds.length > 0) {
    await messages.deleteMany({
      conversationId: { $in: expiredConversationIds },
    })

    await conversations.deleteMany({
      _id: { $in: expiredConversationIds },
    })
  }

  const orphanMessages = await messages.aggregate<{ _id: ObjectId }>([
    {
      $lookup: {
        from: "conversations",
        localField: "conversationId",
        foreignField: "_id",
        as: "conversation",
      },
    },
    {
      $match: {
        $expr: {
          $eq: [{ $size: "$conversation" }, 0],
        },
      },
    },
    {
      $project: {
        _id: 1,
      },
    },
  ]).toArray()

  const orphanMessageIds = orphanMessages.map((doc) => doc._id)
  if (orphanMessageIds.length > 0) {
    await messages.deleteMany({
      _id: { $in: orphanMessageIds },
    })
  }
}

// ---------------------------------------------------------------------------
// ensurePragyaMongoMaintenance — public entry point
// ---------------------------------------------------------------------------

/**
 * Called once per process lifetime via a global singleton promise.  Runs all
 * four maintenance steps in sequence.
 *
 * CHANGE: None to the orchestration logic itself.
 * Because each step now guards itself with collectionExists(), the entire
 * chain completes successfully on a fresh database (all steps return early)
 * and does real work only once the collections have been created by the first
 * chat write.
 *
 * The error handler still clears the cached promise so that the next incoming
 * request will retry maintenance — unchanged from the original.
 */
export function ensurePragyaMongoMaintenance() {
  if (!globalForPragyaMongo.pragyaMongoInitPromise) {
    globalForPragyaMongo.pragyaMongoInitPromise = (async () => {
      await ensureGuestSessionTtlIndex()
      await removeConversationTtlIndex()
      await ensureCurrentConversationUniqueIndexes()
      await cleanupExpiredGuestConversationData()
    })().catch((error) => {
      console.error("Failed to initialize Pragya Mongo cleanup:", error)
      // Clear the singleton so the next request retries.
      globalForPragyaMongo.pragyaMongoInitPromise = undefined
      throw error
    })
  }

  return globalForPragyaMongo.pragyaMongoInitPromise
}
