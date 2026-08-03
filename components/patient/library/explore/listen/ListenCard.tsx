"use client"

import type { ListenTrack } from "@/data/listenContent"
import ListenCover from "@/components/patient/library/explore/listen/ListenCover"

interface ListenCardProps {
  track: ListenTrack
  onSelect?: (track: ListenTrack) => void
  className?: string
}

/**
 * Listen browse card — matches Read: portrait cover + title only.
 */
export default function ListenCard({
  track,
  onSelect,
  className = "",
}: ListenCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(track)}
      aria-label={`Play ${track.title}, ${track.duration}`}
      className={`group flex w-full flex-col text-left
        transition-transform duration-200 ease-out
        hover:-translate-y-0.5 active:scale-[0.98]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 rounded-[14px]
        ${className}`}
    >
      <ListenCover
        illustration={track.coverIllustration}
        size="portrait"
        title={track.title}
      />
      <div className="mt-3.5 px-0.5">
        <h3 className="line-clamp-2 text-[15px] sm:text-[16px] font-bold leading-snug text-[#222222] tracking-tight">
          {track.title}
        </h3>
      </div>
    </button>
  )
}
