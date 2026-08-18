import { NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await auth()
    const currentUser = await getCurrentUser()

    if (!session?.user || currentUser?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const range = searchParams.get("range") || "30days"
    const startStr = searchParams.get("startDate")
    const endStr = searchParams.get("endDate")

    let startDate = new Date()
    let endDate = new Date()

    const now = new Date()
    if (range === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
    } else if (range === "7days") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (range === "30days") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    } else if (range === "90days") {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    } else if (range === "custom" && startStr && endStr) {
      startDate = new Date(startStr)
      endDate = new Date(endStr)
    } else {
      // Default to 30 days
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Ensure dates are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: "Invalid date range parameters" }, { status: 400 })
    }

    // --- Overview Metrics ---
    
    // Total Patient Users
    const totalPatientUsers = await prisma.user.count({
      where: { role: "PATIENT" },
    })

    // Activation rate
    // formula: activated patient users / total patient users
    const activatedPatientUsers = await prisma.patient.count({
      where: {
        user: {
          role: "PATIENT"
        }
      }
    })
    const activationRate = totalPatientUsers > 0 ? activatedPatientUsers / totalPatientUsers : 0

    // Active Users in the selected period (distinct userIds in TechnicalLimitLog)
    const activeUsersInPeriodLogs = await prisma.technicalLimitLog.findMany({
      where: {
        timestamp: { gte: startDate, lte: endDate },
        userId: { not: null },
      },
      select: { userId: true, timestamp: true },
    })
    const distinctActiveUserIds = new Set(
      activeUsersInPeriodLogs.map(l => l.userId).filter(Boolean) as string[]
    )
    const activeUsersCount = distinctActiveUserIds.size

    // DAU, WAU, MAU
    // DAU (last 24h)
    const dauLogs = await prisma.technicalLimitLog.findMany({
      where: {
        timestamp: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        userId: { not: null },
      },
      select: { userId: true },
    })
    const dauCount = new Set(dauLogs.map(l => l.userId).filter(Boolean) as string[]).size

    // WAU (last 7d)
    const wauLogs = await prisma.technicalLimitLog.findMany({
      where: {
        timestamp: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
        userId: { not: null },
      },
      select: { userId: true },
    })
    const wauCount = new Set(wauLogs.map(l => l.userId).filter(Boolean) as string[]).size

    // MAU (last 30d)
    const mauLogs = await prisma.technicalLimitLog.findMany({
      where: {
        timestamp: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
        userId: { not: null },
      },
      select: { userId: true },
    })
    const mauCount = new Set(mauLogs.map(l => l.userId).filter(Boolean) as string[]).size

    // --- New User Growth Chart ---
    const newUsersList = await prisma.user.findMany({
      where: {
        role: "PATIENT",
        createdAt: { gte: startDate, lte: endDate },
      },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    })

    // Group new users dynamically based on range
    const growthData: { label: string; count: number }[] = []
    const datesMap: Record<string, number> = {}

    if (range === "today" || range === "7days" || range === "30days") {
      // Group by Day
      let current = new Date(startDate.getTime())
      while (current <= endDate) {
        const key = current.toISOString().split("T")[0]
        datesMap[key] = 0
        current.setDate(current.getDate() + 1)
      }

      newUsersList.forEach(u => {
        const key = u.createdAt.toISOString().split("T")[0]
        if (datesMap[key] !== undefined) {
          datesMap[key]++
        }
      })

      Object.entries(datesMap).forEach(([label, count]) => {
        const dateObj = new Date(label)
        const formattedLabel = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        growthData.push({ label: formattedLabel, count })
      })
    } else {
      // Group by Week
      let current = new Date(startDate.getTime())
      while (current <= endDate) {
        const label = `W/O ${current.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
        datesMap[label] = 0
        current.setDate(current.getDate() + 7)
      }

      newUsersList.forEach(u => {
        let matchedLabel = ""
        let currentWeek = new Date(startDate.getTime())
        while (currentWeek <= endDate) {
          const nextWeek = new Date(currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
          if (u.createdAt >= currentWeek && u.createdAt < nextWeek) {
            matchedLabel = `W/O ${currentWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
            break
          }
          currentWeek.setDate(currentWeek.getDate() + 7)
        }
        if (matchedLabel && datesMap[matchedLabel] !== undefined) {
          datesMap[matchedLabel]++
        }
      })

      Object.entries(datesMap).forEach(([label, count]) => {
        growthData.push({ label, count })
      })
    }

    // --- Feature Usage Section ---
    const chatInteractionFrequency = await prisma.message.count({
      where: {
        role: "USER",
        createdAt: { gte: startDate, lte: endDate },
      },
    })

    const moodCheckIns = await prisma.moodEntry.count({
      where: {
        timestamp: { gte: startDate, lte: endDate },
      },
    })

    const avgMoodAggregate = await prisma.moodEntry.aggregate({
      where: {
        timestamp: { gte: startDate, lte: endDate },
        moodScore: { not: null },
      },
      _avg: {
        moodScore: true,
      },
    })
    const avgMoodScore = avgMoodAggregate._avg.moodScore || 0

    const journalEntries = await prisma.journalEntry.count({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
    })

    const activitiesCompleted = await prisma.userActivityLog.count({
      where: {
        timestamp: { gte: startDate, lte: endDate },
      },
    })

    const assessmentsCompleted = await prisma.assessmentAttempt.count({
      where: {
        status: "COMPLETED",
        completedAt: { gte: startDate, lte: endDate },
      },
    })

    // --- Streak Distribution ---
    // patient streak distribution (real-time snapshot)
    const patientStreaks = await prisma.patient.findMany({
      select: { currentStreak: true },
    })

    const streakDistribution = {
      "0": 0,
      "1-3": 0,
      "4-7": 0,
      "8-14": 0,
      "15+": 0,
    }
    patientStreaks.forEach(p => {
      const s = p.currentStreak || 0
      if (s === 0) streakDistribution["0"]++
      else if (s >= 1 && s <= 3) streakDistribution["1-3"]++
      else if (s >= 4 && s <= 7) streakDistribution["4-7"]++
      else if (s >= 8 && s <= 14) streakDistribution["8-14"]++
      else streakDistribution["15+"]++
    })

    // --- Repeat Usage / Stickiness (distinct active days) ---
    // Count active days for each user inside the TechnicalLimitLog
    const activeDaysPerUser: Record<string, Set<string>> = {}
    activeUsersInPeriodLogs.forEach(log => {
      if (log.userId) {
        const dateStr = new Date(log.timestamp).toISOString().split("T")[0]
        if (!activeDaysPerUser[log.userId]) {
          activeDaysPerUser[log.userId] = new Set()
        }
        activeDaysPerUser[log.userId].add(dateStr)
      }
    })

    const repeatUsage = {
      "0 days": Math.max(0, totalPatientUsers - Object.keys(activeDaysPerUser).length),
      "1-3 days": 0,
      "4-7 days": 0,
      "8-14 days": 0,
      "15+ days": 0,
    }

    Object.values(activeDaysPerUser).forEach(datesSet => {
      const daysCount = datesSet.size
      if (daysCount >= 1 && daysCount <= 3) repeatUsage["1-3 days"]++
      else if (daysCount >= 4 && daysCount <= 7) repeatUsage["4-7 days"]++
      else if (daysCount >= 8 && daysCount <= 14) repeatUsage["8-14 days"]++
      else if (daysCount >= 15) repeatUsage["15+ days"]++
    })

    // --- Institution Summary ---
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        status: true,
      },
    })

    const orgUsers = await prisma.user.findMany({
      where: {
        role: "PATIENT",
        orgId: { not: null },
      },
      select: { id: true, orgId: true, patient: { select: { id: true } } },
    })

    // Group users by orgId
    const usersByOrg: Record<string, { id: string; hasProfile: boolean }[]> = {}
    orgUsers.forEach(u => {
      if (u.orgId) {
        if (!usersByOrg[u.orgId]) usersByOrg[u.orgId] = []
        usersByOrg[u.orgId].push({ id: u.id, hasProfile: !!u.patient })
      }
    })

    // Fetch active users in Org (TechnicalLimitLog count in range)
    const orgLimitLogs = await prisma.technicalLimitLog.findMany({
      where: {
        timestamp: { gte: startDate, lte: endDate },
        userId: { not: null },
      },
      select: { userId: true },
    })
    const activeUsersInPeriod = new Set(orgLimitLogs.map(l => l.userId).filter(Boolean) as string[])

    // Count chat usage per user
    const chatUsageLogs = await prisma.message.findMany({
      where: {
        role: "USER",
        createdAt: { gte: startDate, lte: endDate },
        conversation: { userId: { not: null } },
      },
      select: { conversation: { select: { userId: true } } },
    })
    const chatCountByUser: Record<string, number> = {}
    chatUsageLogs.forEach(m => {
      const uid = m.conversation?.userId
      if (uid) {
        chatCountByUser[uid] = (chatCountByUser[uid] || 0) + 1
      }
    })

    // Count mood usage per user
    const moodUsageLogs = await prisma.moodEntry.findMany({
      where: {
        timestamp: { gte: startDate, lte: endDate },
      },
      select: { userId: true },
    })
    const moodCountByUser: Record<string, number> = {}
    moodUsageLogs.forEach(me => {
      moodCountByUser[me.userId] = (moodCountByUser[me.userId] || 0) + 1
    })

    const institutionsData = organizations.map(org => {
      const members = usersByOrg[org.id] || []
      const totalUsers = members.length
      const activatedCount = members.filter(m => m.hasProfile).length
      const activationRate = totalUsers > 0 ? activatedCount / totalUsers : 0

      // Active members (distinct counts)
      const activeCount = members.filter(m => activeUsersInPeriod.has(m.id)).length

      // Chat and Mood aggregates
      let totalChatUsage = 0
      let totalMoodUsage = 0
      members.forEach(m => {
        totalChatUsage += chatCountByUser[m.id] || 0
        totalMoodUsage += moodCountByUser[m.id] || 0
      })

      return {
        id: org.id,
        name: org.name,
        status: org.status,
        totalUsers,
        activeUsers: activeCount,
        activationRate,
        chatUsage: totalChatUsage,
        moodUsage: totalMoodUsage,
      }
    })

    return NextResponse.json({
      overview: {
        totalUsers: totalPatientUsers,
        activeUsers: activeUsersCount,
        activationRate,
        growthData,
      },
      engagement: {
        dau: dauCount,
        wau: wauCount,
        mau: mauCount,
        chatUsage: chatInteractionFrequency,
        moodCheckIns,
        avgMoodScore,
        journalEntries,
        activitiesCompleted,
        assessmentsCompleted,
      },
      streakDistribution,
      repeatUsage,
      institutions: institutionsData,
    })
  } catch (error) {
    console.error("[ADMIN_ANALYTICS_GET]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
