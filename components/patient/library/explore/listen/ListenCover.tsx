"use client"

import type { ListenCoverIllustration } from "@/data/listenContent"

const COVER_STYLES: Record<
  ListenCoverIllustration,
  { gradient: string; motif: string }
> = {
  waves: {
    gradient: "from-[#A8D8E8] via-[#7BC4D4] to-[#4A9BB0]",
    motif: "M4 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0M4 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0",
  },
  moon: {
    gradient: "from-[#C4B8E8] via-[#9A88D4] to-[#6A58B0]",
    motif: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z",
  },
  leaves: {
    gradient: "from-[#C8E0B8] via-[#96C478] to-[#6A9A4A]",
    motif: "M12 3c-1.5 3-4 5-4 8a4 4 0 008 0c0-3-2.5-5-4-8z M12 11v10",
  },
  rain: {
    gradient: "from-[#B8C8D8] via-[#88A0C0] to-[#5878A0]",
    motif: "M8 14v4M12 12v6M16 14v4M7 10a5 5 0 019.9-1A4 4 0 0117 18H8a4 4 0 01-1-7.9",
  },
  sun: {
    gradient: "from-[#F5D8A0] via-[#F0B858] to-[#E08840]",
    motif: "M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M12 8a4 4 0 100 8 4 4 0 000-8z",
  },
  cloud: {
    gradient: "from-[#D4DCE8] via-[#A8B8D0] to-[#7888A8]",
    motif: "M7 18a4 4 0 01.5-7.9A5 5 0 0117 11a3.5 3.5 0 01.2 7H7z",
  },
  stone: {
    gradient: "from-[#D8D0C0] via-[#B0A490] to-[#887860]",
    motif: "M4 16c2-4 5-6 8-6s6 2 8 6M6 16h12M8 12c1-2 2.5-3 4-3s3 1 4 3",
  },
  wind: {
    gradient: "from-[#B8E0E0] via-[#78C0C8] to-[#4890A0]",
    motif: "M4 10h10a3 3 0 100-6M4 14h14a3 3 0 110 6M4 18h8",
  },
}

interface ListenCoverProps {
  illustration: ListenCoverIllustration
  /** sm/md/lg for player & mini-player; portrait for listing grid */
  size?: "sm" | "md" | "lg" | "portrait"
  className?: string
  title?: string
}

const SIZES = {
  sm: "w-12 h-12 rounded-xl",
  md: "w-16 h-16 rounded-2xl",
  lg: "w-56 h-56 sm:w-64 sm:h-64 rounded-[28px] sm:rounded-[32px]",
  portrait:
    "relative aspect-[3/4] w-full overflow-hidden rounded-[14px] sm:rounded-[16px]",
} as const

const ICON_SIZES = {
  sm: "w-5 h-5",
  md: "w-7 h-7",
  lg: "w-20 h-20",
  portrait: "w-14 h-14 sm:w-16 sm:h-16",
} as const

/**
 * Listen cover art — small tiles for player UI, portrait tiles for listing.
 */
export default function ListenCover({
  illustration,
  size = "md",
  className = "",
  title,
}: ListenCoverProps) {
  const style = COVER_STYLES[illustration]
  const isPortrait = size === "portrait"

  return (
    <div
      className={`${SIZES[size]} flex items-center justify-center shrink-0
        bg-gradient-to-br ${style.gradient}
        ${
          isPortrait
            ? "shadow-[0_10px_28px_rgba(40,30,20,0.14)] ring-1 ring-black/[0.04]"
            : "shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
        }
        ${className}`}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      aria-label={title}
    >
      <svg
        className={`${ICON_SIZES[size]} ${isPortrait ? "text-white/70" : "text-slate-600/50"}`}
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
      {isPortrait ? (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent"
          aria-hidden
        />
      ) : null}
    </div>
  )
}
