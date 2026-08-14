import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { getPragyaUpstreamBase } from "@/lib/pragya/upstream"
import {
  PRAGYA_GUEST_TOKEN_COOKIE,
  resolveChatContext,
  extractGuestToken,
  isAndroidRequest,
} from "@/lib/pragya/persistence"

export async function POST(req: NextRequest) {
  const session = await auth()
  
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Expected JSON object" }, { status: 400 })
  }

  const { session_id } = body as Record<string, unknown>
  const guestToken = extractGuestToken(req)
  const isAndroid = isAndroidRequest(req)

  const context = await resolveChatContext({
    userId: session?.user?.id ?? null,
    guestToken,
  })

  try {
    if (context.kind === "guest" && context.guest.requiresLogin) {
      return NextResponse.json({
        requiresLogin: true,
        requiresSignIn: true,
        limitReached: context.guest.limitReached || false,
        sessionExpired: context.guest.sessionExpired || false,
      })
    }

    const upstreamSessionId =
      context.kind === "user"
        ? (typeof session_id === "string" && session_id.trim() ? session_id.trim() : `patient_${context.user.userId}`)
        : context.guest.guestToken

    const upstream = await fetch(`${getPragyaUpstreamBase()}/suggestions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: upstreamSessionId,
      }),
    })

    const text = await upstream.text()
    if (!upstream.ok) {
      return NextResponse.json(
        { error: text || "Upstream suggestions request failed" },
        { status: upstream.status >= 400 ? upstream.status : 502 },
      )
    }

    const data = JSON.parse(text)
    const response = NextResponse.json({
      ...data,
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch suggestions"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
