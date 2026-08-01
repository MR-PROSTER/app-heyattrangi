"use client"

import SignOutButton from "@/components/auth/SignOutButton"
import {
  PROFILE_BTN_SECONDARY,
  PROFILE_INNER_CARD,
  PROFILE_SECTION_DESC,
  PROFILE_SUBHEAD,
} from "../ui/profileChrome"

interface SignOutCardProps {
  className?: string
}

export default function SignOutCard({ className = "" }: SignOutCardProps) {
  return (
    <article className={`${PROFILE_INNER_CARD} ${className}`}>
      <h3 className={PROFILE_SUBHEAD}>Sign Out</h3>
      <p className={PROFILE_SECTION_DESC}>Sign out of this device.</p>
      <div className="mt-4">
        <SignOutButton className={PROFILE_BTN_SECONDARY}>Sign Out</SignOutButton>
      </div>
    </article>
  )
}
