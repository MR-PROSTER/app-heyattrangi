"use client"

type BadgeTone = "steady" | "focused" | "sharp" | "drifting" | "foggy" | "neutral"

interface MindMatrixBadgeProps {
  label: string
  tone?: BadgeTone
  className?: string
}

function toneFromBand(label: string): BadgeTone {
  const key = label.toLowerCase()
  if (key === "sharp") return "sharp"
  if (key === "focused") return "focused"
  if (key === "steady") return "steady"
  if (key === "drifting") return "drifting"
  if (key === "foggy") return "foggy"
  return "neutral"
}

const TONES: Record<BadgeTone, string> = {
  sharp: "bg-emerald-50 text-emerald-900 border-emerald-200",
  focused: "bg-sky-50 text-sky-900 border-sky-200",
  steady: "bg-teal-50 text-teal-900 border-teal-200",
  drifting: "bg-amber-50 text-amber-900 border-amber-200",
  foggy: "bg-slate-100 text-slate-800 border-slate-200",
  neutral: "bg-gray-100 text-gray-800 border-gray-200",
}

export default function MindMatrixBadge({
  label,
  tone,
  className = "",
}: MindMatrixBadgeProps) {
  const resolved = tone ?? toneFromBand(label)

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${TONES[resolved]} ${className}`}
    >
      {label}
    </span>
  )
}
