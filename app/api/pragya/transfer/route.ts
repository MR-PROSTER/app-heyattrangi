import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { issueGuestSessionToken } from "@/lib/pragya/persistence"
import {
  PRAGYA_GUEST_TOKEN_COOKIE,
  startFreshAuthenticatedConversation,
  transferGuestConversationToUser,
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
  const token = req.cookies.get(PRAGYA_GUEST_TOKEN_COOKIE)?.value?.trim() || null
  const targetConversationId =
    typeof conversationId === "string" && conversationId.trim()
      ? conversationId.trim()
      : null

  if (normalizedAction !== "continue" && normalizedAction !== "start_fresh") {
    return NextResponse.json({ error: "action must be continue or start_fresh" }, { status: 400 })
  }

  let conversationId: string | null = null

  if (normalizedAction === "continue") {
    if (!token) {
      return NextResponse.json({ error: "guest session cookie is required for continue" }, { status: 400 })
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

    conversationId = transferred.id
  } else {
    const freshConversation = await startFreshAuthenticatedConversation({
      userId: session.user.id,
      guestToken: token,
    })

    conversationId = freshConversation.id
  }

  const response = NextResponse.json({
    success: true,
    action: normalizedAction,
    conversationId,
  })

  if (token) {
    const rotatedGuestToken = await issueGuestSessionToken()
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
