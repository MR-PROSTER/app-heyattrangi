import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"
import { getUserMessagesByRoleSince } from "@/lib/pragya/persistence"
import { withPerf, perfLog } from "@/lib/perf"

export async function GET(req: NextRequest) {
  const start = performance.now()
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const filter = req.nextUrl.searchParams.get("filter") || "All"

    const now = new Date()
    let createdAtGte: Date | undefined
    if (filter === "Today") {
      createdAtGte = new Date(now.setHours(0, 0, 0, 0))
    } else if (filter === "Week") {
      createdAtGte = new Date(now.setDate(now.getDate() - 7))
    }

    const whereClause: { userId: string; createdAt?: { gte: Date } } = createdAtGte
      ? { userId: session.user.id, createdAt: { gte: createdAtGte } }
      : { userId: session.user.id }

    // Independent reads in parallel
    const [journals, chats] = await Promise.all([
      withPerf("mood.journals", () =>
        prisma.journalEntry.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
          take: 30,
          select: {
            content: true,
            moodScore: true,
            createdAt: true,
          },
        })
      ),
      withPerf("mood.chats", () =>
        getUserMessagesByRoleSince(session.user.id, "user", createdAtGte, 30)
      ),
    ])

    if (journals.length === 0 && chats.length === 0) {
      perfLog("mood.GET.total", performance.now() - start, { empty: true })
      return NextResponse.json({
        happy: 30,
        calm: 40,
        sad: 30,
        score: 0,
        message: "Start journaling or chatting to track your mood!",
      })
    }

    let happyCount = 0
    let calmCount = 0
    let totalScore = 0
    let totalItems = 0

    journals.forEach((journal) => {
      let score = journal.moodScore

      if (!score) {
        const text = journal.content.toLowerCase()
        if (text.match(/(happy|great|excellent|good|joy|excited|love|amazing)/)) {
          score = 5
        } else if (text.match(/(sad|bad|terrible|awful|depressed|angry|hate|worst)/)) {
          score = 1
        } else {
          score = 3
        }
      }

      totalScore += score
      totalItems++

      if (score >= 4) happyCount++
      else if (score === 3) calmCount++
    })

    chats.forEach((chat) => {
      let score = 3
      const text = chat.content.toLowerCase()
      if (text.match(/(happy|great|excellent|good|joy|excited|love|amazing|thanks|thank you)/)) {
        score = 5
      } else if (text.match(/(sad|bad|terrible|awful|depressed|angry|hate|worst|stress|anxious)/)) {
        score = 1
      }

      totalScore += score
      totalItems++

      if (score >= 4) happyCount++
      else if (score === 3) calmCount++
    })

    const happy = Math.round((happyCount / totalItems) * 100)
    const calm = Math.round((calmCount / totalItems) * 100)
    const sad = Math.max(0, 100 - happy - calm)

    const averageScore = totalScore / totalItems
    const overallScore = Math.round((averageScore / 5) * 100)

    let message = "Your Mental Health Is Stable."
    if (overallScore >= 80) message = "You're Doing Great!"
    else if (overallScore <= 40) message = "Your Mental Health Is Low."

    let lastUpdated = null
    if (journals.length > 0 && chats.length > 0) {
      lastUpdated = new Date(
        Math.max(journals[0].createdAt.getTime(), chats[0].createdAt.getTime())
      )
    } else if (journals.length > 0) {
      lastUpdated = journals[0].createdAt
    } else if (chats.length > 0) {
      lastUpdated = chats[0].createdAt
    }

    perfLog("mood.GET.total", performance.now() - start, {
      journals: journals.length,
      chats: chats.length,
    })

    return NextResponse.json({
      happy,
      calm,
      sad,
      score: overallScore,
      message,
      lastUpdated,
    })
  } catch (error) {
    console.error("AI Mood Analysis Error:", error)
    return NextResponse.json({
      happy: 30,
      calm: 40,
      sad: 30,
      score: 60,
      message: "AI Analysis Temporarily Unavailable.",
    })
  }
}
