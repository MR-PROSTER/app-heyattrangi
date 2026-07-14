import { NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"
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

  const { session_id, message, generate_suggestions } = body as Record<string, unknown>
  if (typeof session_id !== "string" || !session_id.trim()) {
    return NextResponse.json({ error: "session_id is required" }, { status: 400 })
  }
  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "message is required" }, { status: 400 })
  }

  // Get user details to check plan and track chats
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }
  
  // Name is not passed to AI to avoid overuse or asking for name
  const nameToUse = "";

  const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD format

  let finalChatCount = 0;
  const isSameDay = dbUser.lastAiChatDate === today;
  let currentCount = isSameDay ? dbUser.dailyAiChatCount : 0;

  let limit = Infinity;
  let limitMessage = "";

  if (dbUser.plan === "FREE") {
    limit = 10;
    limitMessage = "You have reached your limit of 10 messages per day on the Free plan. Please upgrade to Essential or Premium for more access!";
  } else if (dbUser.plan === "ESSENTIAL") {
    limit = 100;
    limitMessage = "You have reached your limit of 100 messages per day on the Essential plan. Please upgrade to Premium for more access!";
  } else if (dbUser.plan === "PREMIUM") {
    limit = 100;
    limitMessage = "You have reached your limit of 100 messages per day on the Premium plan. Please upgrade to Organization for unlimited access!";
  } else if (dbUser.plan === "ORGANIZATION") {
    limit = 100;
    limitMessage = "You have reached your limit of 100 messages per day on the Organization plan.";
  }

  if (currentCount >= limit) {
    return NextResponse.json({ error: limitMessage }, { status: 429 });
  }

  // Increment count for today
  const updated = await prisma.user.update({
    where: { id: dbUser.id },
    data: {
      dailyAiChatCount: currentCount + 1,
      lastAiChatDate: today,
    }
  });
  finalChatCount = updated.dailyAiChatCount;

  // Save user message to history
  await prisma.pragyaChatMessage.create({
    data: {
      userId: dbUser.id,
      role: "user",
      content: message.trim(),
    }
  });

  const upstream = await fetch(`${getPragyaUpstreamBase()}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: session_id.trim(),
      message: message.trim(),
      user_name: nameToUse,
      generate_suggestions: typeof generate_suggestions === "boolean" ? generate_suggestions : true
    }),
  })

  const text = await upstream.text()
  if (!upstream.ok) {
    return NextResponse.json(
      { error: text || "Upstream chat request failed" },
      { status: upstream.status >= 400 ? upstream.status : 502 },
    )
  }

  try {
    const data = JSON.parse(text) as { reply?: string }
    
    // Save assistant reply to history
    if (data.reply) {
      await prisma.pragyaChatMessage.create({
        data: {
          userId: dbUser.id,
          role: "assistant",
          content: data.reply,
        }
      });
    }

    return NextResponse.json({ ...data, currentCount: finalChatCount, plan: dbUser.plan })
  } catch {
    return NextResponse.json({ error: "Invalid upstream response" }, { status: 502 })
  }
}
