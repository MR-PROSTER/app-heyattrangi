import { addDays, endOfDay, endOfMonth, endOfWeek, format, startOfDay, startOfMonth, startOfWeek, subDays } from "date-fns"
import { prisma } from "@/lib/prisma"

export type AdminDateRange = {
  start: Date
  end: Date
  preset: "today" | "last7" | "last30" | "month" | "custom"
  label: string
}

type AnyEvent = {
  userId: string
  at: Date
}

type SnapshotParams = {
  range: AdminDateRange
  organizationId?: string | null
}

export type OverviewSnapshot = Awaited<ReturnType<typeof buildOverviewSnapshot>>

function toKey(date: Date) {
  return format(date, "yyyy-MM-dd")
}

function cloneDate(date: Date) {
  return new Date(date.getTime())
}

function getWeekLabel(date: Date) {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  const end = endOfWeek(date, { weekStartsOn: 1 })
  return `${format(start, "MMM d")}–${format(end, "MMM d")}`
}

function getRangeLabel(start: Date, end: Date) {
  return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`
}

export function resolveAdminRange(
  searchParams: URLSearchParams | { get(name: string): string | null }
): { range: AdminDateRange; error?: string; status?: number; organizationId: string | null } {
  const preset = (searchParams.get("range") || "last7") as AdminDateRange["preset"]
  const organizationId = searchParams.get("organizationId")
  const now = new Date()

  if (preset === "custom") {
    const startValue = searchParams.get("start")
    const endValue = searchParams.get("end")

    if (!startValue || !endValue) {
      return {
        range: {
          start: startOfDay(subDays(now, 6)),
          end: endOfDay(now),
          preset: "last7",
          label: "Last 7 days",
        },
        organizationId,
        error: "Custom ranges require both start and end dates.",
        status: 400,
      }
    }

    const start = new Date(startValue)
    const end = new Date(endValue)

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return {
        range: {
          start: startOfDay(subDays(now, 6)),
          end: endOfDay(now),
          preset: "last7",
          label: "Last 7 days",
        },
        organizationId,
        error: "Invalid start or end date.",
        status: 400,
      }
    }

    const normalizedStart = startOfDay(start)
    const normalizedEnd = endOfDay(end)

    return {
      range: {
        start: normalizedStart,
        end: normalizedEnd,
        preset: "custom",
        label: getRangeLabel(normalizedStart, normalizedEnd),
      },
      organizationId,
    }
  }

  if (preset === "today") {
    const start = startOfDay(now)
    return {
      range: { start, end: endOfDay(now), preset, label: "Today" },
      organizationId,
    }
  }

  if (preset === "last30") {
    const start = startOfDay(subDays(now, 29))
    return {
      range: { start, end: endOfDay(now), preset, label: "Last 30 days" },
      organizationId,
    }
  }

  if (preset === "month") {
    const start = startOfMonth(now)
    const end = endOfMonth(now)
    return {
      range: { start, end, preset, label: "This month" },
      organizationId,
    }
  }

  const start = startOfDay(subDays(now, 6))
  return {
    range: { start, end: endOfDay(now), preset: "last7", label: "Last 7 days" },
    organizationId,
  }
}

async function fetchUsers(range: AdminDateRange, organizationId?: string | null) {
  return prisma.user.findMany({
    where: {
      ...(organizationId ? { orgId: organizationId } : {}),
      createdAt: {
        lte: range.end,
      },
    },
    select: {
      id: true,
      createdAt: true,
      orgId: true,
    },
  })
}

async function fetchSignups(range: AdminDateRange, organizationId?: string | null) {
  return prisma.user.findMany({
    where: {
      ...(organizationId ? { orgId: organizationId } : {}),
      createdAt: {
        gte: range.start,
        lte: range.end,
      },
    },
    select: {
      id: true,
      createdAt: true,
      orgId: true,
    },
  })
}

async function fetchActivityEvents(range: AdminDateRange, organizationId?: string | null) {
  const [moods, journals, activities, messages] = await Promise.all([
    prisma.moodEntry.findMany({
      where: {
        timestamp: {
          gte: range.start,
          lte: range.end,
        },
        ...(organizationId ? { user: { orgId: organizationId } } : {}),
      },
      select: { userId: true, timestamp: true },
    }),
    prisma.journalEntry.findMany({
      where: {
        createdAt: {
          gte: range.start,
          lte: range.end,
        },
        ...(organizationId ? { user: { orgId: organizationId } } : {}),
      },
      select: { userId: true, createdAt: true },
    }),
    prisma.userActivityLog.findMany({
      where: {
        timestamp: {
          gte: range.start,
          lte: range.end,
        },
        ...(organizationId ? { user: { orgId: organizationId } } : {}),
      },
      select: { userId: true, timestamp: true },
    }),
    prisma.message.findMany({
      where: {
        createdAt: {
          gte: range.start,
          lte: range.end,
        },
        role: "USER",
        conversation: {
          is: {
            userId: {
              not: null,
            },
            ...(organizationId ? { user: { orgId: organizationId } } : {}),
          },
        },
      },
      select: {
        createdAt: true,
        conversation: {
          select: {
            userId: true,
          },
        },
      },
    }),
  ])

  const events: AnyEvent[] = []

  for (const mood of moods) {
    events.push({ userId: mood.userId, at: mood.timestamp })
  }
  for (const journal of journals) {
    events.push({ userId: journal.userId, at: journal.createdAt })
  }
  for (const activity of activities) {
    events.push({ userId: activity.userId, at: activity.timestamp })
  }
  for (const message of messages) {
    if (message.conversation?.userId) {
      events.push({ userId: message.conversation.userId, at: message.createdAt })
    }
  }

  return { moods, journals, activities, messages, events }
}

function buildUserActivityIndex(events: AnyEvent[]) {
  const map = new Map<string, Set<string>>()
  for (const event of events) {
    const bucket = map.get(event.userId) || new Set<string>()
    bucket.add(toKey(event.at))
    map.set(event.userId, bucket)
  }
  return map
}

function buildDailySeries(range: AdminDateRange, values: Map<string, number>) {
  const days: { date: string; label: string; value: number }[] = []
  const cursor = startOfDay(cloneDate(range.start))

  while (cursor <= range.end) {
    const key = toKey(cursor)
    days.push({
      date: key,
      label: format(cursor, "EEE d"),
      value: values.get(key) || 0,
    })
    cursor.setDate(cursor.getDate() + 1)
  }

  return days
}

function weekBuckets(range: AdminDateRange) {
  const start = startOfWeek(range.start, { weekStartsOn: 1 })
  const end = endOfWeek(range.end, { weekStartsOn: 1 })
  const buckets: { start: Date; end: Date; label: string }[] = []
  const cursor = cloneDate(start)
  while (cursor <= end) {
    const weekStart = startOfWeek(cursor, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(cursor, { weekStartsOn: 1 })
    buckets.push({
      start: weekStart,
      end: weekEnd,
      label: getWeekLabel(cursor),
    })
    cursor.setDate(cursor.getDate() + 7)
  }
  return buckets
}

function getWeekRetention(
  cohortUsers: { id: string; createdAt: Date }[],
  activityIndex: Map<string, Set<string>>
) {
  const buckets = [1, 2, 3, 4] as const
  const results = buckets.map((week) => {
    const startOffset = week * 7
    const endOffset = startOffset + 6
    let retained = 0

    for (const user of cohortUsers) {
      const signupDay = startOfDay(user.createdAt)
      const activityDays = activityIndex.get(user.id)
      if (!activityDays) continue

      let hasActivity = false
      for (let offset = startOffset; offset <= endOffset; offset++) {
        const candidate = addDays(signupDay, offset)
        if (activityDays.has(toKey(candidate))) {
          hasActivity = true
          break
        }
      }

      if (hasActivity) retained++
    }

    return cohortUsers.length > 0 ? Number(((retained / cohortUsers.length) * 100).toFixed(1)) : 0
  })

  return results
}

async function getSignupActivations(
  signups: { id: string; createdAt: Date }[],
  organizationId?: string | null
) {
  if (signups.length === 0) {
    return { activatedUsers: 0, activationEvents: new Map<string, Date>() }
  }

  const signupIds = signups.map((user) => user.id)
  const earliest = signups.reduce((min, user) => (user.createdAt < min ? user.createdAt : min), signups[0].createdAt)
  const latest = signups.reduce((max, user) => (user.createdAt > max ? user.createdAt : max), signups[0].createdAt)
  const windowEnd = addDays(endOfDay(latest), 2)

  const messages = await prisma.message.findMany({
    where: {
      role: "USER",
      createdAt: {
        gte: startOfDay(earliest),
        lte: windowEnd,
      },
      conversation: {
        is: {
          userId: {
            in: signupIds,
          },
          ...(organizationId ? { user: { orgId: organizationId } } : {}),
        },
      },
    },
    select: {
      createdAt: true,
      conversation: {
        select: {
          userId: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  })

  const firstMessageByUser = new Map<string, Date>()
  for (const message of messages) {
    const userId = message.conversation.userId
    if (!userId || firstMessageByUser.has(userId)) continue
    firstMessageByUser.set(userId, message.createdAt)
  }

  let activatedUsers = 0
  for (const signup of signups) {
    const firstMessage = firstMessageByUser.get(signup.id)
    if (firstMessage && firstMessage.getTime() <= addDays(signup.createdAt, 2).getTime()) {
      activatedUsers++
    }
  }

  return { activatedUsers, activationEvents: firstMessageByUser }
}

async function getOrganizations(organizationId?: string | null) {
  if (organizationId) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, name: true, domains: true },
    })
    return org ? [org] : []
  }

  return prisma.organization.findMany({
    select: {
      id: true,
      name: true,
      domains: true,
    },
    orderBy: {
      name: "asc",
    },
  })
}

async function buildRetentionTable(
  range: AdminDateRange,
  signups: { id: string; createdAt: Date }[],
  activityIndex: Map<string, Set<string>>
) {
  const cohortMap = new Map<string, { label: string; users: { id: string; createdAt: Date }[] }>()

  for (const user of signups) {
    const cohortStart = startOfWeek(user.createdAt, { weekStartsOn: 1 })
    const key = toKey(cohortStart)
    const existing = cohortMap.get(key)
    if (existing) {
      existing.users.push(user)
    } else {
      cohortMap.set(key, {
        label: `${format(cohortStart, "MMM d")}–${format(addDays(cohortStart, 6), "MMM d")}`,
        users: [user],
      })
    }
  }

  return [...cohortMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, cohort]) => ({
      cohort: cohort.label,
      w1: getWeekRetention(cohort.users, activityIndex)[0],
      w2: getWeekRetention(cohort.users, activityIndex)[1],
      w3: getWeekRetention(cohort.users, activityIndex)[2],
      w4: getWeekRetention(cohort.users, activityIndex)[3],
      users: cohort.users.length,
    }))
}

async function buildSnapshotBase({ range, organizationId }: SnapshotParams) {
  const [users, signups, activity, orgs] = await Promise.all([
    fetchUsers(range, organizationId),
    fetchSignups(range, organizationId),
    fetchActivityEvents(range, organizationId),
    getOrganizations(organizationId),
  ])

  const activeUserIds = new Set(activity.events.map((event) => event.userId))
  const activeUsers = activeUserIds.size
  const totalUsers = users.length
  const newUsers = signups.length
  const activation = await getSignupActivations(signups, organizationId)
  const activationRate = newUsers > 0 ? Number(((activation.activatedUsers / newUsers) * 100).toFixed(1)) : 0
  const activityIndex = buildUserActivityIndex(activity.events)
  const retentionTable = await buildRetentionTable(range, signups, activityIndex)
  const activeUsersAt = (days: number) => {
    const threshold = subDays(range.end, days - 1)
    return new Set(
      activity.events
        .filter((event) => event.at >= startOfDay(threshold) && event.at <= range.end)
        .map((event) => event.userId)
    ).size
  }
  const activeUsersWith2Days = [...activityIndex.values()].filter((days) => days.size >= 2).length
  const repeatUsagePercent =
    activeUsers > 0 ? Number(((activeUsersWith2Days / activeUsers) * 100).toFixed(1)) : 0
  const streakDistribution = {
    zero: users.filter((user) => (activityIndex.get(user.id)?.size || 0) === 0).length,
    oneToThree: users.filter((user) => {
      const count = activityIndex.get(user.id)?.size || 0
      return count >= 1 && count <= 3
    }).length,
    fourToSeven: users.filter((user) => {
      const count = activityIndex.get(user.id)?.size || 0
      return count >= 4 && count <= 7
    }).length,
    eightPlus: users.filter((user) => {
      const count = activityIndex.get(user.id)?.size || 0
      return count >= 8
    }).length,
  }

  const totalRetentionValues = retentionTable.flatMap((row) => [row.w1, row.w2, row.w3, row.w4]).filter((value) => value > 0)
  const retentionRate = totalRetentionValues.length
    ? Number((totalRetentionValues.reduce((sum, value) => sum + value, 0) / totalRetentionValues.length).toFixed(1))
    : 0

  const signupsByDay = new Map<string, number>()
  for (const signup of signups) {
    const key = toKey(signup.createdAt)
    signupsByDay.set(key, (signupsByDay.get(key) || 0) + 1)
  }

  const activatedByDay = new Map<string, number>()
  for (const signup of signups) {
    const firstMessage = activation.activationEvents.get(signup.id)
    if (!firstMessage) continue
    const withinWindow = firstMessage.getTime() <= addDays(signup.createdAt, 2).getTime()
    if (!withinWindow) continue
    const key = toKey(signup.createdAt)
    activatedByDay.set(key, (activatedByDay.get(key) || 0) + 1)
  }

  const growth = buildDailySeries(range, signupsByDay).map((point) => ({
    ...point,
    activatedUsers: activatedByDay.get(point.date) || 0,
  }))

  const moodEntries = await prisma.moodEntry.findMany({
    where: {
      timestamp: { gte: range.start, lte: range.end },
      ...(organizationId ? { user: { orgId: organizationId } } : {}),
    },
    select: {
      userId: true,
      mood: true,
      moodScore: true,
      timestamp: true,
    },
    orderBy: { timestamp: "asc" },
  })

  const journalEntries = await prisma.journalEntry.findMany({
    where: {
      createdAt: { gte: range.start, lte: range.end },
      ...(organizationId ? { user: { orgId: organizationId } } : {}),
    },
    select: { userId: true, id: true, createdAt: true },
  })

  const activityLogs = await prisma.userActivityLog.findMany({
    where: {
      timestamp: { gte: range.start, lte: range.end },
      ...(organizationId ? { user: { orgId: organizationId } } : {}),
    },
    select: { userId: true, id: true, timestamp: true },
  })

  const moodCoverageUsers = new Set(moodEntries.map((entry) => entry.userId))

  const moodByWeekday = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
  ].map((label, idx) => ({
    label,
    value: moodEntries.filter((entry) => {
      const day = entry.timestamp.getDay()
      const normalized = day === 0 ? 6 : day - 1
      return normalized === idx
    }).length,
  }))

  const monthlyMoodAverage =
    moodEntries.length > 0
      ? Number(
          (
            moodEntries.reduce((sum, entry) => {
              const score =
                entry.moodScore ??
                (String(entry.mood).toUpperCase() === "GREAT"
                  ? 5
                  : String(entry.mood).toUpperCase() === "GOOD"
                  ? 4
                  : String(entry.mood).toUpperCase() === "OKAY" || String(entry.mood).toUpperCase() === "NEUTRAL"
                  ? 3
                  : String(entry.mood).toUpperCase() === "MEH" || String(entry.mood).toUpperCase() === "BAD"
                  ? 2
                  : 1)
              return sum + score
            }, 0) / moodEntries.length
          ).toFixed(1)
        )
      : 0

  const featureUsage = [
    { feature: "Pragya", users: activeUserIds.size, usage: activity.messages.length },
    { feature: "Mood", users: moodCoverageUsers.size, usage: moodEntries.length },
    { feature: "Journaling", users: new Set(journalEntries.map((entry) => entry.userId)).size, usage: journalEntries.length },
    { feature: "Wellness", users: new Set(activityLogs.map((entry) => entry.userId)).size, usage: activityLogs.length },
  ]

  const chatMessagesPerWeek = weekBuckets(range).map((bucket) => {
    const messages = activity.messages.filter((message) => {
      const timestamp = message.createdAt
      return timestamp >= bucket.start && timestamp <= bucket.end
    })
    const uniqueActiveUsers = new Set(
      messages.map((message) => message.conversation?.userId).filter(Boolean) as string[]
    ).size

    return {
      label: bucket.label,
      messages: messages.length,
      activeUsers: uniqueActiveUsers,
      messagesPerActiveUser:
        uniqueActiveUsers > 0 ? Number((messages.length / uniqueActiveUsers).toFixed(1)) : 0,
    }
  })

  return {
    range: {
      start: range.start.toISOString(),
      end: range.end.toISOString(),
      label: range.label,
      preset: range.preset,
    },
    summary: {
      totalUsers,
      activeUsers,
      activationRate,
      retentionRate,
      newUsers,
      activatedUsers: activation.activatedUsers,
    },
    growth,
    activation: {
      signedUpUsers: newUsers,
      activatedUsers: activation.activatedUsers,
      funnel: [
        { label: "Signed up", value: newUsers },
        { label: "Activated", value: activation.activatedUsers },
      ],
    },
    retention: retentionTable,
    featureUsage,
    wellbeing: {
      moodCoveragePercent: activeUsers > 0 ? Number(((moodCoverageUsers.size / activeUsers) * 100).toFixed(1)) : 0,
      moodCoverageUsers: moodCoverageUsers.size,
      moodEntries: moodEntries.length,
      moodByWeekday,
      averageMood: monthlyMoodAverage,
      noEntriesMessage: moodEntries.length === 0 ? "No Mood Entries found" : null,
    },
    engagement: {
      dau: activeUsersAt(1),
      wau: activeUsersAt(7),
      mau: activeUsersAt(30),
      repeatUsagePercent,
      streakDistribution,
    },
    chatFrequency: chatMessagesPerWeek,
    organizations: orgs,
  }
}

export async function buildOverviewSnapshot({ range, organizationId }: SnapshotParams) {
  const base = await buildSnapshotBase({ range, organizationId })
  const institutions = base.organizations.length
    ? await Promise.all(
        base.organizations.map(async (org) => {
          const orgSnapshot = await buildSnapshotBase({
            range,
            organizationId: org.id,
          })
          return {
            id: org.id,
            name: org.name,
            domains: org.domains,
            totalUsers: orgSnapshot.summary.totalUsers,
            activeUsers: orgSnapshot.summary.activeUsers,
            activationRate: orgSnapshot.summary.activationRate,
            retentionRate: orgSnapshot.summary.retentionRate,
            chatUsage: orgSnapshot.chatFrequency.reduce((sum, item) => sum + item.messages, 0),
            moodUsage: orgSnapshot.wellbeing.moodEntries,
          }
        })
      )
    : []

  return {
    range: base.range,
    summary: base.summary,
    growth: base.growth,
    activation: base.activation,
    retention: base.retention,
    featureUsage: base.featureUsage,
    wellbeing: base.wellbeing,
    chatFrequency: base.chatFrequency,
    institutions,
  }
}

export async function buildEngagementAnalytics(params: SnapshotParams) {
  const snapshot = await buildSnapshotBase(params)
  return {
    range: snapshot.range,
    summary: snapshot.summary,
    growth: snapshot.growth,
    activation: snapshot.activation,
    retention: snapshot.retention,
    featureUsage: snapshot.featureUsage,
    chatFrequency: snapshot.chatFrequency,
    engagement: snapshot.engagement,
  }
}

export async function buildWellbeingAnalytics(params: SnapshotParams) {
  const snapshot = await buildSnapshotBase(params)
  return {
    range: snapshot.range,
    summary: {
      moodCoveragePercent: snapshot.wellbeing.moodCoveragePercent,
      moodCoverageUsers: snapshot.wellbeing.moodCoverageUsers,
      moodEntries: snapshot.wellbeing.moodEntries,
      averageMood: snapshot.wellbeing.averageMood,
    },
    moodByWeekday: snapshot.wellbeing.moodByWeekday,
    noEntriesMessage: snapshot.wellbeing.noEntriesMessage,
  }
}

export async function buildInstitutionAnalytics(params: SnapshotParams) {
  const snapshot = await buildSnapshotBase(params)
  const institutions = snapshot.organizations.length
    ? await Promise.all(
        snapshot.organizations.map(async (org) => {
          const orgSnapshot = await buildSnapshotBase({
            range: params.range,
            organizationId: org.id,
          })
          return {
            id: org.id,
            name: org.name,
            domains: org.domains,
            totalUsers: orgSnapshot.summary.totalUsers,
            activeUsers: orgSnapshot.summary.activeUsers,
            activationRate: orgSnapshot.summary.activationRate,
            retentionRate: orgSnapshot.summary.retentionRate,
            chatUsage: orgSnapshot.chatFrequency.reduce((sum, item) => sum + item.messages, 0),
            moodUsage: orgSnapshot.wellbeing.moodEntries,
          }
        })
      )
    : []

  return {
    range: snapshot.range,
    institutions,
  }
}
