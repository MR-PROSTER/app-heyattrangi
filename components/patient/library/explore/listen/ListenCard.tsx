"use client"

import { Play } from "lucide-react"
import type { ListenTrack } from "@/data/listenContent"
import ListenCover from "@/components/patient/library/explore/listen/ListenCover"
import ActivityBadge from "@/components/patient/library/explore/ActivityBadge"
import ActivityDuration from "@/components/patient/library/explore/ActivityDuration"

interface ListenCardProps {
  track: ListenTrack
  onSelect?: (track: ListenTrack) => void
  className?: string
}

export default function ListenCard({
  track,
  onSelect,
  className = "",
}: ListenCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(track)}
      aria-label={`Play ${track.title}, ${track.duration}, ${track.category}`}
      className={`group relative flex flex-col h-full w-full text-left rounded-[22px] bg-white border border-slate-100/90 p-4 sm:p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)] transition-all duration-300 ease-out cursor-pointer hover:scale-[1.02] hover:shadow-[0_14px_32px_rgba(15,23,42,0.09)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <ListenCover
          illustration={track.coverIllustration}
          size="md"
          title={track.title}
        />
        <span
          className="w-9 h-9 rounded-full bg-orange-50 text-orange-500 border border-orange-100 flex items-center justify-center shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors"
          aria-hidden
        >
          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
        </span>
      </div>

      <h3 className="font-bold text-[15px] sm:text-[16px] text-slate-800 tracking-tight leading-snug mb-1.5">
        {track.title}
      </h3>
      <p className="text-slate-500 text-sm font-medium leading-relaxed mb-4 line-clamp-2 flex-grow">
        {track.description}
      </p>

      <div className="flex flex-wrap items-center gap-2 mt-auto pt-1">
        <ActivityDuration duration={track.duration} />
        <ActivityBadge label={track.category} />
      </div>
    </button>
  )
}
