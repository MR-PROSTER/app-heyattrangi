"use client"

import React, { useState, useMemo, useEffect, memo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ArrowLeft, Play, Pause, Music, AlertCircle } from "lucide-react"
import { useListenPlayer } from "@/components/patient/library/explore/listen/ListenPlayerContext"
import { MUSIC_CATEGORIES, getTracksForCategory, UNIQUE_TRACKS } from "@/lib/data/musicLibrary"
import type { ListenTrack, ListenCategory } from "@/data/listenContent"
import ListenCover from "@/components/patient/library/explore/listen/ListenCover"


// Category UI Colors matching Aatrangi activities style
interface CategoryColorTheme {
  bg: string
  border: string
  text: string
  badgeBg: string
  badgeText: string
  circleBg: string
}

const LISTEN_CARD_COLORS = [
  "#F49865", // Soft Orange
  "#A5BBEC", // Soft Blue
  "#CEA4EC", // Soft Purple
  "#9ACDAC", // Soft Green
  "#DFD39F", // Soft Yellow
  "#F2AAAB", // Soft Red/Pink
]

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
  "Love": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599494/Conscious_Swamp_rec7wf.png",
  "Calm Piano": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599494/Calm_Piano_xcd8qr.png",
  "Boredom": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599501/Sleep_Music_dkgagt.png",
  "Night Driving": "https://res.cloudinary.com/dxoiluua8/image/upload/v1786599498/Forest_Ambience_Extended_mwmguk.png",
}

function getDeterministicCardStyle(index: number): CategoryColorTheme {
  const colorIndex = index % LISTEN_CARD_COLORS.length
  const bg = LISTEN_CARD_COLORS[colorIndex]

  switch (bg) {
    case "#F49865": // Soft Orange
      return {
        bg: "#F49865",
        text: "#52250c",
        badgeBg: "#df7f49",
        badgeText: "#ffffff",
        border: "#df7f49",
        circleBg: "#dd8251"
      }
    case "#A5BBEC": // Soft Blue
      return {
        bg: "#A5BBEC",
        text: "#132349",
        badgeBg: "#8ba3db",
        badgeText: "#ffffff",
        border: "#8ba3db",
        circleBg: "#8ca4da"
      }
    case "#CEA4EC": // Soft Purple
      return {
        bg: "#CEA4EC",
        text: "#3c1758",
        badgeBg: "#b98cd9",
        badgeText: "#ffffff",
        border: "#b98cd9",
        circleBg: "#ba8cd9"
      }
    case "#9ACDAC": // Soft Green
      return {
        bg: "#9ACDAC",
        text: "#163a23",
        badgeBg: "#83ba96",
        badgeText: "#ffffff",
        border: "#83ba96",
        circleBg: "#83ba96"
      }
    case "#DFD39F": // Soft Yellow
      return {
        bg: "#DFD39F",
        text: "#463f1b",
        badgeBg: "#c9bc86",
        badgeText: "#ffffff",
        border: "#c9bc86",
        circleBg: "#cabd85"
      }
    case "#F2AAAB": // Soft Red/Pink
      return {
        bg: "#F2AAAB",
        text: "#53181a",
        badgeBg: "#db9394",
        badgeText: "#ffffff",
        border: "#db9394",
        circleBg: "#db9394"
      }
    default:
      return {
        bg: "#F49865",
        text: "#52250c",
        badgeBg: "#df7f49",
        badgeText: "#ffffff",
        border: "#df7f49",
        circleBg: "#dd8251"
      }
  }
}

function CuteCategoryCharacter({ categoryName, className = "w-40 h-40" }: { categoryName: string; className?: string }) {
  if (categoryName === "Calm Down") {
    return (
      <motion.img
        src="https://res.cloudinary.com/dxoiluua8/image/upload/v1786528343/Calm_Down_dpobfg.png"
        alt="Calm Down"
        className={`${className} select-none pointer-events-none object-contain`}
        animate={{ scale: [1, 1.04, 1], y: [0, -2, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    )
  }

  if (categoryName === "Comfort") {
    return (
      <motion.img
        src="https://res.cloudinary.com/dxoiluua8/image/upload/v1786528344/Comfort_u1cahf.png"
        alt="Comfort"
        className={`${className} select-none pointer-events-none object-contain`}
        animate={{ scale: [1, 1.02, 1], rotate: [-1, 1, -1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />
    )
  }

  if (categoryName === "Emotional Release") {
    return (
      <motion.img
        src="https://res.cloudinary.com/dxoiluua8/image/upload/v1786528344/Emotional_Release_xw7c8m.png"
        alt="Emotional Release"
        className={`${className} select-none pointer-events-none object-contain`}
        animate={{ y: [0, -3, 0], scale: [1, 1.02, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    )
  }

  if (categoryName === "Focus") {
    return (
      <motion.img
        src="https://res.cloudinary.com/dxoiluua8/image/upload/v1786528344/Focus_lgk5tj.png"
        alt="Focus"
        className={`${className} select-none pointer-events-none object-contain`}
        animate={{ scale: [1, 1.02, 1], rotate: [0, 2, -2, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />
    )
  }

  if (categoryName === "Ground & Breathe") {
    return (
      <motion.img
        src="https://res.cloudinary.com/dxoiluua8/image/upload/v1786528344/Ground_Breathe_js8cns.png"
        alt="Ground & Breathe"
        className={`${className} select-none pointer-events-none object-contain`}
        animate={{ y: [0, -3, 0], scale: [1, 1.02, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    )
  }

  if (categoryName === "Lift Your Mood") {
    return (
      <motion.img
        src="https://res.cloudinary.com/dxoiluua8/image/upload/v1786528345/Lift_Your_Mood_b9tfgd.png"
        alt="Lift Your Mood"
        className={`${className} select-none pointer-events-none object-contain`}
        animate={{ y: [0, -5, 0], scale: [1, 1.02, 1] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />
    )
  }

  if (categoryName === "Reflect") {
    return (
      <motion.img
        src="https://res.cloudinary.com/dxoiluua8/image/upload/v1786528345/Reflect_ohmfop.png"
        alt="Reflect"
        className={`${className} select-none pointer-events-none object-contain`}
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
      />
    )
  }

  if (categoryName === "Sleep & Wind Down") {
    return (
      <motion.img
        src="https://res.cloudinary.com/dxoiluua8/image/upload/v1786528345/Sleep_Wind_Down_m8ffiw.png"
        alt="Sleep & Wind Down"
        className={`${className} select-none pointer-events-none object-contain`}
        animate={{ y: [0, -3, 0], scale: [1, 1.02, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />
    )
  }

  // Sleep & Wind Down fallback: Fluffy sheep sleeping character
  return (
    <motion.svg
      className={`${className} select-none pointer-events-none`}
      viewBox="0 0 100 100"
      animate={{ scale: [1, 1.05, 1], y: [0, -2, 0] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <path d="M 30,68 C 22,68 18,60 22,52 C 18,44 24,36 32,38 C 36,30 46,28 52,34 C 58,28 68,30 72,38 C 80,36 84,44 82,52 C 86,60 80,68 72,68 Z" fill="#FFFFFF" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 28,42 C 25,42 25,48 28,48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M 72,42 C 75,42 75,48 72,48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M 40,68 L 40,78" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 60,68 L 60,78" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 42,48 Q 45,51 47,48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M 53,48 Q 56,51 58,48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M 48,55 Q 50,56 52,55" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </motion.svg>
  )
}

interface ListenTabPanelProps {
  customCdnBase?: string
  initialTracks?: ListenTrack[]
  onCategorySelect?: (categoryName: string | null) => void
}

function ListenTabPanel({ customCdnBase, initialTracks = [], onCategorySelect }: ListenTabPanelProps) {
  const router = useRouter()
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null)
  const [activeCardId, setActiveCardId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { currentTrack, isPlaying, playTrack } = useListenPlayer()

  useEffect(() => {
    onCategorySelect?.(selectedCategoryName)
  }, [selectedCategoryName, onCategorySelect])

  useEffect(() => {
    return () => {
      setActiveCardId(null)
    }
  }, [])

  const handleCategorySelect = (categoryName: string) => {
    setActiveCardId(categoryName)
    setTimeout(() => {
      setSelectedCategoryName(categoryName)
    }, 480)
  }

  const [tracks, setTracks] = useState<ListenTrack[]>([])

  useEffect(() => {
    if (selectedCategoryName) {
      setIsLoading(true)
      const timer = setTimeout(() => {
        let fetched: ListenTrack[] = []
        if (initialTracks && initialTracks.length > 0) {
          fetched = initialTracks.filter((t) => t.category === selectedCategoryName).map((t) => {
            const cleanTitleSlug = t.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
            const staticTrack = UNIQUE_TRACKS[t.slug] || UNIQUE_TRACKS[t.id] || UNIQUE_TRACKS[cleanTitleSlug]
            return {
              ...t,
              coverImage: t.coverImage || t.imageUrl || staticTrack?.artworkUrl || "",
              imageUrl: t.imageUrl || t.coverImage || staticTrack?.artworkUrl || null,
            }
          })
        }
        
        if (fetched.length === 0) {
          const mockMusicTracks = getTracksForCategory(selectedCategoryName, customCdnBase)
          fetched = mockMusicTracks.map((t) => {
            const isAvailable = t.audioUrl !== null && !t.audioUrl.endsWith("null")
            return {
              id: t.id,
              slug: t.id,
              title: t.title,
              shortDescription: `Track in ${selectedCategoryName}`,
              description: `Track in ${selectedCategoryName}`,
              category: selectedCategoryName as ListenCategory,
              artist: "Hey Attrangi Wellness",
              duration: t.duration || "5:00",
              displayOrder: 1,
              audioAvailable: isAvailable,
              coverIllustration: "moon" as const,
              coverImage: t.artworkUrl || "",
              audioSrc: t.audioUrl || "",
            } as ListenTrack
          })
        }
        setTracks(fetched)
        setIsLoading(false)
      }, 350)
      return () => clearTimeout(timer)
    } else {
      setTracks([])
    }
  }, [selectedCategoryName, initialTracks, customCdnBase])

  const handlePlayClick = (targetTrack: ListenTrack) => {
    if (!targetTrack.audioSrc) return
    router.push(`/listen/${targetTrack.id}`)
  }

  const categoriesWithCounts = useMemo(() => {
    return MUSIC_CATEGORIES.map((category) => {
      let count = category.trackCount
      if (initialTracks && initialTracks.length > 0) {
        count = initialTracks.filter((t) => t.category === category.name).length
      }
      return {
        ...category,
        trackCount: count,
      }
    })
  }, [initialTracks])

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 25 } },
  }

  if (selectedCategoryName) {
    // Find index of the selected category to retain consistent header theme colors
    const categoryIndex = categoriesWithCounts.findIndex((c) => c.name === selectedCategoryName)
    const theme = getDeterministicCardStyle(categoryIndex >= 0 ? categoryIndex : 0)

    return (
      <div className="space-y-6 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300">
        {/* Back and Title Header */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              setSelectedCategoryName(null)
              setActiveCardId(null)
            }}
            className="self-start text-[11px] font-black text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest flex items-center gap-1.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Categories
          </button>

          <div className="flex flex-wrap items-baseline gap-3 mt-1.5">
            <h2 className="font-extrabold text-[28px] md:text-[32px] text-slate-800 tracking-tight">
              {selectedCategoryName}
            </h2>
            <span 
              style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}
              className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider"
            >
              {tracks.length} {tracks.length === 1 ? "track" : "tracks"}
            </span>
          </div>
          <p className="text-slate-500 font-medium text-sm md:text-[15px] leading-relaxed max-w-xl">
            {MUSIC_CATEGORIES.find((c) => c.name === selectedCategoryName)?.description}
          </p>
        </div>

        {/* Tracks List */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 pt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col space-y-3">
                <div className="aspect-[3/4] w-full bg-slate-100/60 rounded-[24px] animate-pulse" />
                <div className="h-4 w-3/4 bg-slate-100/60 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-slate-100/60 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-slate-200 rounded-[28px] bg-white">
            <AlertCircle className="w-10 h-10 text-slate-400 mb-3" />
            <p className="text-slate-600 font-bold text-sm text-center">
              No music available in this category yet.
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 pt-4"
          >
            {tracks.map((track) => {
              const isCurrent = currentTrack?.id === track.id
              const isAvailable = track.audioAvailable !== false && !!track.audioSrc

              return (
                <motion.div key={track.id} variants={cardVariants}>
                  <button
                    type="button"
                    onClick={() => isAvailable && handlePlayClick(track)}
                    className={`group flex w-full flex-col text-left transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.98] rounded-[24px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 ${
                      !isAvailable ? "cursor-not-allowed opacity-80" : ""
                    }`}
                  >
                    {/* Cover Image Container */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[24px] bg-white border border-slate-100 shadow-[0_8px_24px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] flex items-center justify-center">
                      {selectedCategoryName === "Calm Down" && CALM_TRACK_IMAGES[track.title] ? (
                        <img
                          src={CALM_TRACK_IMAGES[track.title]}
                          alt={track.title}
                          className="w-full h-full object-cover select-none pointer-events-none"
                        />
                      ) : selectedCategoryName === "Comfort" && COMFORT_TRACK_IMAGES[track.title] ? (
                        <img
                          src={COMFORT_TRACK_IMAGES[track.title]}
                          alt={track.title}
                          className="w-full h-full object-cover select-none pointer-events-none"
                        />
                      ) : selectedCategoryName === "Ground & Breathe" && GROUND_BREATHE_TRACK_IMAGES[track.title] ? (
                        <img
                          src={GROUND_BREATHE_TRACK_IMAGES[track.title]}
                          alt={track.title}
                          className="w-full h-full object-cover select-none pointer-events-none"
                        />
                      ) : selectedCategoryName === "Lift Your Mood" && LIFT_MOOD_TRACK_IMAGES[track.title] ? (
                        <img
                          src={LIFT_MOOD_TRACK_IMAGES[track.title]}
                          alt={track.title}
                          className="w-full h-full object-cover select-none pointer-events-none"
                        />
                      ) : selectedCategoryName === "Reflect" && REFLECT_TRACK_IMAGES[track.title] ? (
                        <img
                          src={REFLECT_TRACK_IMAGES[track.title]}
                          alt={track.title}
                          className="w-full h-full object-cover select-none pointer-events-none"
                        />
                      ) : selectedCategoryName === "Sleep & Wind Down" && SLEEP_WIND_DOWN_TRACK_IMAGES[track.title] ? (
                        <img
                          src={SLEEP_WIND_DOWN_TRACK_IMAGES[track.title]}
                          alt={track.title}
                          className="w-full h-full object-cover select-none pointer-events-none"
                        />
                      ) : selectedCategoryName === "Emotional Release" && EMOTIONAL_RELEASE_TRACK_IMAGES[track.title] ? (
                        <img
                          src={EMOTIONAL_RELEASE_TRACK_IMAGES[track.title]}
                          alt={track.title}
                          className="w-full h-full object-cover select-none pointer-events-none"
                        />
                      ) : selectedCategoryName === "Focus" && FOCUS_TRACK_IMAGES[track.title] ? (
                        <img
                          src={FOCUS_TRACK_IMAGES[track.title]}
                          alt={track.title}
                          className="w-full h-full object-cover select-none pointer-events-none"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-orange-50 text-[#FF6A39] flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                          <Music className="w-6 h-6 stroke-[2]" />
                        </div>
                      )}

                      {/* Play/Pause Overlay Icon on hover */}
                      {isAvailable && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="w-12 h-12 rounded-full bg-white/95 text-[#FF6A39] flex items-center justify-center shadow-lg transition-transform duration-200 transform scale-90 group-hover:scale-100">
                            {isCurrent && isPlaying ? (
                              <Pause className="w-5 h-5 fill-current stroke-current" />
                            ) : (
                              <Play className="w-5 h-5 fill-current stroke-current ml-0.5" />
                            )}
                          </div>
                        </div>
                      )}

                      {/* Dynamic soundwave animation overlay when playing */}
                      {isCurrent && isPlaying && (
                        <div className="absolute bottom-3 right-3 bg-black/60 px-2.5 py-1.5 rounded-full flex items-center gap-0.5 backdrop-blur-sm">
                          {[1, 2, 3].map((b) => (
                            <span
                              key={b}
                              className="w-0.5 bg-white rounded-full animate-bounce"
                              style={{
                                height: b === 1 ? "10px" : b === 2 ? "14px" : "6px",
                                animationDuration: `${0.6 + b * 0.15}s`,
                              }}
                            />
                          ))}
                        </div>
                      )}

                      {/* Coming soon label overlay */}
                      {!isAvailable && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                          <span className="text-[9px] font-black uppercase tracking-widest text-white bg-black/50 px-3 py-1.5 rounded-full border border-white/10">
                            Coming Soon
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Meta text details matching Read card styling */}
                    <div className="mt-3 px-0.5 w-full">
                      <h3 className="line-clamp-2 leading-snug tracking-tight text-[#1A1A1A] text-[14px] sm:text-[15px] font-bold group-hover:text-slate-800 transition-colors">
                        {track.title}
                      </h3>
                      <p className="mt-1 truncate text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>{!isAvailable ? "Coming Soon" : "Aatrangi Music"}</span>
                        {isAvailable && track.duration && <span className="tabular-nums opacity-85">{track.duration}</span>}
                      </p>
                    </div>
                  </button>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-7 animate-in fade-in duration-300 w-full">
      {/* Mobile view: Overlapping 3D card deck list */}
      <div className="flex md:hidden flex-col -space-y-[32px] min-[360px]:-space-y-[38px] min-[390px]:-space-y-[45px] pt-4 pb-20">
        {categoriesWithCounts.map((category, index) => {
          const theme = getDeterministicCardStyle(index)
          const isSelected = activeCardId === category.name
          const isAnySelected = activeCardId !== null
          const isOthersSelected = isAnySelected && !isSelected

          return (
            <motion.div
              key={category.name}
              style={{ zIndex: isSelected ? 500 : index + 1 }}
              animate={
                isSelected
                  ? { y: -65, scale: 1.05, opacity: 1 }
                  : isOthersSelected
                    ? { y: 15, scale: 0.95, opacity: 0.1 }
                    : { y: 0, scale: 1, opacity: 1 }
              }
              whileHover={activeCardId ? undefined : { y: -16, scale: 1.02, zIndex: 50 }}
              whileTap={activeCardId ? undefined : { y: -24, scale: 0.97, zIndex: 100 }}
              transition={{
                type: "tween",
                duration: isSelected ? 0.45 : 0.25,
                ease: isSelected ? [0.25, 1, 0.5, 1] : "easeOut",
              }}
              className="w-full relative cursor-pointer animate-in fade-in"
            >
              <button
                type="button"
                onClick={() => handleCategorySelect(category.name)}
                style={{
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                  color: theme.text,
                  transform: isSelected
                    ? "perspective(800px) rotateX(0deg)"
                    : "perspective(800px) rotateX(-15deg)",
                  transformOrigin: "top center",
                  boxShadow: isSelected
                    ? `0 25px 55px ${theme.border}cc, 0 20px 50px rgba(0, 0, 0, 0.18)`
                    : undefined,
                }}
                className={`relative flex flex-col h-[155px] min-[360px]:h-[175px] min-[390px]:h-[200px] w-full text-left rounded-[24px] min-[360px]:rounded-[28px] min-[390px]:rounded-[32px] p-4 min-[360px]:p-5 min-[390px]:p-6 border transition-all duration-300 overflow-hidden active:shadow-[0_16px_32px_rgba(0,0,0,0.12)] ${
                  isSelected ? "z-50 pointer-events-none" : "shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
                }`}
              >
                <span className="absolute inset-0 bg-white/20 opacity-0 active:opacity-100 transition-opacity duration-75 pointer-events-none rounded-[24px] min-[360px]:rounded-[28px] min-[390px]:rounded-[32px] z-20" />

                <div className="flex items-start justify-between w-full z-10">
                  <span className="font-extrabold text-[16px] min-[360px]:text-[18px] min-[390px]:text-[20px] tracking-tight leading-tight min-w-0 flex-1">
                    {category.name}
                  </span>
                  <span 
                    style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}
                    className="px-2.5 py-1 min-[360px]:px-4 min-[360px]:py-1.5 rounded-full text-[10px] min-[360px]:text-[11px] min-[390px]:text-xs font-bold whitespace-nowrap shrink-0 ml-2"
                  >
                    {category.trackCount} tracks
                  </span>
                </div>
                

                {/* Bottom Circle with Cute Character inside */}
                <div 
                  style={{ backgroundColor: theme.circleBg }}
                  className="absolute left-1/2 -translate-x-1/2 rounded-full flex items-center justify-center z-0 transition-transform duration-300 w-[220px] h-[220px] -bottom-[110px] min-[360px]:w-[250px] min-[360px]:h-[250px] min-[360px]:-bottom-[125px] min-[390px]:w-[280px] min-[390px]:h-[280px] min-[390px]:-bottom-[140px]"
                >
                  <div className="mb-18 -translate-y-[20px] min-[360px]:-translate-y-[24px] min-[390px]:-translate-y-[30px]">
                    <CuteCategoryCharacter categoryName={category.name} className="w-[150px] h-[150px] min-[360px]:w-[175px] min-[360px]:h-[175px] min-[390px]:w-[195px] min-[390px]:h-[195px]" />
                  </div>
                </div>
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* Desktop view: Standard Grid matching ActivityCard (3 columns layout) */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
      >
        {categoriesWithCounts.map((category, index) => {
          const theme = getDeterministicCardStyle(index)

          return (
            <motion.div key={category.name} variants={cardVariants}>
              <button
                type="button"
                onClick={() => setSelectedCategoryName(category.name)}
                style={{
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                  color: theme.text,
                }}
                className="group relative flex flex-col h-[200px] w-full text-left rounded-[32px] p-6 shadow-[0_6px_20px_rgba(0,0,0,0.04)] border transition-all duration-300 ease-out overflow-hidden hover:scale-[1.02] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2"
              >
                <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-[32px] z-20" />
                
                <div className="flex items-start justify-between w-full z-10 gap-3">
                  <span className="font-extrabold text-[20px] tracking-tight leading-tight">
                    {category.name}
                  </span>
                  <span 
                    style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}
                    className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider"
                  >
                    {category.trackCount} tracks
                  </span>
                </div>
                

                {/* Bottom Circle with Cute Character inside */}
                <div 
                  style={{ backgroundColor: theme.circleBg }}
                  className="absolute -bottom-[140px] left-1/2 -translate-x-1/2 w-[280px] h-[280px] rounded-full flex items-center justify-center z-0 transition-transform duration-300 group-hover:scale-105"
                >
                  <div className="mb-18 -translate-y-[25px]">
                    <CuteCategoryCharacter categoryName={category.name} className="w-[195px] h-[195px]" />
                  </div>
                </div>
              </button>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

export default memo(ListenTabPanel)
