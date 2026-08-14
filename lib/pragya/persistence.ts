import { NextRequest } from "next/server"
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

export function extractGuestToken(req: NextRequest): string | null {
  const cookieToken = req.cookies.get(PRAGYA_GUEST_TOKEN_COOKIE)?.value ?? null
  if (cookieToken) {
    return cookieToken
  }
  const authHeader = req.headers.get("authorization")
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.substring(7).trim() || null
  }
  return null
}

export function isAndroidRequest(req: NextRequest): boolean {
  const platformHeader = req.headers.get("x-platform") || req.headers.get("x-client-platform")
  if (platformHeader?.toUpperCase() === "ANDROID") {
    return true
  }
  const authHeader = req.headers.get("authorization")
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    return true
  }
  return false
}

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
  limitReached?: boolean
  sessionExpired?: boolean
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

async function createGuestSession(guestToken: string, platform: Platform = Platform.WEB) {
  return prisma.guestSession.create({
    data: {
      sessionToken: guestToken,
      status: GuestStatus.ACTIVE,
      trialConsumed: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      platform,
    },
  })
}

export async function issueGuestSessionToken(platform: Platform = Platform.WEB) {
  const guestToken = randomUUID()
  const guestSession = await createGuestSession(guestToken, platform)
  return guestSession.sessionToken
}

async function ensureGuestSession(guestToken?: string | null, platform: Platform = Platform.WEB) {
  const token = normalizeToken(guestToken) ?? randomUUID()
  const existing = await getGuestSessionByToken(token)

  if (existing) {
    return { guestSession: existing, created: false, guestToken: token }
  }

  const guestSession = await createGuestSession(token, platform)
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

export async function resolveGuestChatContext(guestToken?: string | null, platform: Platform = Platform.WEB) {
  const { guestSession, created, guestToken: normalizedGuestToken } = await ensureGuestSession(guestToken, platform)

  const isExpired = guestSession.expiresAt < new Date() || guestSession.status === GuestStatus.EXPIRED
  const isLimitReached = guestSession.trialConsumed || guestSession.status === GuestStatus.LOCKED

  if (isExpired || isLimitReached) {
    if (isExpired && guestSession.status !== GuestStatus.EXPIRED) {
      try {
        await prisma.guestSession.update({
          where: { id: guestSession.id },
          data: { status: GuestStatus.EXPIRED }
        })
      } catch (e) {
        console.warn("Failed to update guest session status to EXPIRED:", e)
      }
    }

    return {
      guestToken: normalizedGuestToken,
      guestSessionId: guestSession.id,
      conversationId: null,
      createdGuestSession: created,
      createdConversation: false,
      status: isExpired ? GuestStatus.EXPIRED : guestSession.status,
      trialConsumed: guestSession.trialConsumed,
      requiresLogin: true,
      limitReached: isLimitReached,
      sessionExpired: isExpired,
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
      limitReached: false,
      sessionExpired: false,
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
    limitReached: false,
    sessionExpired: false,
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
      _id: new ObjectId(conversation.id),
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

async function createAuthenticatedConversation(userId: string) {
  await prisma.conversation.updateMany({
    where: {
      userId,
      status: ConversationStatus.ACTIVE,
    },
    data: {
      status: ConversationStatus.DELETED,
    },
  })

  return prisma.conversation.create({
    data: {
      userId,
      status: ConversationStatus.ACTIVE,
      platform: Platform.WEB,
      lastMessageAt: new Date(),
    },
  })
}

export async function resolveChatContext(params: {
  userId?: string | null
  guestToken?: string | null
  platform?: Platform
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

  const guest = await resolveGuestChatContext(params.guestToken, params.platform)
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
  action?: unknown
}) {
  await prisma.message.create({
    data: {
      conversationId: params.conversationId,
      role: params.role === "user" ? MessageRole.USER : MessageRole.ASSISTANT,
      content: params.content,
      action: params.action ? (params.action as any) : null,
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
    select: {
      content: true,
      createdAt: true,
    },
  })
}
