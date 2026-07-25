import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth.config"
import {
  PRAGYA_GUEST_TOKEN_COOKIE,
  getGuestChatMessages,
  getUserChatMessages,
  resolveChatContext,
} from "@/lib/pragya/persistence"

export async function GET(req: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    const guestToken = req.cookies.get(PRAGYA_GUEST_TOKEN_COOKIE)?.value ?? null
    const context = await resolveChatContext({ guestToken })
    const messages = await getGuestChatMessages(context.kind === "guest" ? context.guest.guestToken : "")

    const response = NextResponse.json({
      messages,
    })

    if (context.kind === "guest") {
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
