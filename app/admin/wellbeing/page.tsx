import { redirect } from "next/navigation"
import { auth } from "@/auth.config"
import { getCurrentUser } from "@/lib/auth"
import { buildWellbeingAnalytics, resolveAdminRange } from "@/lib/admin/analytics"

function parseParams(
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>
) {
  return Promise.resolve(searchParams).then((resolved) => {
    const params = new URLSearchParams()
    if (!resolved) return params
    for (const [key, value] of Object.entries(resolved)) {
      if (Array.isArray(value)) {
        if (value[0]) params.set(key, value[0])
      } else if (typeof value === "string" && value) {
        params.set(key, value)
      }
    }
    return params
  })
}

function moodLabelFromScore(score: number) {
  if (score >= 4.5) return "Great"
  if (score >= 3.5) return "Good"
  if (score >= 2.5) return "Okay"
  if (score >= 1.5) return "Meh"
  return "Low"
}

export default async function AdminWellbeingPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>
}) {
  const session = await auth()
  const user = await getCurrentUser()

  if (!session?.user || user?.role !== "ADMIN") {
    redirect("/auth/unauthorized")
  }

  const params = await parseParams(searchParams)
  const parsed = resolveAdminRange(params)

  if (parsed.error) {
    return (
      <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-sm font-medium text-amber-900">
        {parsed.error}
      </div>
    )
  }

  const data = await buildWellbeingAnalytics({
    range: parsed.range,
    organizationId: parsed.organizationId || null,
  })

  const maxMoodDay = Math.max(1, ...data.moodByWeekday.map((day) => day.value))
  const avgLabel = data.summary.moodEntries > 0 ? moodLabelFromScore(data.summary.averageMood) : null

  return (
    <section className="grid gap-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-slate-400">
          Wellbeing
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
          Aggregate mood activity
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          {data.range.label}. This page only shows aggregate mood usage and averages.
          No individual emotional profiles or raw notes are exposed.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Mood coverage", value: `${data.summary.moodCoveragePercent}%`, detail: "Active users who logged at least one mood." },
          { label: "Mood users", value: String(data.summary.moodCoverageUsers), detail: "Unique users who logged mood entries." },
          { label: "Mood entries", value: String(data.summary.moodEntries), detail: "Total mood check-ins in the selected period." },
          { label: "Average mood", value: data.summary.moodEntries > 0 ? `${data.summary.averageMood} / 5` : "No Mood Entries found", detail: avgLabel ? `Overall mood trends as ${avgLabel}.` : "No mood activity in this period." },
        ].map((item) => (
          <div key={item.label} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
              {item.label}
            </div>
            <div className="mt-4 text-4xl font-black tracking-tight text-slate-950">
              {item.value}
            </div>
            <p className="mt-3 text-sm text-slate-500">{item.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
            Daily mood distribution
          </p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">
            Mood activity by weekday
          </h2>
          {data.summary.moodEntries === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-sm text-slate-500">
              No Mood Entries found.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {data.moodByWeekday.map((day) => {
                const width = `${(day.value / maxMoodDay) * 100}%`
                return (
                  <div key={day.label} className="grid grid-cols-[64px_1fr_56px] items-center gap-4">
                    <div className="text-sm font-bold text-slate-600">{day.label}</div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-[#f59e0b]" style={{ width }} />
                    </div>
                    <div className="text-right text-sm font-bold text-slate-700">{day.value}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
            Summary
          </p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">
            Monthly mood snapshot
          </h2>
          <div className="mt-6 rounded-3xl bg-slate-50 p-6">
            <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
              Current range
            </div>
            <div className="mt-3 text-4xl font-black tracking-tight text-slate-950">
              {data.summary.moodEntries > 0 ? `${data.summary.averageMood} / 5` : "No Mood Entries found"}
            </div>
            <p className="mt-3 text-sm text-slate-600">
              {data.noEntriesMessage || `Based on ${data.summary.moodEntries} entries in the selected range.`}
            </p>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-200 p-5">
            <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
              Mood trend note
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {data.summary.moodEntries > 0
                ? `The selected range averages ${data.summary.averageMood} / 5, with ${data.summary.moodCoverageUsers} users contributing mood entries.`
                : "No Mood Entries found for the selected range."}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
          Guardrails
        </p>
        <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">
          What is intentionally excluded
        </h2>
        <ul className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
          <li>Raw chat messages</li>
          <li>Journal content</li>
          <li>Individual emotional profiles</li>
          <li>AI-generated interpretations</li>
        </ul>
      </div>
    </section>
  )
}
