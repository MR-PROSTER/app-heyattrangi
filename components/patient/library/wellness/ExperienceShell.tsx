"use client"

import type { ReactNode } from "react"
import type { WellnessCategoryColor } from "@/lib/data/wellnessActivities"
import { WELLNESS_COLOR_THEME } from "@/lib/data/wellnessTheme"

interface ExperienceShellProps {
  title: string
  color: WellnessCategoryColor
  progress: number
  progressLabel?: string
  onExit: () => void
  children: ReactNode
  footer?: ReactNode
  nightMode?: boolean
}

export default function ExperienceShell({
  title,
  color,
  progress,
  progressLabel,
  onExit,
  children,
  footer,
  nightMode = false,
}: ExperienceShellProps) {
  const theme = WELLNESS_COLOR_THEME[color]

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-0 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="experience-shell-title"
    >
      <div
        className={`absolute inset-0 ${
          nightMode
            ? "bg-gradient-to-br from-[#0b1026] via-[#161434] to-[#1e1b4b]"
            : `bg-gradient-to-br ${theme.playerGradient}`
        }`}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.16),transparent_42%),radial-gradient(circle_at_82%_78%,rgba(255,255,255,0.1),transparent_38%)]"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-lg h-full sm:h-auto sm:max-h-[92vh] flex flex-col sm:rounded-[36px] overflow-hidden shadow-2xl border border-white/15 bg-white/10 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
        <div className="px-5 pt-5 pb-3 shrink-0">
          <div className="flex items-center justify-between gap-3 mb-3">
            <button
              type="button"
              onClick={onExit}
              className="text-white/80 hover:text-white text-[11px] font-black uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-full px-2 py-1"
            >
              Exit
            </button>
            <p
              id="experience-shell-title"
              className="text-white/90 text-xs font-semibold truncate max-w-[55%] text-center"
            >
              {title}
            </p>
            <span className="text-white/70 text-[11px] font-bold tabular-nums shrink-0 min-w-[3rem] text-right">
              {progressLabel ?? `${Math.round(progress)}%`}
            </span>
          </div>
          <div
            className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            aria-label="Activity progress"
          >
            <div
              className="h-full rounded-full bg-white transition-[width] duration-500 ease-out shadow-[0_0_12px_rgba(255,255,255,0.45)]"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && <div className="px-5 pb-6 pt-2 shrink-0">{footer}</div>}
      </div>
    </div>
  )
}
