"use client"

import MindMatrixBadge from "./MindMatrixBadge"
import {
  PROFILE_BODY,
  PROFILE_LABEL,
  PROFILE_SOFT_PANEL,
} from "../ui/profileChrome"
import {
  formatAssessmentDate,
  formatDuration,
  getCalmBandInsight,
  type MindMatrixHistoryItem,
} from "@/data/mindMatrixProfile"

interface MindMatrixInsightProps {
  latest: MindMatrixHistoryItem
  className?: string
}

export default function MindMatrixInsight({ latest, className = "" }: MindMatrixInsightProps) {
  const insight = getCalmBandInsight(latest.band)

  return (
    <aside
      aria-label="Latest check-in insight"
      className={`${PROFILE_SOFT_PANEL} ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <p className={PROFILE_LABEL}>Latest Band</p>
        <MindMatrixBadge label={latest.band} />
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <dt className={PROFILE_LABEL}>Date Taken</dt>
          <dd className="mt-1.5 text-sm font-semibold text-gray-900">
            {formatAssessmentDate(latest.date)}
          </dd>
        </div>
        <div>
          <dt className={PROFILE_LABEL}>Duration</dt>
          <dd className="mt-1.5 text-sm font-semibold text-gray-900">
            {formatDuration(latest.durationMinutes)}
          </dd>
        </div>
      </dl>

      <p className={PROFILE_BODY}>{insight}</p>
    </aside>
  )
}
