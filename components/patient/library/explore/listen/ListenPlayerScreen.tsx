"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { Source_Serif_4 } from "next/font/google"
import { Music } from "lucide-react"
import type { ListenTrack } from "@/data/listenContent"
import ListenCover from "@/components/patient/library/explore/listen/ListenCover"
import AudioPlayer from "@/components/patient/library/explore/listen/AudioPlayer"
import { useListenPlayer } from "@/components/patient/library/explore/listen/ListenPlayerContext"

const titleSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
})

interface ListenPlayerScreenProps {
  track: ListenTrack
  onBack: () => void
}

function formatListenBadge(duration: string): string {
  const cleaned = duration.trim().replace(/\s*listen$/i, "")
  const upper = cleaned.toUpperCase()
  return upper.includes("LISTEN") ? upper : `${upper} LISTEN`
}

/**
 * Full-screen listen player.
 * Mobile matches listen-player-mobile (image-2); desktop layout unchanged.
 */
export default function ListenPlayerScreen({
  track,
  onBack,
}: ListenPlayerScreenProps) {
  console.log("ListenPlayerScreen RENDERING TRACK:", JSON.stringify(track, null, 2))
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
      className="flex h-full min-h-0 w-full flex-1 flex-col bg-[#F9F8F3] text-[#1A1A1A]"
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Mobile layout — image-2 */}
        <div className="mx-auto flex w-full max-w-[420px] flex-col px-5 pb-10 pt-4 md:hidden">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to Explore"
            className="mb-6 self-start text-[15px] font-medium text-[#6B6B6B] transition-colors hover:text-[#1A1A1A]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 rounded-md"
          >
            ← Explore
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="!h-[min(72vw,280px)] !w-[min(72vw,280px)] aspect-square rounded-[28px] bg-white border border-slate-100 shadow-[0_16px_40px_rgba(40,30,20,0.06)] flex items-center justify-center">
              <div className="w-18 h-18 rounded-full bg-orange-50 text-[#FF6A39] flex items-center justify-center">
                <Music className="w-8 h-8 stroke-[2]" />
              </div>
            </div>

            <span className="mt-6 inline-flex items-center rounded-full bg-[#FFF0E6] px-3.5 py-1 text-[11px] font-bold tracking-[0.06em] text-[#E8722A]">
              {formatListenBadge(track.duration)}
            </span>

            <h1
              className={`${titleSerif.className} mt-3.5 text-[30px] font-bold leading-tight tracking-tight text-[#1A1A1A]`}
            >
              {track.title}
            </h1>

            {(track.shortDescription || track.description)?.trim() ? (
              <p className="mt-2 max-w-[320px] text-[14px] font-normal leading-relaxed text-[#8A8A8A]">
                {(track.shortDescription || track.description).trim()}
              </p>
            ) : null}

            <div className="mt-8 w-full px-1">
              <AudioPlayer fallbackTrack={track} />
            </div>
          </div>
        </div>

        {/* Desktop layout — unchanged */}
        <div className="mx-auto hidden w-full max-w-[420px] px-6 pb-16 pt-5 sm:px-8 sm:pt-7 md:block">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to Explore"
            className="mb-10 text-[14px] font-medium text-[#4A4A4A] transition-colors hover:text-[#1A1A1A]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 rounded-md sm:mb-12"
          >
            ← Back to Explore
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-[28px] sm:rounded-[32px] bg-white border border-slate-100 shadow-[0_16px_40px_rgba(40,30,20,0.06)] flex items-center justify-center">
              <div className="w-18 h-18 rounded-full bg-orange-50 text-[#FF6A39] flex items-center justify-center">
                <Music className="w-8 h-8 stroke-[2]" />
              </div>
            </div>

            <span className="mt-7 inline-flex items-center rounded-full bg-[#FFF0E6] px-3.5 py-1 text-[11px] font-bold tracking-[0.06em] text-[#E8722A]">
              {formatListenBadge(track.duration)}
            </span>

            <h1
              className={`${titleSerif.className} mt-4 text-[28px] sm:text-[34px] font-bold leading-tight tracking-tight text-[#111111]`}
            >
              {track.title}
            </h1>

            {track.description?.trim() ? (
              <p className="mt-2.5 max-w-[340px] text-[15px] font-normal leading-relaxed text-[#6B6B6B]">
                {track.description.trim()}
              </p>
            ) : null}

            <div className="mt-10 w-full">
              <AudioPlayer fallbackTrack={track} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
