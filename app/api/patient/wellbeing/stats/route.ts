import { NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"

type MoodSummary = {
  periodId: number
  averageMood: number
  moods: {
    label: string
    value: number
    color: string
    bgClass: string
    image: string
  }[]
  entryCount: number
}

type MoodEntryRecord = {
  timestamp: Date | string
  mood: string
  moodScore?: number | null
}

const MOOD_SEGMENTS = [
  {
    label: "Okay",
    dbKey: "OKAY",
    color: "#FFD5B7",
    bgClass: "bg-[#FFD5B7]",
    image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730633/Okay-emotion_sscj34.png",
  },
  {
    label: "Good",
    dbKey: "GOOD",
    color: "#CEF8A4",
    bgClass: "bg-[#CEF8A4]",
    image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730633/Good-emotion_jimbfs.png",
  },
  {
    label: "Great",
    dbKey: "GREAT",
    color: "#FCE5AF",
    bgClass: "bg-[#FCE5AF]",
    image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730630/Great-emotion_rbwtzb.png",
  },
  {
    label: "Meh",
    dbKey: "MEH",
    color: "#C2DDF8",
    bgClass: "bg-[#C2DDF8]",
    image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730630/Meh-emotion_nozhzi.png",
  },
  {
    label: "Low",
    dbKey: "LOW",
    color: "#E9C9FF",
    bgClass: "bg-[#E9C9FF]",
    image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730629/Low-emotion_vbpanv.png",
  },
] as const

function normalizeMoodKey(mood: string, moodScore?: number | null) {
  const key = mood.toUpperCase().trim()
  if (key === "GREAT" || key === "HAPPY" || key === "EXCITED") return "GREAT"
  if (key === "GOOD" || key === "CALM") return "GOOD"
  if (key === "OKAY" || key === "NEUTRAL") return "OKAY"
  if (key === "MEH" || key === "BAD" || key === "TIRED" || key === "SAD" || key === "ANXIOUS") return "MEH"
  if (key === "LOW" || key === "VERY_BAD" || key === "STRESSED" || key === "ANGRY") return "LOW"

  if (typeof moodScore === "number") {
    if (moodScore > 4) {
      if (moodScore >= 8) return "GREAT"
      if (moodScore >= 6) return "GOOD"
      if (moodScore >= 4) return "OKAY"
      if (moodScore >= 3) return "MEH"
      return "LOW"
    } else {
      if (moodScore === 4) return "GREAT"
      if (moodScore === 3) return "GOOD"
      if (moodScore === 2) return "OKAY"
      if (moodScore === 1) return "MEH"
      if (moodScore === 0) return "LOW"
    }
  }
  return "OKAY"
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id
    const url = new URL(req.url)
    const period = url.searchParams.get("period")

    // Fetch all mood entries of the user
    const moodEntries = await prisma.moodEntry.findMany({
      where: { userId },
      orderBy: { timestamp: "asc" },
    })

    if (period === "week") {
      const weekParam = parseInt(url.searchParams.get("week") || "3", 10)
      return NextResponse.json({ summary: buildWeekSummary(moodEntries, weekParam) })
    }

    if (period === "month") {
      const now = new Date()
      const month = parseInt(url.searchParams.get("month") || `${now.getMonth()}`, 10)
      const year = parseInt(url.searchParams.get("year") || `${now.getFullYear()}`, 10)
      return NextResponse.json({ summary: buildMonthSummary(moodEntries, month, year) })
    }

    const now = new Date()
    const currentYear = now.getFullYear()

    // 1. Calculate Weekly Data for the last 4 weeks
    // Week 4: last 7 days
    // Week 3: 7 to 14 days ago
    // Week 2: 14 to 21 days ago
    // Week 1: 21 to 28 days ago
    const getWeekData = (weekNum: number, startDaysAgo: number, endDaysAgo: number) => {
      const startDate = new Date(now)
      startDate.setDate(now.getDate() - startDaysAgo)
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(now)
      endDate.setDate(now.getDate() - endDaysAgo)
      endDate.setHours(23, 59, 59, 999)

      const entries = moodEntries.filter((e) => {
        const t = new Date(e.timestamp)
        return t >= startDate && t <= endDate
      })

      return calculateMoodStats(entries, weekNum)
    }

    const weeklyData = {
      1: getWeekData(1, 28, 21),
      2: getWeekData(2, 21, 14),
      3: getWeekData(3, 14, 7),
      4: getWeekData(4, 7, 0),
    }

    // 2. Calculate Monthly Data for the current year
    const monthlyData: Record<number, MoodSummary> = {}
    for (let m = 0; m < 12; m++) {
      const entries = moodEntries.filter((e) => {
        const t = new Date(e.timestamp)
        return t.getFullYear() === currentYear && t.getMonth() === m
      })

      if (entries.length > 0) {
        monthlyData[m] = calculateMoodStats(entries, m)
      }
    }

    return NextResponse.json({ weeklyData, monthlyData })
  } catch (error) {
    console.error("Wellbeing Stats GET error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

function buildWeekSummary(moodEntries: MoodEntryRecord[], weekNum: number): MoodSummary {
  const ranges: Record<number, { startDaysAgo: number; endDaysAgo: number }> = {
    1: { startDaysAgo: 28, endDaysAgo: 21 },
    2: { startDaysAgo: 21, endDaysAgo: 14 },
    3: { startDaysAgo: 14, endDaysAgo: 7 },
    4: { startDaysAgo: 7, endDaysAgo: 0 },
  }

  const range = ranges[weekNum] || ranges[4]
  const now = new Date()

  const startDate = new Date(now)
  startDate.setHours(0, 0, 0, 0)
  startDate.setDate(startDate.getDate() - range.startDaysAgo)

  const endDate = new Date(now)
  endDate.setHours(23, 59, 59, 999)
  endDate.setDate(endDate.getDate() - range.endDaysAgo)

  const entries = moodEntries.filter((e) => {
    const t = new Date(e.timestamp)
    return t >= startDate && t <= endDate
  })

  return calculateMoodStats(entries, weekNum)
}

function buildMonthSummary(moodEntries: MoodEntryRecord[], month: number, year: number): MoodSummary {
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999)

  const entries = moodEntries.filter((e) => {
    const t = new Date(e.timestamp)
    return t >= startDate && t <= endDate
  })

  return calculateMoodStats(entries, month)
}

function calculateMoodStats(entries: MoodEntryRecord[], periodId: number): MoodSummary {
  const countMap: Record<string, number> = {
    GREAT: 0,
    GOOD: 0,
    OKAY: 0,
    MEH: 0,
    LOW: 0,
  }

  let totalScore = 0
  entries.forEach((e) => {
    const moodKey = normalizeMoodKey(e.mood, e.moodScore)
    if (countMap[moodKey] !== undefined) {
      countMap[moodKey]++
    }
    const score =
      e.moodScore ??
      (moodKey === "GREAT"
        ? 9
        : moodKey === "GOOD"
        ? 7
        : moodKey === "OKAY"
        ? 5
        : moodKey === "MEH"
        ? 4
        : moodKey === "LOW"
        ? 2
        : 5)
    totalScore += score
  })

  const averageMood = entries.length > 0 ? totalScore / entries.length : 0.0

  const moods = MOOD_SEGMENTS.map((segment) => ({
    label: segment.label,
    value: countMap[segment.dbKey] || 0,
    color: segment.color,
    bgClass: segment.bgClass,
    image: segment.image,
  }))

  return {
    periodId,
    averageMood: Number(averageMood.toFixed(1)),
    moods,
    entryCount: entries.length,
  }
}
