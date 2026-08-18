import { redirect } from "next/navigation"
import { auth } from "@/auth.config"
import { getCurrentUser } from "@/lib/auth"
import { buildEngagementAnalytics, resolveAdminRange } from "@/lib/admin/analytics"

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
        {label}
      </p>
      <div className="mt-4 text-4xl font-black tracking-tight text-slate-950">{value}</div>
      <p className="mt-3 text-sm text-slate-500">{detail}</p>
    </div>
  )
}

export default async function AdminEngagementPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>
}) {
  const session = await auth()
  const user = await getCurrentUser()

  if (!session?.user || user?.role !== "ADMIN") {
    redirect("/auth/unauthorized")
  }

  const params = new URLSearchParams()
  const resolved = await Promise.resolve(searchParams)
  if (resolved) {
    for (const [key, value] of Object.entries(resolved)) {
      if (Array.isArray(value)) {
        if (value[0]) params.set(key, value[0])
      } else if (typeof value === "string" && value) {
        params.set(key, value)
      }
    }
  }

  const parsed = resolveAdminRange(params)
  if (parsed.error) {
    return <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-sm font-medium text-amber-900">{parsed.error}</div>
  }

  const data = await buildEngagementAnalytics({
    range: parsed.range,
    organizationId: parsed.organizationId || null,
  })

  const maxWeeklyMessages = Math.max(1, ...data.chatFrequency.map((week) => week.messages))
  const maxMoodBars = Math.max(1, ...data.featureUsage.map((item) => item.usage))

  return (
    <section className="grid gap-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-slate-400">
          Engagement
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
          Product usage analytics
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          {data.range.label}. This view focuses on DAU, WAU, MAU, chat frequency,
          repeat usage, streak distribution, and feature usage.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="DAU" value={String(data.engagement.dau)} detail="Active users on the last day of the selected range." />
        <MetricCard label="WAU" value={String(data.engagement.wau)} detail="Active users across the last 7 days of the selected range." />
        <MetricCard label="MAU" value={String(data.engagement.mau)} detail="Active users across the last 30 days of the selected range." />
        <MetricCard label="Repeat usage" value={`${data.engagement.repeatUsagePercent}%`} detail="Weekly active users who returned on at least 2 distinct days." />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
            Chat frequency
          </p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">
            Pragya conversations per active user
          </h2>
          <div className="mt-6 space-y-4">
            {data.chatFrequency.map((week) => {
              const width = `${(week.messages / maxWeeklyMessages) * 100}%`
              return (
                <div key={week.label} className="grid grid-cols-[92px_1fr_72px] items-center gap-4">
                  <div className="text-sm font-bold text-slate-600">{week.label}</div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-slate-950" style={{ width }} />
                  </div>
                  <div className="text-right text-sm font-bold text-slate-700">{week.messagesPerActiveUser}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
            Streaks
          </p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">
            Activity streak distribution
          </h2>
          <div className="mt-6 space-y-3">
            {[
              { label: "0", value: data.engagement.streakDistribution.zero },
              { label: "1-3", value: data.engagement.streakDistribution.oneToThree },
              { label: "4-7", value: data.engagement.streakDistribution.fourToSeven },
              { label: "8+", value: data.engagement.streakDistribution.eightPlus },
            ].map((bucket) => {
              const width = `${(bucket.value / Math.max(1, data.summary.totalUsers)) * 100}%`
              return (
                <div key={bucket.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-700">{bucket.label}</span>
                    <span className="font-bold text-slate-500">{bucket.value}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-[#f59e0b]" style={{ width }} />
                  </div>
                </div>
              )
            })}
          </div>
          <a
            href="/admin/wellbeing"
            className="mt-6 block rounded-3xl bg-slate-50 p-5 transition-colors hover:bg-slate-100"
          >
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
              Wellbeing
            </p>
            <div className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              View mood trends
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Open the dedicated aggregate mood page for coverage, daily distribution,
              and monthly average.
            </p>
          </a>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
          Feature usage
        </p>
        <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">
          What the product is used for
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {data.featureUsage.map((feature) => {
            const width = `${(feature.usage / maxMoodBars) * 100}%`
            return (
              <div key={feature.feature} className="rounded-3xl border border-slate-200 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-slate-900">{feature.feature}</div>
                    <div className="text-xs text-slate-500">{feature.users} users</div>
                  </div>
                  <div className="text-xl font-black text-slate-950">{feature.usage}</div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-slate-950" style={{ width }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
