import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"
import { getPragyaUpstreamBase } from "@/lib/pragya/upstream"
import {
  PRAGYA_GUEST_TOKEN_COOKIE,
  appendMessage,
  resolveChatContext,
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

  const { message, generate_suggestions } = body as Record<string, unknown>
  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "message is required" }, { status: 400 })
  }

  // Name is not passed to AI to avoid overuse or asking for name
  const nameToUse = "";

  const finalChatCount = 0;
  let plan = "FREE";
  let conversationId: string | null = null
  let resolvedGuestToken: string | null = null

  if (session?.user?.id) {
    // Signed-in users are unlimited for now; we only keep counts/history.
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    plan = dbUser.plan;
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

  try {
    await appendMessage({
      conversationId,
      role: "user",
      content: message.trim(),
    })
  } catch (error) {
    console.warn("Failed to save user message to DB:", error)
  }

  let pastAssessments: any[] = [];
  if (session?.user?.id) {
    try {
      const db: any = prisma;
      pastAssessments = await db.patientAssessmentResult.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
      });
    } catch (dbError) {
      console.warn("Could not fetch past assessments due to database error (MongoDB may be unreachable):", dbError);
    }
  }

  // DEBUG - REMOVE AFTER TESTING
  console.log("--- [DEBUG Next.js Route] INCOMING CHAT REQUEST ---");
  console.log("Session ID:", session?.user?.id || resolvedGuestToken || conversationId);
  console.log("User message:", message);
  console.log("Upstream URL:", `${getPragyaUpstreamBase()}/chat`);
  // END DEBUG

  const upstream = await fetch(`${getPragyaUpstreamBase()}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: session?.user?.id ? `patient_${session.user.id}` : resolvedGuestToken ?? "",
      message: message.trim(),
      user_name: nameToUse,
      generate_suggestions: typeof generate_suggestions === "boolean" ? generate_suggestions : true,
      past_assessments: pastAssessments.map((pa: any) => ({
        assessmentId: pa.assessmentId,
        date: pa.date,
        results: pa.results
      }))
    }),
  })


  const text = await upstream.text()

  // DEBUG - REMOVE AFTER TESTING
  console.log("--- [DEBUG Next.js Route] UPSTREAM RESPONSE ---");
  console.log("Status:", upstream.status);
  console.log("Raw Text:", text);
  // END DEBUG

  if (!upstream.ok) {
    return NextResponse.json(
      { error: text || "Upstream chat request failed" },
      { status: upstream.status >= 400 ? upstream.status : 502 },
    )
  }

  try {
    const data = JSON.parse(text) as { reply?: string }
    
    // Save assistant reply to history
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
    const response = NextResponse.json({ error: "Invalid upstream response" }, { status: 502 })
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
