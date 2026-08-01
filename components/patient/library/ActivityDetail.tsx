"use client"

import { useEffect } from "react"
import type {
  WellnessActivity,
  WellnessCategoryColor,
} from "@/lib/data/wellnessActivities"
import { WELLNESS_COLOR_THEME } from "@/lib/data/wellnessTheme"
import InstructionList from "@/components/patient/library/InstructionList"

interface ActivityDetailProps {
  activity: WellnessActivity
  color: WellnessCategoryColor
  onClose: () => void
  onStart: () => void
}

export default function ActivityDetail({
  activity,
  color,
  onClose,
  onStart,
}: ActivityDetailProps) {
  const theme = WELLNESS_COLOR_THEME[color]
  const previewSteps = activity.instructions.slice(0, 3)
  const remaining = Math.max(0, activity.instructions.length - previewSteps.length)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`activity-detail-title-${activity.id}`}
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        aria-label="Close activity details"
        onClick={onClose}
      />

      <div
        className={`relative z-10 w-full max-w-xl max-h-[94vh] sm:max-h-[88vh] overflow-y-auto sm:rounded-[32px] rounded-t-[32px] shadow-2xl border border-white/60 animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 bg-gradient-to-b ${theme.softGradient}`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white/70 backdrop-blur-md border-b border-slate-100/80">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
            Activity details
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 flex items-center justify-center transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-300"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 md:px-8 pt-8 pb-10 space-y-8">
          <header className="flex flex-col items-center text-center gap-4">
            <div
              className={`w-24 h-24 rounded-[28px] relative flex items-center justify-center shadow-[0_18px_40px_rgba(15,23,42,0.1)] ${theme.iconBg}`}
              aria-hidden
            >
              <svg
                className="w-11 h-11"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.35}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={activity.iconPath}
                />
              </svg>
            </div>
            <div>
              <h2
                id={`activity-detail-title-${activity.id}`}
                className="font-extrabold text-3xl text-slate-800 tracking-tight mb-3"
              >
                {activity.title}
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-slate-600 text-xs font-semibold bg-white border border-slate-100 px-3 py-1.5 rounded-full shadow-sm">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {activity.estimatedDuration}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${theme.badge}`}>
                  {activity.difficulty}
                </span>
              </div>
            </div>
          </header>

          <section className="rounded-[24px] bg-white/80 border border-slate-100 p-5 shadow-sm">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
              What this activity helps with
            </h3>
            <p className="text-[15px] font-medium text-slate-600 leading-relaxed">
              {activity.benefits}
            </p>
          </section>

          <section>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">
              Instruction preview
            </h3>
            <InstructionList instructions={previewSteps} />
            {remaining > 0 && (
              <p className="text-center text-xs font-semibold text-slate-400 mt-3">
                + {remaining} more step{remaining === 1 ? "" : "s"} in the guided session
              </p>
            )}
          </section>

          <button
            type="button"
            onClick={() => onStart()}
            className={`w-full py-4 rounded-full text-sm font-black uppercase tracking-widest text-white shadow-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${theme.ring} ${theme.button}`}
          >
            Start Activity
          </button>
        </div>
      </div>
    </div>
  )
}
