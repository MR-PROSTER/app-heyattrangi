import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth.config"
import {
  PRAGYA_GUEST_TOKEN_COOKIE,
  resolveChatContext,
} from "@/lib/pragya/persistence"

export async function POST(req: NextRequest) {
  const session = await auth()
  const guestToken = req.cookies.get(PRAGYA_GUEST_TOKEN_COOKIE)?.value ?? null
  const context = await resolveChatContext({
    userId: session?.user?.id ?? null,
    guestToken,
  })

  const response = NextResponse.json(
    context.kind === "user"
      ? {
          userId: context.user.userId,
          conversationId: context.user.conversationId,
        }
      : context.guest.requiresLogin
        ? { requiresLogin: true }
        : { conversationId: context.guest.conversationId },
  )

  if (context.kind === "guest" && !context.guest.requiresLogin) {
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
