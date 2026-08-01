"use client"

import { PROFILE_DIVIDER, PROFILE_LABEL } from "./profileChrome"

interface ProfileDividerProps {
  className?: string
  label?: string
}

export default function ProfileDivider({ className = "", label }: ProfileDividerProps) {
  if (label) {
    return (
      <div
        role="separator"
        aria-label={label}
        className={`flex items-center gap-3 py-1.5 ${className}`}
      >
        <div className="h-px flex-1 bg-gray-100" />
        <span className={PROFILE_LABEL}>{label}</span>
        <div className="h-px flex-1 bg-gray-100" />
      </div>
    )
  }

  return <hr role="separator" className={`${PROFILE_DIVIDER} ${className}`} />
}
