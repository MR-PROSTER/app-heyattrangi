"use client"

interface AssessmentBadgeProps {
  label: string
  tone?: "neutral" | "brand" | "soft"
  className?: string
}

export default function AssessmentBadge({
  label,
  tone = "neutral",
  className = "",
}: AssessmentBadgeProps) {
  const tones = {
    neutral: "bg-slate-100 text-slate-600",
    brand: "bg-orange-50 text-orange-600 border border-orange-100",
    soft: "bg-teal-50 text-teal-700 border border-teal-100",
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${tones[tone]} ${className}`}
    >
      {label}
    </span>
  )
}
