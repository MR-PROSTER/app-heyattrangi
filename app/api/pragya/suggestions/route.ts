import { NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { getPragyaUpstreamBase } from "@/lib/pragya/upstream"

export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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
  if (typeof session_id !== "string" || !session_id.trim()) {
    return NextResponse.json({ error: "session_id is required" }, { status: 400 })
  }

  try {
    const upstream = await fetch(`${getPragyaUpstreamBase()}/suggestions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: session_id.trim(),
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
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch suggestions" }, { status: 500 })
  }
}
