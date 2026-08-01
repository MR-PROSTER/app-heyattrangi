"use client"

import type { ExploreActivityIcon } from "@/data/exploreActivities"

const ICON_PATHS: Record<ExploreActivityIcon, string> = {
  box: "M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  wind: "M12 3c-1.5 3-4 5-4 8a4 4 0 008 0c0-3-2.5-5-4-8z M4.5 12.5c1.5-.5 3 0 4.5 1.5M19.5 12.5c-1.5-.5-3 0-4.5 1.5",
  sigh: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3",
  senses:
    "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  move: "M13 10V3L4 14h7v7l9-11h-7z",
  scan: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  muscle:
    "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  journal:
    "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  moon: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z",
}

const CATEGORY_ICON_BG: Record<string, string> = {
  breathing: "bg-teal-50 text-teal-600",
  grounding: "bg-green-50 text-green-600",
  relaxation: "bg-purple-50 text-purple-600",
  journaling: "bg-orange-50 text-orange-600",
  sleep: "bg-indigo-50 text-indigo-600",
}

interface ActivityIconProps {
  icon: ExploreActivityIcon
  category: string
  size?: "md" | "lg"
  className?: string
}

const SIZE_STYLES = {
  md: { wrap: "w-11 h-11 rounded-2xl", svg: "w-5 h-5" },
  lg: { wrap: "w-24 h-24 rounded-[28px]", svg: "w-10 h-10" },
} as const

export default function ActivityIcon({
  icon,
  category,
  size = "md",
  className = "",
}: ActivityIconProps) {
  const tone = CATEGORY_ICON_BG[category] ?? "bg-slate-50 text-slate-600"
  const sizeStyle = SIZE_STYLES[size]

  return (
    <div
      className={`${sizeStyle.wrap} flex items-center justify-center shrink-0 ${tone} ${className}`}
      aria-hidden
    >
      <svg
        className={sizeStyle.svg}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d={ICON_PATHS[icon]}
        />
      </svg>
    </div>
  )
}
