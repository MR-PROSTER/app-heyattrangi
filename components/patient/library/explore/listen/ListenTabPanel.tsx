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
      <motion.svg
        className={`${className} select-none pointer-events-none`}
        viewBox="0 0 100 100"
        animate={{ scale: [1, 1.06, 1], y: [0, -2, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M 25,60 C 20,60 15,55 15,48 C 15,41 21,36 28,36 C 30,30 36,25 44,25 C 52,25 58,31 60,38 C 63,35 67,34 71,34 C 77,34 82,39 82,45 C 82,51 77,56 71,56"
          fill="#FFFFFF"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M 35,43 Q 39,47 43,43" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 53,43 Q 57,47 61,43" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 46,49 Q 48,51 50,49" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <text x="66" y="24" fill="currentColor" fontSize="7" fontWeight="bold">z</text>
        <text x="73" y="17" fill="currentColor" fontSize="9" fontWeight="bold">Z</text>
      </motion.svg>
    )
  }

  if (categoryName === "Comfort") {
    // Cozy hugging heart character
    return (
      <motion.svg
        className={`${className} select-none pointer-events-none`}
        viewBox="0 0 100 100"
        animate={{ scale: [1, 1.05, 1], rotate: [-1, 1, -1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M 50,32 C 50,22 30,12 20,27 C 10,42 30,67 50,84 C 70,67 90,42 80,27 C 70,12 50,22 50,32 Z" fill="#FFFFFF" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M 28,47 C 33,50 40,50 43,47" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M 72,47 C 67,50 60,50 57,47" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="38" cy="40" r="3.5" fill="currentColor" />
        <circle cx="62" cy="40" r="3.5" fill="currentColor" />
        <path d="M 47,45 Q 50,48 53,45" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </motion.svg>
    )
  }

  if (categoryName === "Emotional Release") {
    // Relieved raincloud character releasing micro drops
    return (
      <motion.svg
        className={`${className} select-none pointer-events-none`}
        viewBox="0 0 100 100"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M 25,50 C 20,50 15,45 15,38 C 15,31 21,26 28,26 C 30,20 36,15 44,15 C 52,15 58,21 60,28 C 63,25 67,24 71,24 C 77,24 82,29 82,35 C 82,41 77,46 71,46" fill="#FFFFFF" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 33,35 Q 37,38 41,35" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M 53,35 Q 57,38 61,35" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M 46,40 Q 48,42 50,40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <motion.path d="M 30,55 L 30,65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" animate={{ y: [0, 8, 0], opacity: [1, 0, 1] }} transition={{ duration: 2, repeat: Infinity }} />
        <motion.path d="M 50,58 L 50,68" stroke="currentColor" strokeWidth="2" strokeLinecap="round" animate={{ y: [0, 10, 0], opacity: [1, 0, 1] }} transition={{ duration: 1.5, delay: 0.3, repeat: Infinity }} />
        <motion.path d="M 70,55 L 70,65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" animate={{ y: [0, 8, 0], opacity: [1, 0, 1] }} transition={{ duration: 1.8, delay: 0.6, repeat: Infinity }} />
      </motion.svg>
    )
  }

  if (categoryName === "Focus") {
    // Focus target with bullseye smiley
    return (
      <motion.svg
        className={`${className} select-none pointer-events-none`}
        viewBox="0 0 100 100"
        animate={{ scale: [1, 1.04, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <circle cx="50" cy="50" r="30" fill="#FFFFFF" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="18" fill="none" stroke="currentColor" strokeWidth="2.2" />
        <circle cx="50" cy="50" r="7" fill="currentColor" />
        <path d="M 50,10 L 50,20 M 50,80 L 50,90 M 10,50 L 20,50 M 80,50 L 90,50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </motion.svg>
    )
  }

  if (categoryName === "Ground & Breathe") {
    // Growing seedling pot character
    return (
      <motion.svg
        className={`${className} select-none pointer-events-none`}
        viewBox="0 0 100 100"
        animate={{ y: [0, -3, 0], rotate: [0, 1.5, -1.5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M 32,52 L 68,52 L 62,84 L 38,84 Z" fill="#FFFFFF" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        <rect x="28" y="46" width="44" height="6" rx="2" fill="#FFFFFF" stroke="currentColor" strokeWidth="2.5" />
        <path d="M 50,46 Q 42,32 50,18 Q 58,32 50,46" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="43" cy="66" r="3.2" fill="currentColor" />
        <circle cx="57" cy="66" r="3.2" fill="currentColor" />
        <path d="M 48,72 Q 50,74 52,72" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </motion.svg>
    )
  }

  if (categoryName === "Lift Your Mood") {
    // Rising smiley hot-air balloon
    return (
      <motion.svg
        className={`${className} select-none pointer-events-none`}
        viewBox="0 0 100 100"
        animate={{ y: [0, -5, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M 50,18 C 70,18 78,35 70,55 C 64,68 53,73 50,73 C 47,73 36,68 30,55 C 22,35 30,18 50,18 Z" fill="#FFFFFF" stroke="currentColor" strokeWidth="2.5" />
        <path d="M 47,73 L 53,73 L 50,78 Z" fill="currentColor" />
        <path d="M 50,78 Q 46,86 52,94" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="43" cy="38" r="3.5" fill="currentColor" />
        <circle cx="57" cy="38" r="3.5" fill="currentColor" />
        <path d="M 45,46 Q 50,52 55,46" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </motion.svg>
    )
  }

  if (categoryName === "Reflect") {
    // Reflecting shiny pond character
    return (
      <motion.svg
        className={`${className} select-none pointer-events-none`}
        viewBox="0 0 100 100"
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ellipse cx="50" cy="55" rx="34" ry="24" fill="#FFFFFF" stroke="currentColor" strokeWidth="2.5" />
        <ellipse cx="50" cy="55" rx="20" ry="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
        <circle cx="42" cy="55" r="3" fill="currentColor" />
        <circle cx="58" cy="55" r="3" fill="currentColor" />
        <path d="M 48,61 Q 50,63 52,61" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </motion.svg>
    )
  }

  // Sleep & Wind Down: Fluffy sheep sleeping character
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
}

function ListenTabPanel({ customCdnBase, initialTracks = [] }: ListenTabPanelProps) {
  const router = useRouter()
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { currentTrack, isPlaying, playTrack } = useListenPlayer()

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
    playTrack(targetTrack, tracks)
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
              window.location.href = "/patient/library?mode=listen"
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
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[24px] bg-[#E8E0D4] shadow-[0_10px_28px_rgba(40,30,20,0.12)] ring-1 ring-black/[0.04]">
                      {track.coverImage || track.imageUrl ? (
                        <img
                          src={(track.coverImage || track.imageUrl) ?? undefined}
                          alt={track.title || "The Budding of Consciousness"}
                          className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                          <ListenCover
                            illustration={track.coverIllustration ?? "rain"}
                            size="lg"
                            title={track.title}
                          />
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
      <div className="flex md:hidden flex-col -space-y-[22px] min-[360px]:-space-y-[27px] min-[390px]:-space-y-8 pt-4 pb-20">
        {categoriesWithCounts.map((category, index) => {
          const theme = getDeterministicCardStyle(index)

          return (
            <motion.div
              key={category.name}
              style={{ zIndex: index + 1 }}
              whileHover={{ y: -16, scale: 1.02, zIndex: 50 }}
              whileTap={{ y: -24, scale: 0.97, zIndex: 100 }}
              transition={{ type: "spring", stiffness: 350, damping: 20 }}
              className="w-full relative cursor-pointer animate-in fade-in"
            >
              <button
                type="button"
                onClick={() => setSelectedCategoryName(category.name)}
                style={{
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                  color: theme.text,
                }}
                className="relative flex flex-col h-[155px] min-[360px]:h-[175px] min-[390px]:h-[200px] w-full text-left rounded-[24px] min-[360px]:rounded-[28px] min-[390px]:rounded-[32px] p-4 min-[360px]:p-5 min-[390px]:p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)] border transition-all duration-300 overflow-hidden active:shadow-[0_16px_32px_rgba(0,0,0,0.12)]"
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
                

                <div className="absolute right-0 bottom-0 z-0 select-none pointer-events-none">
                  <CuteCategoryCharacter categoryName={category.name} className="w-[100px] h-[100px] min-[360px]:w-[130px] min-[360px]:h-[130px] min-[390px]:w-40 min-[390px]:h-40" />
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
                  className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-44 h-44 rounded-full flex items-center justify-center z-0 transition-transform duration-300 group-hover:scale-105"
                >
                  <div className="mb-18">
                    <CuteCategoryCharacter categoryName={category.name} className="w-[110px] h-[110px]" />
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
