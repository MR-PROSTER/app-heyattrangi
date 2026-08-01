"use client"

import { type ReactNode } from "react"
import {
  PROFILE_INNER_CARD,
  PROFILE_SECTION_DESC,
  PROFILE_SUBHEAD,
} from "../ui/profileChrome"

interface PreferenceGroupProps {
  id: string
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export default function PreferenceGroup({
  id,
  title,
  description,
  children,
  className = "",
}: PreferenceGroupProps) {
  const headingId = `${id}-heading`

  return (
    <section
      aria-labelledby={headingId}
      className={`${PROFILE_INNER_CARD} ${className}`}
    >
      <header className="mb-4">
        <h3 id={headingId} className={PROFILE_SUBHEAD}>
          {title}
        </h3>
        {description ? (
          <p className={`${PROFILE_SECTION_DESC} !mt-1`}>{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  )
}
