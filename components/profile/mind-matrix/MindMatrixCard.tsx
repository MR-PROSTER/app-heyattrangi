"use client"

import Link from "next/link"
import { useMemo } from "react"
import ProfileCard from "../ui/ProfileCard"
import ProfileDivider from "../ui/ProfileDivider"
import MindMatrixBadge from "./MindMatrixBadge"
import MindMatrixInsight from "./MindMatrixInsight"
import MindMatrixHistory from "./MindMatrixHistory"
import {
  formatAssessmentDate,
  formatCompletionTime,
  formatDuration,
  getMindMatrixProfileState,
  MIND_MATRIX_HREF,
  resultHref,
} from "@/data/mindMatrixProfile"

function MindMatrixIllustration({ className = "" }: { className?: string }) {
  return (
    <div
      className={`w-20 h-20 sm:w-24 sm:h-24 rounded-[24px] bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100/80 shadow-[0_10px_28px_rgba(249,115,22,0.12)] flex items-center justify-center shrink-0 ${className}`}
      aria-hidden="true"
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
  )
}

export default function MindMatrixCard() {
  const state = useMemo(() => getMindMatrixProfileState(), [])
  const { latest, canRetake, nextAvailableDate, history } = state
  const hasResult = Boolean(latest)

  const nextAvailableLabel = nextAvailableDate
    ? formatAssessmentDate(nextAvailableDate)
    : null

  return (
    <ProfileCard id="mind-matrix" aria-labelledby="mind-matrix-heading">
      <div>
        <header className="mb-5 sm:mb-6">
          <h2
            id="mind-matrix-heading"
            className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight"
          >
            Mind Matrix
          </h2>
          <p className="mt-1 text-sm font-medium text-gray-500 leading-relaxed max-w-prose">
            View your latest check-in and revisit it whenever you like.
          </p>
        </header>

        {!hasResult ? (
          <div className="flex flex-col items-center text-center py-4 sm:py-6">
            <MindMatrixIllustration className="mb-5" />
            <p className="text-sm font-medium text-gray-600 leading-relaxed max-w-md mb-6">
              A short check-in on how your mind is doing. Take it once, then return here anytime
              to see your latest result.
            </p>
            <Link
              href={MIND_MATRIX_HREF}
              className="inline-flex items-center justify-center min-h-11 rounded-xl bg-orange-500 hover:bg-orange-600
                text-white text-sm font-bold px-6 py-3 shadow-[0_10px_28px_rgba(249,115,22,0.28)]
                transition-colors duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2"
            >
              Take Mind Matrix
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Result summary */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-5">
              <MindMatrixIllustration />
              <div className="min-w-0 flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
                    Current Band
                  </p>
                  <MindMatrixBadge label={latest!.band} />
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
                      Latest Score
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900 tabular-nums">
                      {latest!.score}
                      <span className="text-gray-400 font-medium"> / 100</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
                      Assessment Date
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">
                      {formatAssessmentDate(latest!.date)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
                      Completion Time
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">
                      {formatCompletionTime(latest!.completionTime)}
                      <span className="text-gray-400 font-medium">
                        {" "}
                        · {formatDuration(latest!.durationMinutes)}
                      </span>
                    </dd>
                  </div>
                </dl>

                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 pt-1">
                  <Link
                    href={resultHref(latest!.riskLevel)}
                    className="inline-flex items-center justify-center min-h-11 rounded-xl bg-gray-900 hover:bg-black
                      text-white text-sm font-bold px-5 py-2.5 transition-colors duration-150
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    View Details
                  </Link>

                  {canRetake ? (
                    <Link
                      href={MIND_MATRIX_HREF}
                      className="inline-flex items-center justify-center min-h-11 rounded-xl border border-gray-200 bg-white
                        text-gray-800 text-sm font-bold px-5 py-2.5 hover:bg-gray-50 transition-colors duration-150
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                      Retake
                    </Link>
                  ) : (
                    <p
                      className="inline-flex items-center text-sm font-semibold text-gray-500 px-1"
                      role="status"
                    >
                      Available again on {nextAvailableLabel}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <MindMatrixInsight latest={latest!} />

            <ProfileDivider className="my-2" />

            <MindMatrixHistory items={history} />
          </div>
        )}
      </div>
    </ProfileCard>
  )
}
