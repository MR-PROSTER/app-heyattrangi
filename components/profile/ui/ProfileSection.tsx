"use client"

import { type ReactNode } from "react"
import ProfileCard from "./ProfileCard"
import ProfileHeader from "./ProfileHeader"
import { PROFILE_SCROLL_MT } from "./profileChrome"

interface ProfileSectionProps {
  id: string
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  /** When false, renders children without the card chrome (e.g. nested layouts). */
  card?: boolean
}

/**
 * Canonical settings section: anchor id + header + optional card wrapper.
 */
export default function ProfileSection({
  id,
  title,
  description,
  action,
  children,
  className = "",
  card = true,
}: ProfileSectionProps) {
  const headingId = `${id}-heading`

  if (!card) {
    return (
      <section id={id} aria-labelledby={headingId} className={`${PROFILE_SCROLL_MT} ${className}`}>
        <ProfileHeader
          titleId={headingId}
          title={title}
          description={description}
          action={action}
        />
        {children}
      </section>
    )
  }

  return (
    <ProfileCard id={id} aria-labelledby={headingId} className={className}>
      <ProfileHeader
        titleId={headingId}
        title={title}
        description={description}
        action={action}
      />
      {children}
    </ProfileCard>
  )
}
