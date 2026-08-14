import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { Platform } from "@prisma/client"
import {
  PRAGYA_GUEST_TOKEN_COOKIE,
  startFreshAuthenticatedConversation,
  transferGuestConversationToUser,
  extractGuestToken,
  isAndroidRequest,
  issueGuestSessionToken,
} from "@/lib/pragya/persistence"

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    body = {}
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Expected JSON object" }, { status: 400 })
  }

  const { action, conversationId } = body as Record<string, unknown>
  const normalizedAction = typeof action === "string" ? action.trim().toLowerCase() : ""
  const token = extractGuestToken(req)
  const isAndroid = isAndroidRequest(req)
  const targetConversationId =
    typeof conversationId === "string" && conversationId.trim()
      ? conversationId.trim()
      : null

  if (normalizedAction !== "continue" && normalizedAction !== "start_fresh") {
    return NextResponse.json({ error: "action must be continue or start_fresh" }, { status: 400 })
  }

  let resolvedConversationId: string | null = null

  if (normalizedAction === "continue") {
    if (!token) {
      return NextResponse.json({ error: "guest token is required for continue" }, { status: 400 })
    }

    if (!targetConversationId) {
      return NextResponse.json(
        { error: "conversationId is required for continue" },
        { status: 400 },
      )
    }

    const transferred = await transferGuestConversationToUser({
      guestToken: token,
      conversationId: targetConversationId,
      userId: session.user.id,
    })

    if (!transferred) {
      return NextResponse.json({ error: "Guest conversation not found" }, { status: 404 })
    }

    resolvedConversationId = transferred.id
  } else {
    const freshConversation = await startFreshAuthenticatedConversation({
      userId: session.user.id,
      guestToken: token,
    })

    resolvedConversationId = freshConversation.id
  }

  let rotatedGuestToken: string | null = null
  if (token) {
    rotatedGuestToken = await issueGuestSessionToken(isAndroid ? Platform.ANDROID : Platform.WEB)
  }

  const response = NextResponse.json({
    success: true,
    action: normalizedAction,
    conversationId: resolvedConversationId,
    ...(isAndroid && rotatedGuestToken ? { guestToken: rotatedGuestToken } : {}),
  })

  if (token && !isAndroid && rotatedGuestToken) {
    response.cookies.set(PRAGYA_GUEST_TOKEN_COOKIE, rotatedGuestToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    })
  }

  return response
}
