"use client"

interface ReadTimeBadgeProps {
  readTime: string
  className?: string
}

export default function ReadTimeBadge({
  readTime,
  className = "",
}: ReadTimeBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-white border border-slate-100 text-slate-500 px-2.5 py-0.5 text-[11px] font-semibold ${className}`}
    >
      <svg
        className="w-3 h-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {readTime}
    </span>
  )
}
