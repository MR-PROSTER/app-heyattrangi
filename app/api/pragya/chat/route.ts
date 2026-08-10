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

  const { message, generate_suggestions, client_time, is_new_session } = body as Record<string, unknown>
  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "message is required" }, { status: 400 })
  }

  // --- Multilingual Setup: Translate user message to English ---
  let userMessageEnglish = message.trim();
  let detectedLang = 'en';

  try {
    const translateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(message.trim())}`;
    const transRes = await fetch(translateUrl);
    if (transRes.ok) {
      const data = await transRes.json();
      if (data && data[0]) {
        userMessageEnglish = data[0].map((item: any) => item[0]).join("");
      }
      if (data && data[2]) {
        detectedLang = data[2];
      }
    }
  } catch (error) {
    console.error("Failed to translate user message, falling back to original:", error);
  }

  // Name is not passed to AI to avoid overuse or asking for name
  const nameToUse = "";
  const finalChatCount = 0;
  let plan = "FREE";
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

  let context: Awaited<ReturnType<typeof resolveChatContext>>
  try {
    context = await resolveChatContext({
      userId: session?.user?.id ?? null,
      guestToken: req.cookies.get(PRAGYA_GUEST_TOKEN_COOKIE)?.value ?? null,
    })
  } catch (ctxErr) {
    console.error("resolveChatContext failed:", ctxErr)
    return NextResponse.json(
      { error: "Could not reach the assistant. Please try again in a moment." },
      { status: 503 },
    )
  }

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

  // DEBUG - REMOVE AFTER TESTING
  console.log("--- [DEBUG Next.js Route] INCOMING CHAT REQUEST ---");
  console.log("Session ID:", session?.user?.id || resolvedGuestToken || conversationId);
  console.log("User message:", message);
  console.log("Upstream URL:", `${getPragyaUpstreamBase()}/chat`);
  // END DEBUG

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
        message: userMessageEnglish,
        user_name: nameToUse,
        language: preferredLanguage,
        generate_suggestions:
          typeof generate_suggestions === "boolean" ? generate_suggestions : true,
        is_new_session: is_new_session === true,
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
      action?: Record<string, unknown>
    }

    // HF Space returns blocks[0].text — normalise to reply for the frontend
    if (!data.reply && data.blocks && data.blocks.length > 0) {
      data.reply = data.blocks.map((b) => b.text).join(" ").trim()
    }

    // FIX: Unwrap nested/raw JSON strings returned by the HuggingFace backend
    if (data.reply && typeof data.reply === "string" && data.reply.trim().startsWith("{")) {
      try {
        const parsedNested = JSON.parse(data.reply);
        
        // Grab the most likely string response if it's nested
        if (parsedNested.reply) {
          data.reply = parsedNested.reply;
        } else if (parsedNested.response) {
          data.reply = parsedNested.response;
        } else if (parsedNested.text) {
          data.reply = parsedNested.text;
        } else {
          // Fallback to the first long string value
          const possibleReply = Object.values(parsedNested).find(v => typeof v === 'string' && v.length > 5);
          if (possibleReply) {
            data.reply = possibleReply as string;
          }
        }
        
        // Ensure expression is bubbled up if available
        if (parsedNested.expression && !data.expression) {
          data.expression = parsedNested.expression;
        }
      } catch (e) {
        // Not a valid JSON string, leave it alone
      }
    }

    // --- Multilingual Setup: Translate bot response back to user's native language ---
    if (data.reply && detectedLang && detectedLang !== 'en') {
      try {
        const backTranslateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${detectedLang}&dt=t&q=${encodeURIComponent(data.reply)}`;
        const backTransRes = await fetch(backTranslateUrl);
        if (backTransRes.ok) {
          const transData = await backTransRes.json();
          if (transData && transData[0]) {
            data.reply = transData[0].map((item: any) => item[0]).join("");
          }
        }
        
        // Also translate suggestions if any
        if (data.suggestions && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
          for (let i = 0; i < data.suggestions.length; i++) {
             const suggUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${detectedLang}&dt=t&q=${encodeURIComponent(data.suggestions[i])}`;
             const suggRes = await fetch(suggUrl);
             if (suggRes.ok) {
                const sData = await suggRes.json();
                if (sData && sData[0]) {
                   data.suggestions[i] = sData[0].map((item: any) => item[0]).join("");
                }
             }
          }
        }
      } catch (error) {
        console.error("Failed to translate bot response, falling back to English:", error);
      }
    }

    // ── Save assistant reply to MongoDB ──
    if (data.reply && conversationId) {
      try {
        await appendMessage({
          conversationId,
          role: "assistant",
          content: data.reply,
          action: data.action,
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
