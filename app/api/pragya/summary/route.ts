import { NextRequest, NextResponse } from "next/server"
import { getPragyaUpstreamBase } from "@/lib/pragya/upstream"
import {
  PRAGYA_GUEST_TOKEN_COOKIE,
  lockGuestSession,
  resolveChatContext,
} from "@/lib/pragya/persistence"

export async function POST(req: NextRequest) {
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
  const context = await resolveChatContext({
    guestToken: req.cookies.get(PRAGYA_GUEST_TOKEN_COOKIE)?.value ?? null,
  })

  if (context.kind === "guest" && context.guest.requiresLogin) {
    return NextResponse.json({ requiresLogin: true })
  }

  const upstream = await fetch(`${getPragyaUpstreamBase()}/summary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id:
        context.kind === "user"
          ? (typeof session_id === "string" && session_id.trim() ? session_id.trim() : `patient_${context.user.userId}`)
          : context.guest.guestToken,
    }),
  })

  const text = await upstream.text()
  if (!upstream.ok) {
    return NextResponse.json(
      { error: text || "Upstream summary request failed" },
      { status: upstream.status >= 400 ? upstream.status : 502 },
    )
  }

  try {
    const data = JSON.parse(text) as { report?: string }
    if (context.kind === "guest") {
      await lockGuestSession(context.guest.guestToken)
    }

    const response = NextResponse.json({
      ...data,
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
  } catch {
    return NextResponse.json({ error: "Invalid upstream response" }, { status: 502 })
  }
}
