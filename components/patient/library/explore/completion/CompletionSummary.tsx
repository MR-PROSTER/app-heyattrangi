"use client"

import { EXPLORE_CATEGORY_LABELS } from "@/data/exploreActivities"
import type { ExploreActivity } from "@/data/exploreActivities"
import { formatElapsed } from "@/components/patient/library/explore/session/SessionState"

interface CompletionSummaryProps {
  activity: ExploreActivity
  elapsedMs: number
  completedAt: Date
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function CompletionSummary({
  activity,
  elapsedMs,
  completedAt,
}: CompletionSummaryProps) {
  const rows = [
    { label: "Activity", value: activity.title },
    { label: "Elapsed time", value: formatElapsed(elapsedMs) },
    { label: "Date", value: formatDate(completedAt) },
    {
      label: "Category",
      value: EXPLORE_CATEGORY_LABELS[activity.category],
    },
  ]

  return (
    <section
      aria-labelledby="completion-summary-heading"
      className="w-full rounded-[22px] bg-white border border-slate-100/90 shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-5 sm:p-6"
    >
      <h2
        id="completion-summary-heading"
        className="text-[13px] font-bold uppercase tracking-widest text-slate-400 mb-4"
      >
        Summary
      </h2>
      <dl className="space-y-3.5">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-4"
          >
            <dt className="text-sm font-medium text-slate-400 shrink-0">
              {row.label}
            </dt>
            <dd className="text-sm font-semibold text-slate-700 text-right">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
