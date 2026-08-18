import { redirect } from "next/navigation"
import { addDays } from "date-fns"
import { auth } from "@/auth.config"
import { getCurrentUser } from "@/lib/auth"
import { buildOverviewSnapshot, resolveAdminRange } from "@/lib/admin/analytics"

function toSearchParams(
  input?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>
) {
  if (!input) return new URLSearchParams()

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(input)) {
    if (Array.isArray(value)) {
      if (value[0]) params.set(key, value[0])
      continue
    }
    if (typeof value === "string" && value.length > 0) {
      params.set(key, value)
    }
  }
  return params
}

function pctChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100
  return Number((((current - previous) / previous) * 100).toFixed(1))
}

function deltaLabel(delta: number, isPercent = false) {
  if (!Number.isFinite(delta) || delta === 0) return "No change"
  const sign = delta > 0 ? "↑" : "↓"
  return `${sign} ${Math.abs(delta)}${isPercent ? "%" : ""}`
}

function StatCard({
  label,
  value,
  delta,
  sublabel,
}: {
  label: string
  value: string
  delta: string
  sublabel: string
}) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
        {label}
      </p>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="text-4xl font-black tracking-tight text-slate-950">{value}</div>
        <div className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white">
          {delta}
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-500">{sublabel}</p>
    </div>
  )
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const user = await getCurrentUser()

  if (!user || user.role !== "ADMIN") {
    redirect("/auth/unauthorized")
  }

  const params = toSearchParams(await Promise.resolve(searchParams))

  const parsed = resolveAdminRange(params)
  if (parsed.error) {
    return (
      <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-sm font-medium text-amber-900">
        {parsed.error}
      </div>
    )
  }

  const current = await buildOverviewSnapshot({
    range: parsed.range,
    organizationId: parsed.organizationId || null,
  })

  const spanDays = Math.max(
    1,
    Math.ceil((parsed.range.end.getTime() - parsed.range.start.getTime()) / (24 * 60 * 60 * 1000))
  )
  const previousRange = {
    start: addDays(parsed.range.start, -(spanDays + 1)),
    end: addDays(parsed.range.start, -1),
    preset: parsed.range.preset,
    label: "Previous period",
  } as const

  const previous = await buildOverviewSnapshot({
    range: previousRange,
    organizationId: parsed.organizationId || null,
  })

  const totalUsersDelta = pctChange(current.summary.totalUsers, previous.summary.totalUsers)
  const activeUsersDelta = pctChange(current.summary.activeUsers, previous.summary.activeUsers)
  const activationDelta = current.summary.activationRate - previous.summary.activationRate
  const retentionDelta = current.summary.retentionRate - previous.summary.retentionRate

  const maxGrowth = Math.max(
    1,
    ...current.growth.map((point) => Math.max(point.value, point.activatedUsers))
  )
  const maxMood = Math.max(1, ...current.wellbeing.moodByWeekday.map((point) => point.value))

  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-slate-400">
              Executive snapshot
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              Founder view of Attrangi usage
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              {current.range.label}. The dashboard focuses on acquisition, activation,
              engagement, retention, and institution performance.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">
            Admin data only
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total users"
          value={String(current.summary.totalUsers)}
          delta={deltaLabel(totalUsersDelta)}
          sublabel="Users registered up to the selected period end."
        />
        <StatCard
          label="Active users"
          value={String(current.summary.activeUsers)}
          delta={deltaLabel(activeUsersDelta)}
          sublabel="Unique users with activity in the selected period."
        />
        <StatCard
          label="Activation"
          value={`${current.summary.activationRate}%`}
          delta={deltaLabel(activationDelta, true)}
          sublabel="First Pragya message within 48 hours of signup."
        />
        <StatCard
          label="Retention"
          value={`${current.summary.retentionRate}%`}
          delta={deltaLabel(retentionDelta, true)}
          sublabel="Average weekly cohort retention across W1-W4."
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
                User growth
              </p>
              <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">
                New signups vs activated users
              </h2>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {current.growth.map((point) => {
              const signupsWidth = `${(point.value / maxGrowth) * 100}%`
              const activatedWidth = `${(point.activatedUsers / maxGrowth) * 100}%`
              return (
                <div key={point.date} className="grid grid-cols-[92px_1fr] items-center gap-4">
                  <div className="text-sm font-bold text-slate-600">{point.label}</div>
                  <div className="space-y-2">
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-950"
                        style={{ width: signupsWidth }}
                      />
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-orange-100">
                      <div
                        className="h-full rounded-full bg-[#f59e0b]"
                        style={{ width: activatedWidth }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-950" /> New signups
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" /> Activated users
            </span>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
            Activation
          </p>
          <div className="mt-4 text-4xl font-black tracking-tight text-slate-950">
            {current.summary.activationRate}%
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {current.summary.activatedUsers} / {current.summary.newUsers} users activated
            within 48 hours.
          </p>
          <div className="mt-6 space-y-3">
            {current.activation.funnel.map((item, index) => (
              <div key={item.label} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-900">{item.label}</div>
                  <div className="text-xs text-slate-500">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
            Retention
          </p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">
            Cohort table
          </h2>
          {current.retention.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-sm text-slate-500">
              No retention cohorts found in this range.
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
                  <tr>
                    <th className="px-4 py-4">Signup cohort</th>
                    <th className="px-4 py-4">W1</th>
                    <th className="px-4 py-4">W2</th>
                    <th className="px-4 py-4">W3</th>
                    <th className="px-4 py-4">W4</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {current.retention.map((row) => (
                    <tr key={row.cohort}>
                      <td className="px-4 py-4 font-bold text-slate-900">{row.cohort}</td>
                      <td className="px-4 py-4 text-slate-600">{row.w1}%</td>
                      <td className="px-4 py-4 text-slate-600">{row.w2}%</td>
                      <td className="px-4 py-4 text-slate-600">{row.w3}%</td>
                      <td className="px-4 py-4 text-slate-600">{row.w4}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
            Feature usage
          </p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">
            What people actually use
          </h2>
          <div className="mt-6 space-y-3">
            {current.featureUsage.map((feature) => (
              <div key={feature.feature} className="rounded-2xl border border-slate-200 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-slate-900">{feature.feature}</div>
                    <div className="text-xs text-slate-500">{feature.users} users</div>
                  </div>
                  <div className="text-sm font-black text-slate-900">{feature.usage}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-3xl bg-slate-50 p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
              Mood coverage
            </p>
            <div className="mt-3 text-4xl font-black tracking-tight text-slate-950">
              {current.wellbeing.moodCoveragePercent}%
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {current.wellbeing.moodCoverageUsers} of {current.summary.activeUsers} active users logged at
              least one mood this period.
            </p>
            <div className="mt-4 space-y-2">
              {current.wellbeing.moodByWeekday.map((day) => {
                const width = `${(day.value / maxMood) * 100}%`
                return (
                  <div key={day.label} className="grid grid-cols-[52px_1fr] items-center gap-3">
                    <div className="text-xs font-bold text-slate-500">{day.label}</div>
                    <div className="h-2 overflow-hidden rounded-full bg-white">
                      <div className="h-full rounded-full bg-[#f59e0b]" style={{ width }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 text-sm font-bold text-slate-700">
              {current.wellbeing.noEntriesMessage || `Average mood: ${current.wellbeing.averageMood}`}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
              Institutions
            </p>
            <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">
              Cross-institution comparison
            </h2>
          </div>
        </div>

        {current.institutions.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-sm text-slate-500">
            No institutions found for this filter.
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
                <tr>
                  <th className="px-4 py-4">Institution</th>
                  <th className="px-4 py-4">Users</th>
                  <th className="px-4 py-4">Active</th>
                  <th className="px-4 py-4">Activation</th>
                  <th className="px-4 py-4">Retention</th>
                  <th className="px-4 py-4">Chat</th>
                  <th className="px-4 py-4">Mood</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {current.institutions.map((institution) => (
                  <tr key={institution.id}>
                    <td className="px-4 py-4 font-bold text-slate-900">
                      {institution.name}
                      <div className="text-xs font-medium text-slate-500">
                        {institution.domains.join(", ") || "No domains"}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{institution.totalUsers}</td>
                    <td className="px-4 py-4 text-slate-600">{institution.activeUsers}</td>
                    <td className="px-4 py-4 text-slate-600">{institution.activationRate}%</td>
                    <td className="px-4 py-4 text-slate-600">{institution.retentionRate}%</td>
                    <td className="px-4 py-4 text-slate-600">{institution.chatUsage}</td>
                    <td className="px-4 py-4 text-slate-600">{institution.moodUsage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
