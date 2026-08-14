import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth.config"
import {
  PRAGYA_GUEST_TOKEN_COOKIE,
  getGuestChatMessages,
  getUserChatMessages,
  resolveChatContext,
  extractGuestToken,
  isAndroidRequest,
} from "@/lib/pragya/persistence"

export async function GET(req: NextRequest) {
  const session = await auth()
  const guestToken = extractGuestToken(req)
  const isAndroid = isAndroidRequest(req)

  if (!session?.user?.id) {
    const context = await resolveChatContext({ guestToken })
    if (context.kind === "guest" && context.guest.requiresLogin) {
      return NextResponse.json({
        requiresLogin: true,
        requiresSignIn: true,
        limitReached: context.guest.limitReached || false,
        sessionExpired: context.guest.sessionExpired || false,
      })
    }

    const messages = await getGuestChatMessages(context.kind === "guest" ? context.guest.guestToken : "")

    const response = NextResponse.json({
      messages,
    })

    if (context.kind === "guest" && !isAndroid) {
      response.cookies.set(PRAGYA_GUEST_TOKEN_COOKIE, context.guest.guestToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      })
    }

    return response
  }

  try {
    const messages = await getUserChatMessages(session.user.id, 100)

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Failed to fetch chat history:", error)
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 })
  }
}
