"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import type { ListenTrack } from "@/data/listenContent"
import ListenCover from "@/components/patient/library/explore/listen/ListenCover"
import AudioPlayer from "@/components/patient/library/explore/listen/AudioPlayer"
import ActivityBadge from "@/components/patient/library/explore/ActivityBadge"
import ActivityDuration from "@/components/patient/library/explore/ActivityDuration"
import { useListenPlayer } from "@/components/patient/library/explore/listen/ListenPlayerContext"

interface ListenPlayerScreenProps {
  track: ListenTrack
  onBack: () => void
}

export default function ListenPlayerScreen({
  track,
  onBack,
}: ListenPlayerScreenProps) {
  const { currentTrack, playTrack } = useListenPlayer()

  useEffect(() => {
    if (currentTrack?.id !== track.id) {
      playTrack(track)
    }
  }, [track, currentTrack?.id, playTrack])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex-1 h-full min-h-0 w-full bg-[#FFF9F8] text-slate-800 flex flex-col font-sans"
    >
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-6 md:p-8 w-full max-w-md mx-auto pb-12 space-y-8">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to Listen"
            className="inline-flex items-center gap-1.5 text-[11px] font-black text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 rounded-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
            Back
          </button>

          <div className="flex flex-col items-center text-center gap-5">
            <ListenCover
              illustration={track.coverIllustration}
              size="lg"
              title={track.title}
            />
            <div className="space-y-2 max-w-sm">
              <h1 className="font-extrabold text-2xl sm:text-[28px] text-slate-800 tracking-tight">
                {track.title}
              </h1>
              <p className="text-slate-500 font-medium text-sm sm:text-[15px] leading-relaxed">
                {track.description}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <ActivityDuration duration={track.duration} />
                <ActivityBadge label={track.category} />
              </div>
            </div>
          </div>

          <AudioPlayer />
        </div>
      </div>
    </motion.div>
  )
}
