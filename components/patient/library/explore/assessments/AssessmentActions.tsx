"use client"

import type { AssessmentUiStatus } from "@/data/assessmentState"

interface AssessmentActionsProps {
  status: AssessmentUiStatus
  onStart: () => void
  nextAvailableLabel?: string | null
}

export default function AssessmentActions({
  status,
  onStart,
  nextAvailableLabel,
}: AssessmentActionsProps) {
  if (status === "locked") {
    return (
      <p
        className="text-center sm:text-left text-sm font-semibold text-slate-500"
        role="status"
      >
        Available again on {nextAvailableLabel}
      </p>
    )
  }

  const label = status === "never" ? "Take it" : "Retake"

  return (
    <button
      type="button"
      onClick={onStart}
      aria-label={
        status === "never"
          ? "Take Mind Matrix assessment"
          : "Retake Mind Matrix assessment"
      }
      className="w-full sm:w-auto min-w-[160px] rounded-2xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-[15px] py-3.5 px-8 shadow-[0_10px_28px_rgba(249,115,22,0.28)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2"
    >
      {label}
    </button>
  )
}
