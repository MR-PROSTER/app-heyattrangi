"use client"

import type {
  WellnessActivity,
  WellnessCategoryColor,
} from "@/lib/data/wellnessActivities"
import { WELLNESS_COLOR_THEME } from "@/lib/data/wellnessTheme"

interface WellnessActivityCardProps {
  activity: WellnessActivity
  color: WellnessCategoryColor
  onSelect?: (activity: WellnessActivity) => void
}

export default function WellnessActivityCard({
  activity,
  color,
  onSelect,
}: WellnessActivityCardProps) {
  const theme = WELLNESS_COLOR_THEME[color]

  return (
    <article
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={() => onSelect?.(activity)}
      onKeyDown={(e) => {
        if (!onSelect) return
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect(activity)
        }
      }}
      className={`group relative overflow-hidden rounded-[28px] p-5 md:p-6 border border-slate-100/90 flex flex-col h-full shadow-[0_8px_28px_rgba(15,23,42,0.04)] transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${theme.ring} ${
        onSelect
          ? "cursor-pointer hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.09)] active:scale-[0.985]"
          : ""
      } ${theme.cardGradient}`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 opacity-80 ${theme.progress}`}
        aria-hidden
      />

      <div className="flex items-start justify-between gap-3 mb-4">
        <div
          className={`w-14 h-14 rounded-2xl relative flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105 ${theme.iconBg}`}
          aria-hidden
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.45}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={activity.iconPath}
            />
          </svg>
        </div>

        <span
          className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border shrink-0 ${theme.badge}`}
        >
          {activity.difficulty}
        </span>
      </div>

      <h5 className="font-bold text-[16px] text-slate-800 tracking-tight mb-1.5">
        {activity.title}
      </h5>
      <p className="text-slate-500 text-sm font-medium leading-relaxed mb-5 flex-grow">
        {activity.shortDescription}
      </p>

      <div className="flex items-center justify-between gap-3 mt-auto pt-1">
        <span className="inline-flex items-center gap-1.5 text-slate-500 text-xs font-semibold bg-white/80 border border-slate-100 px-2.5 py-1.5 rounded-full">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {activity.estimatedDuration}
        </span>

        <span
          className={`text-[11px] font-black uppercase tracking-widest ${theme.accentText} opacity-80 group-hover:opacity-100 transition-opacity`}
        >
          View →
        </span>
      </div>
    </article>
  )
}
