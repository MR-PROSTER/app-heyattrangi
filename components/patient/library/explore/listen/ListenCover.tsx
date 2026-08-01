"use client"

import type { ListenCoverIllustration } from "@/data/listenContent"

const COVER_STYLES: Record<
  ListenCoverIllustration,
  { gradient: string; motif: string }
> = {
  waves: {
    gradient: "from-sky-200 via-teal-100 to-cyan-50",
    motif: "M4 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0M4 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0",
  },
  moon: {
    gradient: "from-indigo-200 via-violet-100 to-slate-50",
    motif: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z",
  },
  leaves: {
    gradient: "from-emerald-200 via-green-100 to-lime-50",
    motif: "M12 3c-1.5 3-4 5-4 8a4 4 0 008 0c0-3-2.5-5-4-8z M12 11v10",
  },
  rain: {
    gradient: "from-slate-300 via-blue-100 to-slate-50",
    motif: "M8 14v4M12 12v6M16 14v4M7 10a5 5 0 019.9-1A4 4 0 0117 18H8a4 4 0 01-1-7.9",
  },
  sun: {
    gradient: "from-amber-200 via-orange-100 to-yellow-50",
    motif: "M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M12 8a4 4 0 100 8 4 4 0 000-8z",
  },
  cloud: {
    gradient: "from-slate-200 via-sky-100 to-white",
    motif: "M7 18a4 4 0 01.5-7.9A5 5 0 0117 11a3.5 3.5 0 01.2 7H7z",
  },
  stone: {
    gradient: "from-stone-300 via-stone-100 to-amber-50",
    motif: "M4 16c2-4 5-6 8-6s6 2 8 6M6 16h12M8 12c1-2 2.5-3 4-3s3 1 4 3",
  },
  wind: {
    gradient: "from-cyan-100 via-teal-50 to-slate-50",
    motif: "M4 10h10a3 3 0 100-6M4 14h14a3 3 0 110 6M4 18h8",
  },
}

interface ListenCoverProps {
  illustration: ListenCoverIllustration
  size?: "sm" | "md" | "lg"
  className?: string
  title?: string
}

const SIZES = {
  sm: "w-12 h-12 rounded-xl",
  md: "w-16 h-16 rounded-2xl",
  lg: "w-44 h-44 sm:w-52 sm:h-52 rounded-[28px]",
} as const

export default function ListenCover({
  illustration,
  size = "md",
  className = "",
  title,
}: ListenCoverProps) {
  const style = COVER_STYLES[illustration]

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${style.gradient} ${SIZES[size]} flex items-center justify-center shrink-0 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ${className}`}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      aria-label={title}
    >
      <svg
        className={`${size === "lg" ? "w-20 h-20" : size === "md" ? "w-7 h-7" : "w-5 h-5"} text-slate-600/50`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.4}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d={style.motif}
        />
      </svg>
    </div>
  )
}
