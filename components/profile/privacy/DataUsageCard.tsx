"use client"

import { PROFILE_BODY, PROFILE_SOFT_PANEL, PROFILE_SUBHEAD } from "../ui/profileChrome"
import { DATA_USAGE_COPY } from "./privacyUtils"

interface DataUsageCardProps {
  className?: string
}

export default function DataUsageCard({ className = "" }: DataUsageCardProps) {
  return (
    <aside
      aria-labelledby="data-usage-heading"
      className={`${PROFILE_SOFT_PANEL} ${className}`}
    >
      <h3 id="data-usage-heading" className={`${PROFILE_SUBHEAD} mb-2`}>
        Data Usage Summary
      </h3>
      <p className={PROFILE_BODY}>{DATA_USAGE_COPY}</p>
    </aside>
  )
}
