import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const filter = req.nextUrl.searchParams.get("filter") || "All"
    
    let dateFilter = {}
    const now = new Date()
    if (filter === "Today") {
      const today = new Date(now.setHours(0, 0, 0, 0))
      dateFilter = { gte: today }
    } else if (filter === "Week") {
      const lastWeek = new Date(now.setDate(now.getDate() - 7))
      dateFilter = { gte: lastWeek }
    }

    const whereClause: any = { userId: session.user.id }
    if (filter !== "All") {
      whereClause.createdAt = dateFilter
    }

    // Fetch the last 30 journal entries
    const journals = await prisma.journalEntry.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 30
    })

    // Fetch the last 30 AI chat messages from the user
    const chats = await prisma.pragyaChatMessage.findMany({
      where: { ...whereClause, role: "user" },
      orderBy: { createdAt: "desc" },
      take: 30
    })

    // Default mock data if NO data exists
    if (journals.length === 0 && chats.length === 0) {
      return NextResponse.json({
        happy: 30,
        calm: 40,
        sad: 30,
        score: 0,
        message: "Start journaling or chatting to track your mood!"
      })
    }

    let happyCount = 0
    let calmCount = 0
    let sadCount = 0
    let totalScore = 0
    let totalItems = 0

    // Analyze Journals
    journals.forEach(journal => {
      let score = journal.moodScore
      
      // If no score, attempt basic sentiment keyword match
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

      if (score >= 4) {
        happyCount++
      } else if (score === 3) {
        calmCount++
      } else {
        sadCount++
      }
    })

    // Analyze AI Chats
    chats.forEach(chat => {
      let score = 3 // default neutral
      const text = chat.content.toLowerCase()
      if (text.match(/(happy|great|excellent|good|joy|excited|love|amazing|thanks|thank you)/)) {
        score = 5
      } else if (text.match(/(sad|bad|terrible|awful|depressed|angry|hate|worst|stress|anxious)/)) {
        score = 1
      }
      
      totalScore += score
      totalItems++

      if (score >= 4) {
        happyCount++
      } else if (score === 3) {
        calmCount++
      } else {
        sadCount++
      }
    })

    // Ensure we don't divide by zero if something went weird
    const happy = Math.round((happyCount / totalItems) * 100)
    const calm = Math.round((calmCount / totalItems) * 100)
    const sad = Math.max(0, 100 - happy - calm) // Ensure it adds up to 100
    
    // Calculate an overall "stability/wellbeing" score (out of 100)
    const averageScore = totalScore / totalItems
    const overallScore = Math.round((averageScore / 5) * 100)

    let message = "Your Mental Health Is Stable."
    if (overallScore >= 80) message = "You're Doing Great!"
    else if (overallScore <= 40) message = "Your Mental Health Is Low."

    let lastUpdated = null;
    if (journals.length > 0 && chats.length > 0) {
        lastUpdated = new Date(Math.max(journals[0].createdAt.getTime(), chats[0].createdAt.getTime()))
    } else if (journals.length > 0) {
        lastUpdated = journals[0].createdAt
    } else if (chats.length > 0) {
        lastUpdated = chats[0].createdAt
    }

    return NextResponse.json({
      happy,
      calm,
      sad,
      score: overallScore,
      message,
      lastUpdated
    })

  } catch (error) {
    console.error("AI Mood Analysis Error:", error)
    // Fallback to default on error so UI doesn't break
    return NextResponse.json({
      happy: 30, calm: 40, sad: 30, score: 60, message: "AI Analysis Temporarily Unavailable."
    })
  }
}
