"use client"

import ConsentStatus from "./ConsentStatus"
import {
  PROFILE_INNER_CARD,
  PROFILE_LABEL,
  PROFILE_SECTION_DESC,
  PROFILE_SUBHEAD,
} from "../ui/profileChrome"
import {
  formatConsentDate,
  type ConsentRecord,
} from "./privacyUtils"

interface ConsentRowProps {
  record: ConsentRecord
  className?: string
}

export default function ConsentRow({ record, className = "" }: ConsentRowProps) {
  return (
    <article
      aria-labelledby={`consent-${record.id}-title`}
      className={`${PROFILE_INNER_CARD} ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 id={`consent-${record.id}-title`} className={PROFILE_SUBHEAD}>
            {record.title}
          </h3>
          <p className={PROFILE_SECTION_DESC}>{record.description}</p>
        </div>
        <ConsentStatus status={record.status} />
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-gray-100">
        <div>
          <dt className={PROFILE_LABEL}>Status</dt>
          <dd className="mt-1.5 text-sm font-semibold text-gray-900">
            {record.status === "accepted" ? "Accepted" : "Not recorded"}
          </dd>
        </div>
        <div>
          <dt className={PROFILE_LABEL}>Date Accepted</dt>
          <dd className="mt-1.5 text-sm font-semibold text-gray-900">
            {formatConsentDate(record.acceptedAt)}
          </dd>
        </div>
        <div>
          <dt className={PROFILE_LABEL}>Version</dt>
          <dd className="mt-1.5 text-sm font-semibold text-gray-900 tabular-nums">
            {record.version}
          </dd>
        </div>
      </dl>
    </article>
  )
}
