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

const CALM_TRACK_IMAGES: Record<string, string> = {
  "The Budding of Consciousness": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599505/The_Budding_of_Consciousness_fcaxbe.png",
  "Up in the Sky": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599505/Up_in_the_Sky_pg6cxp.png",
  "Gentle Ambient": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599499/Gentle_Ambient_kk2pg1.png",
  "First Light": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599496/First_Light-2_cjyt6x.png",
  "Calm Ambient": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599493/Calm_Ambient_gu1nfj.png",
}

const COMFORT_TRACK_IMAGES: Record<string, string> = {
  "Deep Blue": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599495/Deep_Blue-1_yyip1l.png",
  "The Budding of Consciousness": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599504/The_Budding_of_Consciousness-2_ocfumx.png",
  "Tender Piano": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599504/Tender_Piano_x2lnvs.png",
  "First Light": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599497/First_Light-3_ydgtmw.png",
  "Gentle Emotional Piano": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599499/Gentle_Emotional_Piano_bbkbhw.png",
  "Calm Piano": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599494/Calm_Piano-1_ljjyyy.png",
  "Warm Ambient": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599506/Warm_Ambient_q9jw3r.png",
}

const GROUND_BREATHE_TRACK_IMAGES: Record<string, string> = {
  "Deep Blue": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599495/Deep_Blue_tdigae.png",
  "Wind Ambience": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599506/Wind_Ambience_vblqt3.png",
  "Birds Before Rain": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599493/Birds_Before_Rain_avdsly.png",
  "River Ambience": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599501/River_Ambience_msfvci.png",
  "Forest Ambience — Extended": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599498/Forest_Ambience_Extended_mwmguk.png",
  "Forest Ambience": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599498/Forest_Ambience_wa67uv.png",
}

const LIFT_MOOD_TRACK_IMAGES: Record<string, string> = {
  "Sunset Plains": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599503/Sunset_Plains_wkcyzz.png",
  "First Light": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599496/First_Light-2_cjyt6x.png",
  "Another August": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599493/Another_August_py8huv.png",
  "Calm Ambient": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599493/Calm_Ambient-1_igbhzd.png",
  "Calm Piano": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599494/Calm_Piano_xcd8qr.png",
}

const REFLECT_TRACK_IMAGES: Record<string, string> = {
  "The Budding of Consciousness": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599504/The_Budding_of_Consciousness-1_apkxp9.png",
  "Slow Piano Intermission": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599502/Slow_Piano_Intermission_psbj7a.png",
  "Quiet Piano": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599500/Quiet_Piano_ot6hyd.png",
  "Piano Nostalgia": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599500/Piano_Nostalgia_g7kqxt.png",
  "First Light": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599496/First_Light-1_xrekcz.png",
  "Contemplation": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599494/Contemplation_wspqni.png",
}

const SLEEP_WIND_DOWN_TRACK_IMAGES: Record<string, string> = {
  "Starfield Romance": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599502/Starfield_Romance_mqxrpe.png",
  "Sleep Music": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599501/Sleep_Music_dkgagt.png",
  "Strange Reality Warp": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599503/Strange_Reality_Warp_ipeaod.png",
  "Conscious Swamp": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599494/Conscious_Swamp_rec7wf.png",
  "Frozen Ocean Trip": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599499/Frozen_Ocean_Trip_tica2c.png",
  "Dreaming of Leaves": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599495/Dreaming_of_Leaves_c8evcx.png",
}

const EMOTIONAL_RELEASE_TRACK_IMAGES: Record<string, string> = {
  "Quiet Piano": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599500/Quiet_Piano_ot6hyd.png",
  "Piano Nostalgia": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599500/Piano_Nostalgia_g7kqxt.png",
  "Mystical Piano": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599494/Calm_Piano_xcd8qr.png",
  "November Reflection": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599499/Frozen_Ocean_Trip_tica2c.png",
  "First Light": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599496/First_Light-2_cjyt6x.png",
  "First Night": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599496/First_Light-2_cjyt6x.png",
  "Gentle Emotional Piano": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599499/Gentle_Emotional_Piano_bbkbhw.png",
}

const FOCUS_TRACK_IMAGES: Record<string, string> = {
  "Slow Piano Intermission": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599502/Slow_Piano_Intermission_psbj7a.png",
  "JRPG Piano": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599504/Tender_Piano_x2lnvs.png",
  "Contemplation": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599494/Contemplation_wspqni.png",
  "Lost in Your Eyes": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599502/Starfield_Romance_mqxrpe.png",
  "Lost in your eyes": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599502/Starfield_Romance_mqxrpe.png",
}

function getTrackImage(track: ListenTrack): string | undefined {
  const title = track.title
  const category = track.category
  
  let mapped: string | undefined
  if (category === "Calm Down") mapped = CALM_TRACK_IMAGES[title]
  else if (category === "Comfort") mapped = COMFORT_TRACK_IMAGES[title]
  else if (category === "Ground & Breathe") mapped = GROUND_BREATHE_TRACK_IMAGES[title]
  else if (category === "Lift Your Mood") mapped = LIFT_MOOD_TRACK_IMAGES[title]
  else if (category === "Reflect") mapped = REFLECT_TRACK_IMAGES[title]
  else if (category === "Sleep & Wind Down") mapped = SLEEP_WIND_DOWN_TRACK_IMAGES[title]
  else if (category === "Emotional Release") mapped = EMOTIONAL_RELEASE_TRACK_IMAGES[title]
  else if (category === "Focus") mapped = FOCUS_TRACK_IMAGES[title]

  return mapped || track.coverImage || track.imageUrl || undefined
}

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

  const trackImage = getTrackImage(track)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-full min-h-0 w-full flex-1 flex-col bg-[#F9F8F3] text-[#1A1A1A]"
    >
      <div className="min-h-0 flex-1 overflow-y-auto flex flex-col">
        {/* Mobile layout — image-2 */}
        <div className="mx-auto flex w-full max-w-[420px] flex-col flex-1 px-4 pb-10 pt-4 md:hidden">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to Explore"
            className="mb-4 self-start text-[15px] font-medium text-[#6B6B6B] transition-colors hover:text-[#1A1A1A]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 rounded-md"
          >
            ← Explore
          </button>

          <div className="flex-1 flex flex-col items-center justify-between text-center w-full pb-4">
            <div className="!h-[min(90vw,350px)] !w-[min(90vw,350px)] aspect-square rounded-[28px] bg-white border border-slate-100 shadow-[0_16px_40px_rgba(40,30,20,0.06)] flex items-center justify-center overflow-hidden shrink-0">
              {trackImage ? (
                <img
                  src={trackImage}
                  alt={track.title}
                  className="w-full h-full object-cover select-none pointer-events-none"
                />
              ) : (
                <div className="w-18 h-18 rounded-full bg-orange-50 text-[#FF6A39] flex items-center justify-center">
                  <Music className="w-8 h-8 stroke-[2]" />
                </div>
              )}
            </div>

            <div className="flex flex-col items-center my-4 shrink-0">
              <span className="inline-flex items-center rounded-full bg-[#FFF0E6] px-3.5 py-1 text-[11px] font-bold tracking-[0.06em] text-[#E8722A]">
                {formatListenBadge(track.duration)}
              </span>

              <h1
                className={`${titleSerif.className} mt-3.5 text-[30px] font-bold leading-tight tracking-tight text-[#1A1A1A]`}
              >
                {track.title}
              </h1>

              {(track.shortDescription || track.description)?.trim() ? (
                <p className="mt-2.5 max-w-[320px] text-[14px] font-normal leading-relaxed text-[#8A8A8A]">
                  {(track.shortDescription || track.description).trim()}
                </p>
              ) : null}
            </div>

            <div className="w-full px-1 shrink-0">
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
            <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-[28px] sm:rounded-[32px] bg-white border border-slate-100 shadow-[0_16px_40px_rgba(40,30,20,0.06)] flex items-center justify-center overflow-hidden">
              {trackImage ? (
                <img
                  src={trackImage}
                  alt={track.title}
                  className="w-full h-full object-cover select-none pointer-events-none"
                />
              ) : (
                <div className="w-18 h-18 rounded-full bg-orange-50 text-[#FF6A39] flex items-center justify-center">
                  <Music className="w-8 h-8 stroke-[2]" />
                </div>
              )}
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
