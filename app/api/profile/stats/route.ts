import { NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Fetch minimum fields for active days check, and counts for mood and journal in parallel
    const [limitLogs, activityLogs, moodEntries, journalEntries, assessmentAttempts] = await Promise.all([
      prisma.technicalLimitLog.findMany({
        where: { userId },
        select: { timestamp: true },
      }),
      prisma.userActivityLog.findMany({
        where: { userId },
        select: { timestamp: true },
      }),
      prisma.moodEntry.findMany({
        where: { userId },
        select: { timestamp: true },
      }),
      prisma.journalEntry.findMany({
        where: { userId },
        select: { createdAt: true },
      }),
      prisma.assessmentAttempt.findMany({
        where: { userId },
        select: { startedAt: true },
      }),
    ])

    // Construct unique date set for active days calculation
    const activeDates = new Set<string>()

    limitLogs.forEach((log) => {
      if (log.timestamp) {
        activeDates.add(log.timestamp.toISOString().split("T")[0])
      }
    })

    activityLogs.forEach((log) => {
      if (log.timestamp) {
        activeDates.add(log.timestamp.toISOString().split("T")[0])
      }
    })

    moodEntries.forEach((entry) => {
      if (entry.timestamp) {
        activeDates.add(entry.timestamp.toISOString().split("T")[0])
      }
    })

    journalEntries.forEach((entry) => {
      if (entry.createdAt) {
        activeDates.add(entry.createdAt.toISOString().split("T")[0])
      }
    })

    assessmentAttempts.forEach((attempt) => {
      if (attempt.startedAt) {
        activeDates.add(attempt.startedAt.toISOString().split("T")[0])
      }
    })

    const activeDays = activeDates.size

    return NextResponse.json({
      activeDays,
      moodCheckIns: moodEntries.length,
      reflections: journalEntries.length,
    })
  } catch (error) {
    console.error("[PROFILE_STATS_API_ERROR]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
