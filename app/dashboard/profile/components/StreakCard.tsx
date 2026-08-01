import Link from "next/link"
import { buildStreakDots, streakWeeksFromDays } from "../lib/profileDisplay"

export interface StreakCardProps {
  streakDays: number
  monthHref?: string
  className?: string
}

/**
 * Display-only streak card. Always visible — including 0 Weeks.
 */
export default function StreakCard({
  streakDays,
  monthHref = "/dashboard/settings",
  className = "",
}: StreakCardProps) {
  const weeks = streakWeeksFromDays(streakDays)
  const dots = buildStreakDots(streakDays)

  return (
    <article
      className={`rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)]
        p-[var(--text-base)] sm:p-5
        shadow-[0_10px_30px_color-mix(in_srgb,var(--color-text-primary)_6%,transparent)]
        transition-shadow duration-150 hover:shadow-[0_12px_32px_color-mix(in_srgb,var(--color-text-primary)_8%,transparent)]
        ${className}`}
      aria-label={`Current streak: ${weeks} weeks`}
    >
      <div className="mb-[var(--text-base)] flex items-center justify-between gap-[var(--text-xs)]">
        <h3 className="text-[var(--text-base)] font-bold text-[var(--color-text-primary)]">Streak</h3>
        <Link
          href={monthHref}
          className="inline-flex min-h-11 items-center gap-1 rounded-[var(--radius-sm)] px-1
            text-[var(--text-sm)] font-medium text-[var(--color-text-muted)]
            transition-colors duration-150 hover:text-[var(--color-text-secondary)] active:scale-[0.98]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2"
        >
          This Month
          <svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex shrink-0 flex-col items-center">
          <div className="relative flex size-16 items-center justify-center" aria-hidden="true">
            <svg viewBox="0 0 64 64" className="absolute inset-0 size-full">
              <path
                d="M32 56S8 40 8 24a12 12 0 0 1 24-4 12 12 0 0 1 24 4c0 16-24 32-24 32z"
                fill="var(--color-brand)"
              />
            </svg>
            <span className="relative z-[1] pt-1 text-[var(--text-xl)] font-black tabular-nums text-white">
              {weeks}
            </span>
          </div>
          <p className="mt-1 text-[var(--text-sm)] font-bold text-[var(--color-brand)]">Weeks</p>
        </div>

        <div className="grid flex-1 grid-cols-7 content-center gap-1.5" aria-hidden="true">
          {dots.map((state, i) => (
            <span
              key={i}
              className={`mx-auto size-2 rounded-full ${
                state === "filled"
                  ? "bg-[var(--color-text-primary)]"
                  : state === "today"
                    ? "border-[1.5px] border-[var(--color-text-primary)] bg-[var(--color-surface)]"
                    : "bg-[var(--color-border)]"
              }`}
            />
          ))}
        </div>
      </div>
    </article>
  )
}
