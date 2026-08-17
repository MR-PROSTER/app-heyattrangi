import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"
import { enforceLimit } from "@/lib/limits/checkLimits"

// GET — Retrieve all reminders
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const reminders = await prisma.reminder.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ reminders })
  } catch (error) {
    console.error("Reminders GET error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST — Create or Update a reminder
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    })
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await req.json()
    const { id, title, time, weekdays, enabled } = body

    if (!title || !time || !Array.isArray(weekdays)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // 1. Enforce Create/Update requests per day limit (Free: 10, Premium: 20)
    const limitCheck = await enforceLimit({
      userId: session.user.id,
      action: "REMINDER_CREATE_UPDATE",
      plan: dbUser.plan,
      limitFree: 10,
      limitPremium: 20,
      windowMs: 24 * 60 * 60 * 1000,
      errorMessage: "Reminder daily edit limit reached",
    })

    if (!limitCheck.allowed) {
      return NextResponse.json({ error: "LIMIT_EXCEEDED", message: limitCheck.message, resetInSeconds: limitCheck.resetInSeconds }, { status: 429 })
    }

    // 2. Enforce Active reminders limit (Free: 3, Premium: 10)
    const isPremium = dbUser.plan === "PREMIUM" || dbUser.plan === "ORGANIZATION"
    const activeLimit = isPremium ? 10 : 3

    if (!id) {
      // For creation, check count of active reminders
      const currentActiveCount = await prisma.reminder.count({
        where: { userId: session.user.id, enabled: true },
      })
      if (currentActiveCount >= activeLimit) {
        return NextResponse.json({
          error: "LIMIT_EXCEEDED",
          message: `Active reminder limit reached. Free accounts can have at most 3 active reminders. Upgrade to Premium for up to 10.`,
        }, { status: 403 })
      }
    }

    // 3. Enforce Predefined vs Custom schedule
    // Predefined schedules are every day, weekdays-only, or weekends-only.
    // Anything else is custom.
    const isPredefined =
      weekdays.length === 7 || // Everyday
      (weekdays.length === 5 && weekdays.every(d => ["mon", "tue", "wed", "thu", "fri"].includes(d))) || // Weekdays only
      (weekdays.length === 2 && weekdays.every(d => ["sat", "sun"].includes(d))) // Weekends only

    if (!isPremium && !isPredefined) {
      return NextResponse.json({
        error: "LIMIT_EXCEEDED",
        message: "Custom reminder schedules are a Premium feature. Free users can only select Everyday, Weekdays, or Weekends.",
      }, { status: 403 })
    }

    let reminder
    if (id) {
      // Verify ownership
      const existing = await prisma.reminder.findUnique({ where: { id } })
      if (!existing || existing.userId !== session.user.id) {
        return NextResponse.json({ error: "Reminder not found" }, { status: 404 })
      }
      reminder = await prisma.reminder.update({
        where: { id },
        data: { title, time, weekdays, enabled: enabled !== false },
      })
    } else {
      reminder = await prisma.reminder.create({
        data: {
          userId: session.user.id,
          title,
          time,
          weekdays,
          enabled: enabled !== false,
        },
      })
    }

    return NextResponse.json({ reminder })
  } catch (error) {
    console.error("Reminder save error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// DELETE — Remove a reminder
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "Missing reminder ID" }, { status: 400 })
    }

    const existing = await prisma.reminder.findUnique({ where: { id } })
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 })
    }

    await prisma.reminder.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Reminder DELETE error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
