"use client"

import { motion } from "framer-motion"
import type { AssessmentUiStatus } from "@/data/assessmentState"
import {
  formatAssessmentDate,
  MIND_MATRIX_COPY,
  type MindMatrixAssessmentState,
} from "@/data/assessmentState"
import AssessmentBadge from "@/components/patient/library/explore/assessments/AssessmentBadge"
import AssessmentState from "@/components/patient/library/explore/assessments/AssessmentState"
import AssessmentActions from "@/components/patient/library/explore/assessments/AssessmentActions"

interface AssessmentCardProps {
  state: MindMatrixAssessmentState
  status: AssessmentUiStatus
  onStart: () => void
}

export default function AssessmentCard({
  state,
  status,
  onStart,
}: AssessmentCardProps) {
  const nextAvailableLabel = state.nextAvailableDate
    ? formatAssessmentDate(state.nextAvailableDate)
    : null

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      aria-labelledby="mind-matrix-title"
      className="relative overflow-hidden rounded-[28px] bg-white border border-slate-100/90 shadow-[0_8px_32px_rgba(15,23,42,0.06)] p-6 sm:p-8"
    >
      <div
        className="pointer-events-none absolute -top-16 -right-12 w-48 h-48 rounded-full bg-orange-100/50 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-teal-50/80 blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-col sm:flex-row sm:items-start gap-6">
        <div
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-[24px] bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100/80 shadow-[0_10px_28px_rgba(249,115,22,0.12)] flex items-center justify-center shrink-0"
          aria-hidden
        >
          <svg
            className="w-10 h-10 text-orange-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>

        <div className="flex-1 min-w-0 space-y-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <AssessmentBadge label="Check-in" tone="brand" />
              {status === "locked" && (
                <AssessmentBadge label="Monthly lock" tone="neutral" />
              )}
            </div>
            <h2
              id="mind-matrix-title"
              className="font-extrabold text-[22px] sm:text-[26px] text-slate-800 tracking-tight"
            >
              {MIND_MATRIX_COPY.title}
            </h2>
          </div>

          <AssessmentState status={status} state={state} />

          <AssessmentActions
            status={status}
            onStart={onStart}
            nextAvailableLabel={nextAvailableLabel}
          />
        </div>
      </div>
    </motion.article>
  )
}
