import { NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id

    const { searchParams } = new URL(req.url)
    const monthParam = searchParams.get("month")
    const yearParam = searchParams.get("year")

    const now = new Date()
    const month = monthParam ? parseInt(monthParam, 10) : now.getMonth()
    const year = yearParam ? parseInt(yearParam, 10) : now.getFullYear()

    const startOfMonth = new Date(year, month, 1)
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999)

    // Fetch mood entries for this month
    const moods = await prisma.moodEntry.findMany({
      where: {
        userId,
        timestamp: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      orderBy: { timestamp: "asc" },
    })

    // Fetch journal entries for this month
    const journals = await prisma.journalEntry.findMany({
      where: {
        userId,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({ moods, journals })
  } catch (error) {
    console.error("Wellbeing Trends GET error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
