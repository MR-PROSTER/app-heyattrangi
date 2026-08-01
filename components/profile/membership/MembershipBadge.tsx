"use client"

import type { MembershipBadgeVariant } from "./membershipUtils"

interface MembershipBadgeProps {
  variant: MembershipBadgeVariant
  className?: string
}

const STYLES: Record<
  MembershipBadgeVariant,
  { label: string; className: string }
> = {
  light: {
    label: "Light",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
  active: {
    label: "Active",
    className: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  premium: {
    label: "Premium",
    className: "bg-amber-50 text-amber-900 border-amber-200",
  },
  committed: {
    label: "Committed",
    className: "bg-sky-50 text-sky-900 border-sky-200",
  },
}

export default function MembershipBadge({ variant, className = "" }: MembershipBadgeProps) {
  const style = STYLES[variant]

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${style.className} ${className}`}
    >
      {style.label}
    </span>
  )
}
