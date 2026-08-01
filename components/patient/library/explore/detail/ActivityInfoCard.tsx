"use client"

import type { ExploreActivity } from "@/data/exploreActivities"
import { EXPLORE_CATEGORY_LABELS } from "@/data/exploreActivities"

interface ActivityInfoCardProps {
  activity: ExploreActivity
}

const ROWS: {
  label: string
  getValue: (a: ExploreActivity) => string
}[] = [
  {
    label: "Category",
    getValue: (a) => EXPLORE_CATEGORY_LABELS[a.category],
  },
  {
    label: "Estimated Duration",
    getValue: (a) => a.duration,
  },
  {
    label: "Difficulty",
    getValue: (a) => a.difficulty,
  },
  {
    label: "Audio Available",
    getValue: (a) => a.audio,
  },
  {
    label: "Type",
    getValue: (a) => a.type,
  },
]

export default function ActivityInfoCard({ activity }: ActivityInfoCardProps) {
  return (
    <section
      aria-labelledby="activity-info-heading"
      className="rounded-[22px] bg-white border border-slate-100/90 shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-5 sm:p-6"
    >
      <h2
        id="activity-info-heading"
        className="text-[13px] font-bold uppercase tracking-widest text-slate-400 mb-4"
      >
        Activity information
      </h2>
      <dl className="space-y-3.5">
        {ROWS.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-4"
          >
            <dt className="text-sm font-medium text-slate-400 shrink-0">
              {row.label}
            </dt>
            <dd className="text-sm font-semibold text-slate-700 text-right">
              {row.getValue(activity)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
