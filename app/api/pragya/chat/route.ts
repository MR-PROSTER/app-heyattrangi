import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"
import { getPragyaUpstreamBase } from "@/lib/pragya/upstream"
import {
  PRAGYA_GUEST_TOKEN_COOKIE,
  appendMessage,
  resolveChatContext,
} from "@/lib/pragya/persistence"
import { getMemoryGraph, upsertMemoryGraph } from "@/lib/pragya/memory"

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

  const { message, generate_suggestions, client_time } = body as Record<string, unknown>
  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "message is required" }, { status: 400 })
  }

  const nameToUse = ""
  const finalChatCount = 0
  let plan = "FREE"
  let conversationId: string | null = null
  let resolvedGuestToken: string | null = null
  let preferredLanguage = "English"

  if (session?.user?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { patient: true },
    })
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    plan = dbUser.plan
    if (dbUser.patient?.preferredLanguage) {
      preferredLanguage = dbUser.patient.preferredLanguage
    }
  }

  const context = await resolveChatContext({
    userId: session?.user?.id ?? null,
    guestToken: req.cookies.get(PRAGYA_GUEST_TOKEN_COOKIE)?.value ?? null,
  })

  if (context.kind === "user") {
    conversationId = context.user.conversationId
  } else {
    if (context.guest.requiresLogin) {
      return NextResponse.json({ requiresLogin: true })
    }
    conversationId = context.guest.conversationId
    resolvedGuestToken = context.guest.guestToken
  }

  if (!conversationId) {
    return NextResponse.json({ error: "Failed to resolve conversation" }, { status: 500 })
  }

  // ── Save user message to MongoDB ──
  try {
    await appendMessage({
      conversationId,
      role: "user",
      content: message.trim(),
    })
  } catch (error) {
    console.warn("Failed to save user message to DB:", error)
  }

  // ── Load last 30 messages for bot context ──
  let conversationHistory: { role: string; content: string }[] = []
  try {
    const msgs = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: 30,
      select: { role: true, content: true },
    })
    conversationHistory = msgs.map((m) => ({
      role: m.role === "USER" ? "user" : "assistant",
      content: m.content,
    }))
  } catch (e) {
    console.warn("Failed to load conversation history:", e)
  }

  // ── Load memory graph (logged-in users only) ──
  let memoryGraph = {}
  if (session?.user?.id) {
    try {
      memoryGraph = await getMemoryGraph(session.user.id)
    } catch (e) {
      console.warn("Failed to load memory graph:", e)
    }
  }

  // ── Load past assessments ──
  let pastAssessments: unknown[] = []
  if (session?.user?.id) {
    try {
      const db = prisma as unknown as Record<string, { findMany: (args: unknown) => Promise<unknown[]> }>
      pastAssessments = await db["patientAssessmentResult"].findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      })
    } catch (dbError) {
      console.warn("Could not fetch past assessments:", dbError)
    }
  }

  // ── Call Hugging Face bot ──
  let upstream: Response
  try {
    upstream = await fetch(`${getPragyaUpstreamBase()}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(90_000), // 90s hard timeout
      body: JSON.stringify({
        session_id: session?.user?.id
          ? `patient_${session.user.id}`
          : resolvedGuestToken ?? "",
        user_id: session?.user?.id
          ? String(session.user.id)
          : (resolvedGuestToken ? String(resolvedGuestToken) : String(conversationId)),
        client_time: typeof client_time === "string" && client_time.trim()
          ? client_time
          : new Date().toISOString(),
        message: message.trim(),
        user_name: nameToUse,
        language: preferredLanguage,
        generate_suggestions:
          typeof generate_suggestions === "boolean" ? generate_suggestions : true,
        conversation_history: conversationHistory,
        memory_graph: memoryGraph,
        past_assessments: (pastAssessments as Array<{ assessmentId?: string; date?: string; results?: unknown }>).map((pa) => ({
          assessmentId: pa.assessmentId,
          date: pa.date,
          results: pa.results,
        })),
      }),
    })
  } catch (fetchErr) {
    console.error("Failed to reach Pragya upstream:", fetchErr)
    return NextResponse.json(
      { error: "Could not reach the assistant. Please try again in a moment." },
      { status: 503 },
    )
  }

  const text = await upstream.text()

  if (!upstream.ok) {
    return NextResponse.json(
      { error: text || "Upstream chat request failed" },
      { status: upstream.status >= 400 ? upstream.status : 502 },
    )
  }

  try {
    const data = JSON.parse(text) as {
      reply?: string
      blocks?: Array<{ text: string; phase?: string }>
      expression?: string
      suggestions?: string[]
      updated_memory_graph?: Record<string, unknown>
    }

    // HF Space returns blocks[0].text — normalise to reply for the frontend
    if (!data.reply && data.blocks && data.blocks.length > 0) {
      data.reply = data.blocks.map((b) => b.text).join(" ").trim()
    }

    // ── Save assistant reply to MongoDB ──
    if (data.reply && conversationId) {
      try {
        await appendMessage({
          conversationId,
          role: "assistant",
          content: data.reply,
        })
      } catch (error) {
        console.warn("Failed to save assistant message to DB:", error)
      }
    }

    // ── Save updated memory graph back to MongoDB ──
    if (data.updated_memory_graph && session?.user?.id) {
      try {
        await upsertMemoryGraph(session.user.id, data.updated_memory_graph)
      } catch (e) {
        console.warn("Failed to save memory graph:", e)
      }
    }

    const response = NextResponse.json({
      ...data,
      currentCount: finalChatCount,
      plan,
    })

    if (resolvedGuestToken) {
      response.cookies.set(PRAGYA_GUEST_TOKEN_COOKIE, resolvedGuestToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      })
    }

    return response
  } catch {
    const response = NextResponse.json(
      { error: "Invalid upstream response" },
      { status: 502 },
    )
    if (resolvedGuestToken) {
      response.cookies.set(PRAGYA_GUEST_TOKEN_COOKIE, resolvedGuestToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      })
    }
    return response
  }
}
