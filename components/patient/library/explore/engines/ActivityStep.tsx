"use client"

import type { ReactNode } from "react"

interface ActivityStepProps {
  current: number
  total: number
  headline?: string
  detail?: string
  children?: ReactNode
  onBack?: () => void
  onNext?: () => void
  backLabel?: string
  nextLabel?: string
  canGoBack?: boolean
  canGoNext?: boolean
  disabled?: boolean
}

export default function ActivityStep({
  current,
  total,
  headline,
  detail,
  children,
  onBack,
  onNext,
  backLabel = "Back",
  nextLabel = "Next",
  canGoBack = true,
  canGoNext = true,
  disabled = false,
}: ActivityStepProps) {
  const progress = total > 0 ? Math.round(((current + 1) / total) * 100) : 0

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-6">
      <div
        className="w-full space-y-2"
        role="group"
        aria-label={`Step ${current + 1} of ${total}`}
      >
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-400">
          <span>
            Step {current + 1} of {total}
          </span>
          <span>{progress}%</span>
        </div>
        <div
          className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-label="Activity progress"
        >
          <div
            className="h-full rounded-full bg-orange-400 transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {(headline || detail) && (
        <div className="text-center space-y-2 px-2">
          {headline && (
            <p className="text-[13px] font-bold uppercase tracking-widest text-slate-400">
              {headline}
            </p>
          )}
          {detail && (
            <p className="font-extrabold text-xl sm:text-2xl text-slate-800 tracking-tight leading-snug">
              {detail}
            </p>
          )}
        </div>
      )}

      {children}

      {(onBack || onNext) && (
        <div className="w-full flex items-center gap-3 pt-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              disabled={disabled || !canGoBack}
              aria-label={backLabel}
              className="flex-1 rounded-2xl border border-slate-200 bg-white text-slate-600 font-bold text-[14px] py-3.5 px-4 transition-all hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2"
            >
              {backLabel}
            </button>
          )}
          {onNext && (
            <button
              type="button"
              onClick={onNext}
              disabled={disabled || !canGoNext}
              aria-label={nextLabel}
              className="flex-1 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-[14px] py-3.5 px-4 transition-all disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
            >
              {nextLabel}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
