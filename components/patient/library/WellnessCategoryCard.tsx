"use client"

import type { WellnessCategoryMeta } from "@/lib/data/wellnessActivities"
import { WELLNESS_COLOR_THEME } from "@/lib/data/wellnessTheme"

interface WellnessCategoryCardProps {
  category: WellnessCategoryMeta
  activityCount: number
  isSelected?: boolean
  onSelect: (category: WellnessCategoryMeta) => void
  /**
   * Self Explore Activities tab — same white card layout as the
   * previous Guided meditation section (image area + title + meta).
   */
  exploreStyle?: boolean
}

const EXPLORE_MEDIA: Record<string, string> = {
  teal: "from-teal-100 to-emerald-50 text-teal-600/70",
  green: "from-green-100 to-emerald-50 text-green-600/70",
  purple: "from-violet-100 to-purple-50 text-purple-600/70",
  orange: "from-amber-100 to-orange-50 text-orange-600/70",
  indigo: "from-sky-100 to-indigo-50 text-indigo-600/70",
}

export default function WellnessCategoryCard({
  category,
  activityCount,
  isSelected = false,
  onSelect,
  exploreStyle = false,
}: WellnessCategoryCardProps) {
  const theme = WELLNESS_COLOR_THEME[category.color]

  if (exploreStyle) {
    const media =
      EXPLORE_MEDIA[category.color] ?? EXPLORE_MEDIA.teal

    return (
      <button
        type="button"
        onClick={() => onSelect(category)}
        aria-pressed={isSelected}
        aria-label={`${category.title}, ${activityCount} activities`}
        className={`group w-full text-left bg-white rounded-[20px] md:rounded-[24px] overflow-hidden shadow-[0_4px_16px_rgba(15,23,42,0.04)] border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${theme.ring} ${
          isSelected
            ? `${theme.selectedBorder} shadow-lg`
            : "border-slate-100/80 active:scale-[0.98] md:hover:-translate-y-1 md:hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
        }`}
      >
        <div
          className={`aspect-[4/3] md:aspect-[5/4] m-2.5 md:m-3 mb-0 rounded-[14px] md:rounded-[18px] overflow-hidden bg-gradient-to-br ${media} flex items-center justify-center`}
        >
          <svg
            className="w-10 h-10 md:w-14 md:h-14 transition-transform duration-300 group-hover:scale-105"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.3}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={category.iconPath}
            />
          </svg>
        </div>
        <div className="p-3 pt-2.5 md:p-4 md:pt-3">
          <h4 className="font-bold text-[14px] md:text-[16px] text-slate-800 tracking-tight leading-snug mb-0.5 md:mb-1">
            {category.title}
          </h4>
          <p className="text-[12px] md:text-[13px] text-slate-400 font-medium">
            {activityCount} {activityCount === 1 ? "Activity" : "Activities"}
          </p>
        </div>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(category)}
      aria-pressed={isSelected}
      className={`group relative overflow-hidden rounded-[28px] p-5 md:p-6 flex flex-col items-center text-center h-full border transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${theme.ring} ${
        isSelected
          ? `${theme.selectedBorder} shadow-lg scale-[1.02]`
          : "border-slate-100/80 shadow-[0_8px_30px_rgba(15,23,42,0.04)] hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)] active:scale-[0.98]"
      } bg-gradient-to-br ${theme.softGradient}`}
    >
      <div
        className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-40 blur-2xl pointer-events-none transition-opacity duration-300 ${
          isSelected ? "opacity-70" : "group-hover:opacity-60"
        } ${theme.accent}`}
        aria-hidden
      />

      <div
        className={`relative w-[92px] h-[92px] rounded-full flex items-center justify-center mb-5 shadow-[0_12px_28px_rgba(15,23,42,0.08)] transition-transform duration-300 group-hover:scale-105 group-active:scale-95 ${theme.iconBg}`}
        aria-hidden
      >
        <div
          className={`absolute inset-2 rounded-full border opacity-40 ${theme.iconBorder}`}
        />
        <svg
          className="w-9 h-9"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.35}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d={category.iconPath}
          />
        </svg>
      </div>

      <h4 className="relative font-bold text-slate-800 text-base mb-1 tracking-tight">
        {category.title}
      </h4>
      <p className={`relative text-[11px] font-bold mb-3 tracking-wide ${theme.accentText}`}>
        {activityCount} {activityCount === 1 ? "Activity" : "Activities"}
      </p>
      <p className="relative text-slate-500 text-sm font-medium leading-relaxed mb-4 flex-grow line-clamp-3">
        {category.description}
      </p>
      <div
        className={`relative h-[3px] w-12 rounded-full mt-auto transition-all duration-300 ${
          isSelected ? "w-16" : "group-hover:w-16"
        } ${theme.accent}`}
      />
    </button>
  )
}
