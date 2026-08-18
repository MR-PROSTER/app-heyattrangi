import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"
import { getPragyaUpstreamBase } from "@/lib/pragya/upstream"
import { Platform } from "@prisma/client"
import {
  PRAGYA_GUEST_TOKEN_COOKIE,
  appendMessage,
  resolveChatContext,
  extractGuestToken,
  isAndroidRequest,
} from "@/lib/pragya/persistence"
import { getMemoryGraph, upsertMemoryGraph } from "@/lib/pragya/memory"
import { enforceLimit, checkConcurrency } from "@/lib/limits/checkLimits"

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

  const guestToken = extractGuestToken(req)
  const isAndroid = isAndroidRequest(req)

  const platformHeader = req.headers.get("x-platform") || req.headers.get("x-client-platform")
  const platform = platformHeader?.toUpperCase() === "ANDROID" ? Platform.ANDROID : Platform.WEB

  // 1. Enforce Max characters/message limit (Free: 2,000, Premium: 4,000)
  const maxChars = plan === "PREMIUM" || plan === "ORGANIZATION" ? 4000 : 2000
  if (message.length > maxChars) {
    return NextResponse.json({
      error: "LIMIT_EXCEEDED",
      message: `Message too long. Maximum allowed is ${maxChars} characters.`
    }, { status: 429 })
  }

  // 2. Enforce Concurrency limit (Max 1 concurrent request)
  const userOrGuestIdentifier = session?.user?.id || resolvedGuestToken || guestToken || "guest"
  const concurrencyCheck = await checkConcurrency({
    userId: session?.user?.id || null,
    ip: session?.user?.id ? null : (resolvedGuestToken || guestToken || null),
    action: "AI_CHAT_CONCURRENCY",
    maxConcurrency: 1,
    windowMs: 12000, // 12 seconds request lock window
  })
  if (!concurrencyCheck.allowed) {
    return NextResponse.json({
      error: "LIMIT_EXCEEDED",
      message: "Please wait for your previous message response."
    }, { status: 429 })
  }

  // Log concurrency entry
  const concurrencyLog = await prisma.technicalLimitLog.create({
    data: {
      userId: session?.user?.id || null,
      ip: session?.user?.id ? null : (resolvedGuestToken || guestToken || null),
      action: "AI_CHAT_CONCURRENCY"
    }
  })

  // 3. Enforce Requests/minute limit (Free: 10, Premium: 15)
  const rpmCheck = await enforceLimit({
    userId: session?.user?.id || null,
    ip: session?.user?.id ? null : (resolvedGuestToken || guestToken || null),
    action: "AI_CHAT_RPM",
    plan,
    limitFree: 10,
    limitPremium: 15,
    windowMs: 60 * 1000,
    errorMessage: "Requests per minute limit reached",
  })
  if (!rpmCheck.allowed) {
    await prisma.technicalLimitLog.delete({ where: { id: concurrencyLog.id } }).catch(() => {})
    return NextResponse.json({
      error: "LIMIT_EXCEEDED",
      message: rpmCheck.message,
      resetInSeconds: rpmCheck.resetInSeconds
    }, { status: 429 })
  }

  // 4. Enforce Daily message limit (Free: 30, Premium: 150, Guest: 5 total)
  const dailyCheck = await enforceLimit({
    userId: session?.user?.id || null,
    ip: session?.user?.id ? null : (resolvedGuestToken || guestToken || null),
    action: "AI_CHAT_DAILY",
    plan,
    limitFree: session?.user?.id ? 30 : 5,
    limitPremium: 150,
    windowMs: 24 * 60 * 60 * 1000,
    errorMessage: "Daily message limit reached",
  })
  if (!dailyCheck.allowed) {
    await prisma.technicalLimitLog.delete({ where: { id: concurrencyLog.id } }).catch(() => {})
    return NextResponse.json({
      error: "LIMIT_EXCEEDED",
      message: dailyCheck.message,
      resetInSeconds: dailyCheck.resetInSeconds
    }, { status: 429 })
  }

  // 5. Enforce Monthly message limit (Free: 300, Premium: 4500)
  const monthlyCheck = await enforceLimit({
    userId: session?.user?.id || null,
    ip: session?.user?.id ? null : (resolvedGuestToken || guestToken || null),
    action: "AI_CHAT_MONTHLY",
    plan,
    limitFree: session?.user?.id ? 300 : 5,
    limitPremium: 4500,
    windowMs: 30 * 24 * 60 * 60 * 1000,
    errorMessage: "Monthly message limit reached",
  })
  if (!monthlyCheck.allowed) {
    await prisma.technicalLimitLog.delete({ where: { id: concurrencyLog.id } }).catch(() => {})
    return NextResponse.json({
      error: "LIMIT_EXCEEDED",
      message: monthlyCheck.message,
      resetInSeconds: monthlyCheck.resetInSeconds
    }, { status: 429 })
  }

  let context: Awaited<ReturnType<typeof resolveChatContext>>
  try {
    context = await resolveChatContext({
      userId: session?.user?.id ?? null,
      guestToken,
      platform,
    })
  } catch (ctxErr) {
    console.error("resolveChatContext failed:", ctxErr)
    await prisma.technicalLimitLog.delete({ where: { id: concurrencyLog.id } }).catch(() => {})
    return NextResponse.json(
      { error: "Could not reach the assistant. Please try again in a moment." },
      { status: 503 },
    )
  }

  if (context.kind === "user") {
    conversationId = context.user.conversationId
  } else {
    if (context.guest.requiresLogin) {
      await prisma.technicalLimitLog.delete({ where: { id: concurrencyLog.id } }).catch(() => {})
      return NextResponse.json({
        requiresLogin: true,
        requiresSignIn: true,
        limitReached: context.guest.limitReached || false,
        sessionExpired: context.guest.sessionExpired || false,
      })
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

  // ── High-Sensitivity Gibberish & Unintelligible Input Guard ──
  const SUPPORTED_LANGS = ['en', 'hi', 'te', 'ta', 'kn', 'ml', 'mr', 'bn', 'or', 'gu', 'pa', 'ur'];
  const msgRaw = message.trim();
  const isGibberish = 
    msgRaw.length >= 5 && 
    !msgRaw.includes(' ') && 
    detectedLang && 
    !SUPPORTED_LANGS.includes(detectedLang);

  if (isGibberish) {
    const clarificationReply = "I couldn't quite understand that. Could you try saying it another way?";
    
    try {
      await appendMessage({
        conversationId,
        role: "assistant",
        content: clarificationReply,
      });
    } catch (error) {
      console.warn("Failed to save assistant clarification message to DB:", error);
    }

    const response = NextResponse.json({
      reply: clarificationReply,
      currentCount: finalChatCount,
      plan,
      expression: "NEUTRAL"
    });

    if (resolvedGuestToken && !isAndroid) {
      response.cookies.set(PRAGYA_GUEST_TOKEN_COOKIE, resolvedGuestToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    await prisma.technicalLimitLog.delete({ where: { id: concurrencyLog.id } }).catch(() => {});
    
    return response;
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
        
        // Ensure action is bubbled up if available
        if (parsedNested.action && (!data.action || Object.keys(data.action).length === 0)) {
          data.action = parsedNested.action;
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

    // --- Activity Recommendation Logic (Fallback) ---
    if (userMessageEnglish && data.reply) {
      const msgLower = userMessageEnglish.toLowerCase();
      const matches = (regex: RegExp) => regex.test(msgLower);
      
      let explicitActivity: { title: string; url: string } | null = null;
      if (matches(/\b(box breathing|guide.*box breathing)\b/i)) explicitActivity = { title: "Box Breathing", url: "/explore/activities/breathing?mode=box" };
      else if (matches(/\b(4-7-8|four seven eight)\b/i)) explicitActivity = { title: "4-7-8 Breathing", url: "/explore/activities/breathing?mode=478" };
      else if (matches(/\b(grounding exercise|ground myself|5-4-3-2-1)\b/i)) explicitActivity = { title: "5-4-3-2-1 Grounding", url: "/dashboard/explore?item=5-4-3-2-1-grounding" };
      else if (matches(/\b(movement (exercise|break)|stretch|physical activity)\b/i)) explicitActivity = { title: "Micro Movement", url: "/dashboard/explore?item=micro-movement" };
      else if (matches(/\b(progressive muscle relaxation|muscle relaxation exercise|relax my muscles)\b/i)) explicitActivity = { title: "Progressive Muscle Relaxation", url: "/dashboard/explore?item=progressive-muscle-relaxation" };
      else if (matches(/\b(journal|write down what i'm feeling|reflection exercise)\b/i)) explicitActivity = { title: "Journal Reflection", url: "/dashboard/explore?item=journal-reflection" };

      if (explicitActivity) {
        // Explicit activity requests must override existing assessments
        data.action = { type: "ACTIVITY", title: explicitActivity.title, url: explicitActivity.url };
      } 
      else if (!data.action || Object.keys(data.action).length === 0 || !(data.action as any).type) {
        // Contextual matching triggers ONLY if no assessment took precedence
        let contextActivity: { title: string; url: string } | null = null;
        
        if (matches(/\b(shoulders.*tense|muscle tension|tense muscles|jaw tension|physically tense|can't physically relax|tension in.*body)\b/i)) contextActivity = { title: "Progressive Muscle Relaxation", url: "/dashboard/explore?item=progressive-muscle-relaxation" };
        else if (matches(/\b(sitting all day|sitting.*long|stiff|sluggish|body.*stuck)\b/i)) contextActivity = { title: "Micro Movement", url: "/dashboard/explore?item=micro-movement" };
        else if (matches(/\b(feel(ing)? disconnected|detached|unreal|spaced out|mentally scattered|come back to the present|dissociating)\b/i)) contextActivity = { title: "5-4-3-2-1 Grounding", url: "/dashboard/explore?item=5-4-3-2-1-grounding" };
        else if (matches(/\b(racing thoughts|take a breath|panic attack)\b/i)) contextActivity = { title: "Box Breathing", url: "/explore/activities/breathing?mode=box" };
        else if (matches(/\b(difficulty relaxing|difficulty settling down)\b/i)) contextActivity = { title: "4-7-8 Breathing", url: "/explore/activities/breathing?mode=478" };
        else if (matches(/\b(process thoughts|process feelings|write things down|lot on my mind)\b/i)) contextActivity = { title: "Journal Reflection", url: "/dashboard/explore?item=journal-reflection" };
        
        if (contextActivity) {
          data.action = { type: "ACTIVITY", title: contextActivity.title, url: contextActivity.url };
        }
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

    if (resolvedGuestToken && !isAndroid) {
      response.cookies.set(PRAGYA_GUEST_TOKEN_COOKIE, resolvedGuestToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      })
    }

    // Release concurrency lock
    await prisma.technicalLimitLog.delete({ where: { id: concurrencyLog.id } }).catch(() => {})

    return response
  } catch {
    // Release concurrency lock on error too
    await prisma.technicalLimitLog.deleteMany({ where: { action: "AI_CHAT_CONCURRENCY", userId: session?.user?.id || undefined } }).catch(() => {})
    const response = NextResponse.json(
      { error: "Invalid upstream response" },
      { status: 502 },
    )
    if (resolvedGuestToken && !isAndroid) {
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
