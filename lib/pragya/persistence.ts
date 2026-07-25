import { randomUUID } from "crypto"
import {
  ConversationStatus,
  GuestStatus,
  MessageRole,
  Platform,
} from "@prisma/client"
import { ObjectId } from "mongodb"
import { prisma } from "@/lib/prisma"
import { getPragyaMongoDb } from "@/lib/pragya/mongo-init"

export const PRAGYA_GUEST_TOKEN_COOKIE = "pragya_guest_token"

type ChatRole = "user" | "assistant"

type GuestChatContext = {
  guestToken: string
  guestSessionId: string
  conversationId: string | null
  createdGuestSession: boolean
  createdConversation: boolean
  status: GuestStatus
  trialConsumed: boolean
  requiresLogin: boolean
}

type UserChatContext = {
  userId: string
  conversationId: string | null
}

export type ChatContext =
  | { kind: "user"; user: UserChatContext }
  | { kind: "guest"; guest: GuestChatContext }

function normalizeToken(token?: string | null) {
  const trimmed = token?.trim()
  return trimmed ? trimmed : null
}

async function getGuestSessionByToken(guestToken: string) {
  return prisma.guestSession.findUnique({
    where: { sessionToken: guestToken },
  })
}

async function createGuestSession(guestToken: string) {
  return prisma.guestSession.create({
    data: {
      sessionToken: guestToken,
      status: GuestStatus.ACTIVE,
      trialConsumed: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  })
}

export async function issueGuestSessionToken() {
  const guestToken = randomUUID()
  const guestSession = await createGuestSession(guestToken)
  return guestSession.sessionToken
}

async function ensureGuestSession(guestToken?: string | null) {
  const token = normalizeToken(guestToken) ?? randomUUID()
  const existing = await getGuestSessionByToken(token)

  if (existing) {
    return { guestSession: existing, created: false, guestToken: token }
  }

  const guestSession = await createGuestSession(token)
  return { guestSession, created: true, guestToken: guestSession.sessionToken }
}

function isDuplicateKeyError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  )
}

async function getConversationById(conversationId: string) {
  return prisma.conversation.findUnique({
    where: { id: conversationId },
  })
}

async function getOrCreateActiveConversation(params: {
  ownerKind: "guest" | "user"
  ownerId: string
  guestPlatform?: Platform
}) {
  const db = await getPragyaMongoDb()
  const conversations = db.collection("conversations")
  const now = new Date()
  const ownerObjectId = new ObjectId(params.ownerId)
  const setOnInsert: Record<string, unknown> = {
    status: ConversationStatus.ACTIVE,
    title: null,
    platform: params.guestPlatform ?? Platform.WEB,
    expiresAt: params.ownerKind === "guest" ? new Date(now.getTime() + 24 * 60 * 60 * 1000) : null,
    claimedAt: null,
    lastMessageAt: now,
    createdAt: now,
    updatedAt: now,
  }

  if (params.ownerKind === "guest") {
    setOnInsert.guestSessionId = ownerObjectId
    setOnInsert.userId = null
  } else {
    setOnInsert.userId = ownerObjectId
    setOnInsert.guestSessionId = null
  }

  try {
    const result = await conversations.findOneAndUpdate(
      params.ownerKind === "guest"
        ? {
            guestSessionId: ownerObjectId,
            status: ConversationStatus.ACTIVE,
          }
        : {
            userId: ownerObjectId,
            status: ConversationStatus.ACTIVE,
          },
      {
        $setOnInsert: setOnInsert,
      },
      {
        upsert: true,
        returnDocument: "after",
        projection: {
          _id: 1,
        },
      },
    )

    const conversationId = result?._id?.toString()
    if (!conversationId) {
      return null
    }

    return getConversationById(conversationId)
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      const existing = await prisma.conversation.findFirst({
        where:
          params.ownerKind === "guest"
            ? {
                guestSessionId: params.ownerId,
                status: ConversationStatus.ACTIVE,
              }
            : {
                userId: params.ownerId,
                status: ConversationStatus.ACTIVE,
              },
        orderBy: {
          updatedAt: "desc",
        },
      })

      if (existing) {
        return existing
      }
    }

    throw error
  }
}

export async function resolveGuestChatContext(guestToken?: string | null) {
  const { guestSession, created, guestToken: normalizedGuestToken } = await ensureGuestSession(guestToken)

  if (guestSession.status === GuestStatus.LOCKED || guestSession.trialConsumed) {
    return {
      guestToken: normalizedGuestToken,
      guestSessionId: guestSession.id,
      conversationId: null,
      createdGuestSession: created,
      createdConversation: false,
      status: guestSession.status,
      trialConsumed: guestSession.trialConsumed,
      requiresLogin: true,
    } satisfies GuestChatContext
  }

  const conversation = await getOrCreateActiveConversation({
    ownerKind: "guest",
    ownerId: guestSession.id,
    guestPlatform: guestSession.platform,
  })

  if (!conversation) {
    return {
      guestToken: normalizedGuestToken,
      guestSessionId: guestSession.id,
      conversationId: null,
      createdGuestSession: created,
      createdConversation: false,
      status: guestSession.status,
      trialConsumed: guestSession.trialConsumed,
      requiresLogin: false,
    } satisfies GuestChatContext
  }

  return {
    guestToken: normalizedGuestToken,
    guestSessionId: guestSession.id,
    conversationId: conversation.id,
    createdGuestSession: created,
    createdConversation: true,
    status: guestSession.status,
    trialConsumed: guestSession.trialConsumed,
    requiresLogin: false,
  } satisfies GuestChatContext
}

export async function transferGuestConversationToUser(params: {
  guestToken: string
  conversationId: string
  userId: string
}) {
  const conversation = await getConversationById(params.conversationId)
  const guestSession = await getGuestSessionByToken(params.guestToken)

  if (!conversation) {
    return null
  }

  if (conversation.userId !== null) {
    if (guestSession) {
      await prisma.guestSession.deleteMany({
        where: { id: guestSession.id },
      })
    }
    return conversation
  }

  if (!guestSession) {
    return null
  }

  if (conversation.guestSessionId !== guestSession.id) {
    return null
  }

  const db = await getPragyaMongoDb()
  const conversations = db.collection("conversations")
  const now = new Date()

  const transferResult = await conversations.updateOne(
    {
      _id: conversation.id,
      guestSessionId: guestSession.id,
      userId: null,
      status: ConversationStatus.ACTIVE,
    },
    {
      $set: {
        userId: params.userId,
        guestSessionId: null,
        expiresAt: null,
        claimedAt: now,
        updatedAt: now,
        status: ConversationStatus.ACTIVE,
      },
    },
  )

  if (transferResult.matchedCount === 0) {
    const latestConversation = await getConversationById(params.conversationId)

    if (
      latestConversation?.userId === params.userId &&
      latestConversation.guestSessionId === null
    ) {
      return latestConversation
    }

    return null
  }

  const updatedConversation = await getConversationById(params.conversationId)

  if (!updatedConversation) {
    return null
  }

  await prisma.guestSession.deleteMany({
    where: {
      id: guestSession.id,
    },
  })

  return updatedConversation
}

export async function startFreshAuthenticatedConversation(params: {
  userId: string
  guestToken?: string | null
}) {
  const guestToken = normalizeToken(params.guestToken)

  if (guestToken) {
    const guestSession = await getGuestSessionByToken(guestToken)

    if (guestSession) {
      const activeConversation = await prisma.conversation.findFirst({
        where: {
          guestSessionId: guestSession.id,
          status: ConversationStatus.ACTIVE,
        },
        orderBy: {
          updatedAt: "desc",
        },
      })

      if (activeConversation) {
        await prisma.conversation.delete({
          where: { id: activeConversation.id },
        })
      }

      await prisma.conversation.deleteMany({
        where: {
          guestSessionId: guestSession.id,
        },
      })

      await prisma.guestSession.delete({
        where: { id: guestSession.id },
      })
    }
  }

  return createAuthenticatedConversation(params.userId)
}

export async function resolveChatContext(params: {
  userId?: string | null
  guestToken?: string | null
}) : Promise<ChatContext> {
  if (params.userId) {
    const conversation = await getOrCreateActiveConversation({
      ownerKind: "user",
      ownerId: params.userId,
    })

    return {
      kind: "user",
      user: {
        userId: params.userId,
        conversationId: conversation?.id ?? null,
      },
    }
  }

  const guest = await resolveGuestChatContext(params.guestToken)
  return { kind: "guest", guest }
}

export async function lockGuestSession(guestToken: string) {
  return prisma.guestSession.update({
    where: { sessionToken: guestToken },
    data: {
      trialConsumed: true,
      status: GuestStatus.LOCKED,
      consumedAt: new Date(),
    },
  })
}

export async function appendMessage(params: {
  conversationId: string
  role: ChatRole
  content: string
}) {
  await prisma.message.create({
    data: {
      conversationId: params.conversationId,
      role: params.role === "user" ? MessageRole.USER : MessageRole.ASSISTANT,
      content: params.content,
    },
  })

  await prisma.conversation.update({
    where: { id: params.conversationId },
    data: {
      lastMessageAt: new Date(),
    },
  })
}

export async function getUserChatMessages(userId: string, limit = 100) {
  return prisma.message.findMany({
    where: {
      conversation: {
        is: {
          userId,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    take: limit,
  })
}

export async function getGuestChatMessages(guestToken: string, limit = 100) {
  return prisma.message.findMany({
    where: {
      conversation: {
        is: {
          guestSession: {
            is: {
              sessionToken: guestToken,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    take: limit,
  })
}

export async function getUserMessagesByRoleSince(
  userId: string,
  role: ChatRole,
  createdAtGte?: Date,
  limit = 30,
) {
  const prismaRole = role === "user" ? MessageRole.USER : MessageRole.ASSISTANT

  return prisma.message.findMany({
    where: {
      role: prismaRole,
      ...(createdAtGte ? { createdAt: { gte: createdAtGte } } : {}),
      conversation: {
        is: {
          userId,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  })
}
