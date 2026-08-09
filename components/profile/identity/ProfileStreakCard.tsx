"use client"

import Link from "next/link"

interface ProfileStreakCardProps {
  /** Consecutive login / care-credit streak days from Patient.currentStreak */
  streakDays: number
  className?: string
}

function buildMonthDots(streakDays: number): ("filled" | "today" | "empty")[] {
  const cells = 28
  const active = Math.max(0, Math.min(streakDays, cells))
  return Array.from({ length: cells }, (_, i) => {
    const dayFromEnd = cells - 1 - i
    if (dayFromEnd === 0) return "today"
    if (dayFromEnd < active) return "filled"
    return "empty"
  })
}

export default function ProfileStreakCard({
  streakDays,
  className = "",
}: ProfileStreakCardProps) {
  const safeDays = Math.max(0, streakDays)
  const weeks = Math.max(0, Math.floor(safeDays / 7))
  const showWeeks = weeks >= 1
  const displayValue = showWeeks ? weeks : Math.max(safeDays, 0)
  const unitLabel = showWeeks ? (weeks === 1 ? "Week" : "Weeks") : safeDays === 1 ? "Day" : "Days"
  const dots = buildMonthDots(safeDays)

  return (
    <article
      className={`rounded-[24px] bg-white border border-white/80 shadow-[0_10px_30px_rgba(15,23,42,0.06)] p-4 sm:p-5 ${className}`}
      aria-label={`Current streak: ${displayValue} ${unitLabel.toLowerCase()}`}
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-base font-bold text-gray-900">Streak</h3>
        <span
          className="text-sm font-medium text-gray-400"
        >
          This month ›
        </span>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex flex-col items-center shrink-0">
          <div
            className="relative flex h-16 w-16 items-center justify-center"
            aria-hidden="true"
          >
            <svg viewBox="0 0 64 64" className="absolute inset-0 h-full w-full drop-shadow-sm">
              <path
                d="M32 56S8 40 8 24a12 12 0 0 1 24-4 12 12 0 0 1 24 4c0 16-24 32-24 32z"
                fill="#FF6B8A"
              />
            </svg>
            <span className="relative z-[1] text-xl font-black text-white tabular-nums pt-1">
              {displayValue}
            </span>
          </div>
          <p className="mt-1 text-sm font-bold text-[#F97316]">{unitLabel}</p>
        </div>

        <div
          className="flex-1 grid grid-cols-7 gap-1.5 content-center"
          aria-hidden="true"
        >
          {dots.map((state, i) => (
            <span
              key={i}
              className={`mx-auto h-2 w-2 rounded-full ${
                state === "filled"
                  ? "bg-gray-900"
                  : state === "today"
                    ? "border-[1.5px] border-gray-900 bg-white"
                    : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
    </article>
  )
}
