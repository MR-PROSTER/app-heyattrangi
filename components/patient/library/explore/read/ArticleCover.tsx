"use client"

import Image from "next/image"
import type { ReadCoverIllustration } from "@/data/readArticles"

const FALLBACK: Record<
  ReadCoverIllustration,
  { gradient: string; motif: string }
> = {
  pause: {
    gradient: "from-[#F2C4B0] via-[#E8A88A] to-[#D4785A]",
    motif: "M12 6v6l4 2",
  },
  heart: {
    gradient: "from-[#F5B8C8] via-[#E88AA3] to-[#C45C78]",
    motif: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
  },
  moon: {
    gradient: "from-[#B8C4E8] via-[#8A9AD4] to-[#5A6BB0]",
    motif: "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
  },
  seed: {
    gradient: "from-[#C8E0B8] via-[#96C478] to-[#6A9A4A]",
    motif: "M12 22c4-4 6-8 6-12a6 6 0 10-12 0c0 4 2 8 6 12z",
  },
  focus: {
    gradient: "from-[#F0D4A8] via-[#E0B068] to-[#C48838]",
    motif: "M12 12m-3 0a3 3 0 106 0 3 3 0 10-6 0",
  },
  rest: {
    gradient: "from-[#D4C8E8] via-[#A890D0] to-[#7860A8]",
    motif: "M3 12h18 M3 6h18 M3 18h12",
  },
  walk: {
    gradient: "from-[#B8DCE8] via-[#78B8D0] to-[#4890A8]",
    motif: "M13 4a2 2 0 11-4 0 2 2 0 014 0z",
  },
  voice: {
    gradient: "from-[#E8C8B8] via-[#D49878] to-[#B06848]",
    motif: "M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z",
  },
  sunrise: {
    gradient: "from-[#F5D8A0] via-[#F0B858] to-[#E08840]",
    motif: "M12 2v4 M12 10a6 6 0 016 6H6a6 6 0 016-6z",
  },
}

interface ArticleCoverProps {
  illustration: ReadCoverIllustration
  /** Demo / final cover art — swap URL in data when ready */
  coverImage?: string
  title: string
  className?: string
}

/**
 * Book-cover portrait tile (image-2 library pattern).
 * Prefer coverImage; fall back to gradient illustration.
 */
export default function ArticleCover({
  illustration,
  coverImage,
  title,
  className = "",
}: ArticleCoverProps) {
  const fallback = FALLBACK[illustration]

  return (
    <div
      className={`relative aspect-[3/4] w-full overflow-hidden rounded-[14px] sm:rounded-[16px]
        bg-[#E8E0D4]
        shadow-[0_10px_28px_rgba(40,30,20,0.14)]
        ring-1 ring-black/[0.04]
        ${className}`}
      role="img"
      aria-label={title}
    >
      {coverImage ? (
        <Image
          src={coverImage}
          alt=""
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
          priority={false}
        />
      ) : (
        <div
          className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${fallback.gradient}`}
        >
          <svg
            className="h-12 w-12 text-white/70"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={fallback.motif} />
          </svg>
        </div>
      )}
      {/* Soft bottom vignette like printed covers */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent"
        aria-hidden
      />
    </div>
  )
}
