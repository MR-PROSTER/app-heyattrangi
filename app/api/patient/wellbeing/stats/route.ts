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

    // Fetch all mood entries of the user
    const moodEntries = await prisma.moodEntry.findMany({
      where: { userId },
      orderBy: { timestamp: "asc" },
    })

    const now = new Date()
    const currentYear = now.getFullYear()

    // 1. Calculate Weekly Data for the last 3 weeks
    // Week 3: last 7 days
    // Week 2: 7 to 14 days ago
    // Week 1: 14 to 21 days ago
    const getWeekData = (weekNum: number, startDaysAgo: number, endDaysAgo: number) => {
      const endDate = new Date(now)
      endDate.setDate(now.getDate() - endDaysAgo)
      const startDate = new Date(now)
      startDate.setDate(now.getDate() - startDaysAgo)

      const entries = moodEntries.filter((e) => {
        const t = new Date(e.timestamp)
        return t >= startDate && t < endDate
      })

      return calculateMoodStats(entries, weekNum)
    }

    const weeklyData = {
      1: getWeekData(1, 21, 14),
      2: getWeekData(2, 14, 7),
      3: getWeekData(3, 7, 0),
    }

    // 2. Calculate Monthly Data for the current year
    const monthlyData: Record<number, any> = {}
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

function calculateMoodStats(entries: any[], periodId: number) {
  const countMap: Record<string, number> = {
    GREAT: 0,
    GOOD: 0,
    NEUTRAL: 0,
    BAD: 0,
    VERY_BAD: 0,
  }

  let totalScore = 0
  entries.forEach((e) => {
    const moodKey = e.mood.toUpperCase()
    if (countMap[moodKey] !== undefined) {
      countMap[moodKey]++
    }
    const score =
      e.moodScore ??
      (moodKey === "GREAT"
        ? 9
        : moodKey === "GOOD"
        ? 7
        : moodKey === "NEUTRAL"
        ? 5
        : moodKey === "BAD"
        ? 4
        : moodKey === "VERY_BAD"
        ? 2
        : 5)
    totalScore += score
  })

  const averageMood = entries.length > 0 ? totalScore / entries.length : 0.0

  const moods = [
    {
      label: "Okay",
      value: countMap.NEUTRAL || 0,
      color: "#FFD5B7",
      bgClass: "bg-[#FFD5B7]",
      image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730633/Okay-emotion_sscj34.png",
    },
    {
      label: "Good",
      value: countMap.GOOD || 0,
      color: "#CEF8A4",
      bgClass: "bg-[#CEF8A4]",
      image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730633/Good-emotion_jimbfs.png",
    },
    {
      label: "Great",
      value: countMap.GREAT || 0,
      color: "#FCE5AF",
      bgClass: "bg-[#FCE5AF]",
      image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730630/Great-emotion_rbwtzb.png",
    },
    {
      label: "Meh",
      value: countMap.BAD || 0,
      color: "#C2DDF8",
      bgClass: "bg-[#C2DDF8]",
      image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730630/Meh-emotion_nozhzi.png",
    },
    {
      label: "Low",
      value: countMap.VERY_BAD || 0,
      color: "#E9C9FF",
      bgClass: "bg-[#E9C9FF]",
      image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730629/Low-emotion_vbpanv.png",
    },
  ]

  return {
    periodId,
    averageMood: Number(averageMood.toFixed(1)),
    moods,
  }
}
