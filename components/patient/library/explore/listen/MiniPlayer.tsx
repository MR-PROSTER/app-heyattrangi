"use client"

import { motion } from "framer-motion"
import { Maximize2, Pause, Play, SkipBack, SkipForward } from "lucide-react"
import type { ListenTrack } from "@/data/listenContent"
import ListenCover from "@/components/patient/library/explore/listen/ListenCover"
import { useListenPlayer } from "@/components/patient/library/explore/listen/ListenPlayerContext"

interface MiniPlayerProps {
  onExpand: (track: ListenTrack) => void
}

export default function MiniPlayer({ onExpand }: MiniPlayerProps) {
  const { currentTrack, isPlaying, togglePlayPause, playNext, playPrevious } = useListenPlayer()

  if (!currentTrack) return null

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-0 inset-x-0 z-40 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-6xl px-3 sm:px-6 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div
          className="flex items-center gap-2 sm:gap-3 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-[0_-4px_28px_rgba(15,23,42,0.1)] px-3 py-2.5"
          role="region"
          aria-label="Mini player"
        >
          <ListenCover
            illustration={currentTrack.coverIllustration}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-sm text-slate-800 truncate">
              {currentTrack.title}
            </p>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              {currentTrack.category}
            </p>
          </div>

          <button
            type="button"
            onClick={playPrevious}
            aria-label="Previous track"
            title="Previous track"
            className="w-8 h-8 rounded-full text-slate-500 hover:bg-slate-100 flex items-center justify-center shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
          >
            <SkipBack className="w-4 h-4" aria-hidden />
          </button>

          <button
            type="button"
            onClick={togglePlayPause}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0 hover:bg-orange-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" aria-hidden />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" aria-hidden />
            )}
          </button>

          <button
            type="button"
            onClick={playNext}
            aria-label="Next track"
            title="Next track"
            className="w-8 h-8 rounded-full text-slate-500 hover:bg-slate-100 flex items-center justify-center shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
          >
            <SkipForward className="w-4 h-4" aria-hidden />
          </button>

          <button
            type="button"
            onClick={() => onExpand(currentTrack)}
            aria-label="Expand player"
            className="w-9 h-9 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 ml-1"
          >
            <Maximize2 className="w-4 h-4" aria-hidden />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
