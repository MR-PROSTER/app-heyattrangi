"use client"

import type { AssessmentUiStatus } from "@/data/assessmentState"
import {
  formatAssessmentDate,
  type MindMatrixAssessmentState,
} from "@/data/assessmentState"
import AssessmentBadge from "@/components/patient/library/explore/assessments/AssessmentBadge"

interface AssessmentStateProps {
  status: AssessmentUiStatus
  state: MindMatrixAssessmentState
}

export default function AssessmentState({
  status,
  state,
}: AssessmentStateProps) {
  if (status === "never") {
    return (
      <p className="text-slate-500 font-medium text-sm sm:text-[15px] leading-relaxed">
        A short, 3-minute check-in on how your mind is working right now.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-slate-500 font-medium text-sm sm:text-[15px] leading-relaxed">
        A short, 3-minute check-in on how your mind is working right now.
      </p>

      <dl className="space-y-2.5">
        {state.lastTaken && (
          <div className="flex items-center justify-between gap-3">
            <dt className="text-sm font-medium text-slate-400">Last checked</dt>
            <dd className="text-sm font-semibold text-slate-700">
              {formatAssessmentDate(state.lastTaken)}
            </dd>
          </div>
        )}

        {state.band && (
          <div className="flex items-center justify-between gap-3">
            <dt className="text-sm font-medium text-slate-400">Current Band</dt>
            <dd>
              <AssessmentBadge label={state.band} tone="soft" />
            </dd>
          </div>
        )}
      </dl>
    </div>
  )
}
