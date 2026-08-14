import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { Platform } from "@prisma/client"
import {
  PRAGYA_GUEST_TOKEN_COOKIE,
  resolveChatContext,
  extractGuestToken,
  isAndroidRequest,
} from "@/lib/pragya/persistence"

export async function POST(req: NextRequest) {
  const session = await auth()
  const guestToken = extractGuestToken(req)
  const isAndroid = isAndroidRequest(req)

  const platformHeader = req.headers.get("x-platform") || req.headers.get("x-client-platform")
  const platform = platformHeader?.toUpperCase() === "ANDROID" ? Platform.ANDROID : Platform.WEB

  const context = await resolveChatContext({
    userId: session?.user?.id ?? null,
    guestToken,
    platform,
  })

  const response = NextResponse.json(
    context.kind === "user"
      ? {
          userId: context.user.userId,
          conversationId: context.user.conversationId,
        }
      : context.guest.requiresLogin
        ? {
            requiresLogin: true,
            requiresSignIn: true,
            limitReached: context.guest.limitReached || false,
            sessionExpired: context.guest.sessionExpired || false,
          }
        : {
            conversationId: context.guest.conversationId,
            ...(isAndroid ? { guestToken: context.guest.guestToken } : {}),
          },
  )

  if (context.kind === "guest" && !context.guest.requiresLogin && !isAndroid) {
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
