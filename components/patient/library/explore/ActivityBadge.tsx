"use client"

interface ActivityBadgeProps {
  label: string
  className?: string
}

export default function ActivityBadge({
  label,
  className = "",
}: ActivityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${className}`}
    >
      {label}
    </span>
  )
}
