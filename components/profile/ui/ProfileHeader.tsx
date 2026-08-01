"use client"

import { type ReactNode } from "react"
import { PROFILE_SECTION_DESC, PROFILE_SECTION_TITLE } from "./profileChrome"

interface ProfileHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  className?: string
  titleId?: string
}

export default function ProfileHeader({
  title,
  description,
  action,
  className = "",
  titleId,
}: ProfileHeaderProps) {
  return (
    <header
      className={`flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-5 sm:mb-6 ${className}`}
    >
      <div className="min-w-0 space-y-1">
        <h2 id={titleId} className={PROFILE_SECTION_TITLE}>
          {title}
        </h2>
        {description ? <p className={PROFILE_SECTION_DESC}>{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  )
}
