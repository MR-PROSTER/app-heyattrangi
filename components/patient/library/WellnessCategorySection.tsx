"use client"

import type {
  WellnessActivity,
  WellnessCategoryMeta,
} from "@/lib/data/wellnessActivities"
import { WELLNESS_COLOR_THEME } from "@/lib/data/wellnessTheme"
import WellnessActivityCard from "@/components/patient/library/WellnessActivityCard"

interface WellnessCategorySectionProps {
  category: WellnessCategoryMeta
  activities: WellnessActivity[]
  onSelectActivity?: (activity: WellnessActivity) => void
}

export default function WellnessCategorySection({
  category,
  activities,
  onSelectActivity,
}: WellnessCategorySectionProps) {
  const theme = WELLNESS_COLOR_THEME[category.color]

  return (
    <section
      className="space-y-6"
      aria-labelledby={`wellness-category-${category.id}`}
    >
      <div
        className={`relative overflow-hidden rounded-[28px] border border-slate-100/80 p-5 md:p-6 bg-gradient-to-br ${theme.softGradient} shadow-[0_10px_30px_rgba(15,23,42,0.04)]`}
      >
        <div className="flex items-start gap-4 relative z-10">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${theme.iconBg}`}
            aria-hidden
          >
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.4}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={category.iconPath}
              />
            </svg>
          </div>
          <div className="min-w-0 pt-0.5">
            <h4
              id={`wellness-category-${category.id}`}
              className="font-extrabold text-xl md:text-2xl text-slate-800 tracking-tight mb-1"
            >
              {category.title}
            </h4>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              {category.description}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
            style={{ animationDelay: `${index * 45}ms`, animationDuration: "380ms" }}
          >
            <WellnessActivityCard
              activity={activity}
              color={category.color}
              onSelect={onSelectActivity}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
