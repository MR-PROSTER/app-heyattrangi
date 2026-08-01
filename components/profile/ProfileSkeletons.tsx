"use client"

import { PROFILE_CARD_SURFACE, PROFILE_LABEL } from "./ui/profileChrome"

/** Shared skeleton chrome for Profile section cards. */
function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-gray-100/90 motion-reduce:animate-none ${className}`}
      aria-hidden="true"
    />
  )
}

function SectionSkeleton({
  label,
  rows = 3,
}: {
  label: string
  rows?: number
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={`Loading ${label}`}
      className={`${PROFILE_CARD_SURFACE} animate-in fade-in duration-150`}
    >
      <p className={`${PROFILE_LABEL} mb-3`}>{label}</p>
      <SkeletonBlock className="h-5 w-40 mb-2" />
      <SkeletonBlock className="h-3 w-56 sm:w-64 max-w-full mb-6" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonBlock key={i} className="h-11 w-full" />
        ))}
      </div>
      <span className="sr-only">Loading {label}…</span>
    </div>
  )
}

export function IdentitySkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading Identity"
      className={`${PROFILE_CARD_SURFACE} animate-in fade-in duration-150`}
    >
      <div className="flex gap-4 mb-6">
        <SkeletonBlock className="h-14 w-14 md:h-16 md:w-16 rounded-full shrink-0" />
        <div className="flex-1 space-y-2.5 pt-1 min-w-0">
          <SkeletonBlock className="h-5 w-44 max-w-full" />
          <SkeletonBlock className="h-3 w-32 max-w-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <SkeletonBlock className="h-14" />
        <SkeletonBlock className="h-14" />
        <SkeletonBlock className="h-14" />
        <SkeletonBlock className="h-14" />
      </div>
      <span className="sr-only">Loading Identity…</span>
    </div>
  )
}

export function MembershipSkeleton() {
  return <SectionSkeleton label="Membership" rows={4} />
}

export function MindMatrixSkeleton() {
  return <SectionSkeleton label="Mind Matrix" rows={4} />
}

export function PreferencesSkeleton() {
  return <SectionSkeleton label="Preferences" rows={5} />
}

export function PrivacySkeleton() {
  return <SectionSkeleton label="Privacy & Consent" rows={4} />
}

export function AccountSkeleton() {
  return <SectionSkeleton label="Account" rows={2} />
}

export function EmergencySkeleton() {
  return <SectionSkeleton label="Emergency Contact" rows={3} />
}
