"use client"

import { memo } from "react"
import { ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import type { ExploreActivity } from "@/data/exploreActivities"
import { EXPLORE_CATEGORY_LABELS } from "@/data/exploreActivities"
import ActivityIcon from "@/components/patient/library/explore/ActivityIcon"
import ActivityDuration from "@/components/patient/library/explore/ActivityDuration"

interface ActivityCardProps {
  activity: ExploreActivity
  onSelect?: (activity: ExploreActivity) => void
  className?: string
  isMobileStack?: boolean
  index?: number
  isSelected?: boolean
}

function CuteCharacter({ id, className = "w-40 h-40" }: { id: string; className?: string }) {
  if (id === "breathing") {
    return (
      <motion.img
        src="https://res.cloudinary.com/dxoiluua8/image/upload/v1786528343/Breathing_qzoajg.png"
        alt="Breathing"
        className={`${className} select-none pointer-events-none object-contain`}
        animate={{ scale: [1, 1.05, 1], y: [0, -2, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    )
  }

  if (id === "grounding-54321") {
    return (
      <motion.img
        src="https://res.cloudinary.com/dxoiluua8/image/upload/v1786528343/5-4-3-2-1_Grounding_wapd0t.png"
        alt="5-4-3-2-1 Grounding"
        className={`${className} select-none pointer-events-none object-contain`}
        animate={{ y: [0, -4, 0], scale: [1, 1.02, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />
    )
  }

  if (id === "micro-movement") {
    return (
      <motion.img
        src="https://res.cloudinary.com/dxoiluua8/image/upload/v1786528345/Micro_Movement_qi4ait.png"
        alt="Micro Movement"
        className={`${className} select-none pointer-events-none object-contain`}
        animate={{ y: [0, -5, 0], scale: [1, 1.02, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    )
  }

  if (id === "progressive-muscle-relaxation") {
    return (
      <motion.img
        src="https://res.cloudinary.com/dxoiluua8/image/upload/v1786528345/Progressive_Muscle_Relaxation_y04syv.png"
        alt="Progressive Muscle Relaxation"
        className={`${className} select-none pointer-events-none object-contain`}
        animate={{ scaleX: [1, 0.98, 1.02, 1], scaleY: [1, 1.02, 0.98, 1] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />
    )
  }

  if (id === "journal-reflection") {
    return (
      <motion.img
        src="https://res.cloudinary.com/dxoiluua8/image/upload/v1786528344/Journal_Reflection_vtiez7.png"
        alt="Journal Reflection"
        className={`${className} select-none pointer-events-none object-contain`}
        animate={{ rotate: [0, -2, 2, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    )
  }

  return null
}

const ACTIVITY_CARD_COLORS = [
  "#F49865", // Soft Orange
  "#A5BBEC", // Soft Blue
  "#CEA4EC", // Soft Purple
  "#9ACDAC", // Soft Green
  "#DFD39F", // Soft Yellow
  "#F2AAAB", // Soft Red/Pink
]

function getDeterministicCardStyle(index: number) {
  const colorIndex = index % ACTIVITY_CARD_COLORS.length
  const bg = ACTIVITY_CARD_COLORS[colorIndex]

  switch (bg) {
    case "#F49865": // Soft Orange
      return {
        bg: "#F49865",
        text: "#52250c",
        labelBg: "#df7f49",
        labelText: "#ffffff",
        border: "#df7f49",
        circleBg: "#dd8251"
      }
    case "#A5BBEC": // Soft Blue
      return {
        bg: "#A5BBEC",
        text: "#132349",
        labelBg: "#8ba3db",
        labelText: "#ffffff",
        border: "#8ba3db",
        circleBg: "#8ca4da"
      }
    case "#CEA4EC": // Soft Purple
      return {
        bg: "#CEA4EC",
        text: "#3c1758",
        labelBg: "#b98cd9",
        labelText: "#ffffff",
        border: "#b98cd9",
        circleBg: "#ba8cd9"
      }
    case "#9ACDAC": // Soft Green
      return {
        bg: "#9ACDAC",
        text: "#163a23",
        labelBg: "#83ba96",
        labelText: "#ffffff",
        border: "#83ba96",
        circleBg: "#83ba96"
      }
    case "#DFD39F": // Soft Yellow
      return {
        bg: "#DFD39F",
        text: "#463f1b",
        labelBg: "#c9bc86",
        labelText: "#ffffff",
        border: "#c9bc86",
        circleBg: "#cabd85"
      }
    case "#F2AAAB": // Soft Red/Pink
      return {
        bg: "#F2AAAB",
        text: "#53181a",
        labelBg: "#db9394",
        labelText: "#ffffff",
        border: "#db9394",
        circleBg: "#db9394"
      }
    default:
      return {
        bg: "#F49865",
        text: "#52250c",
        labelBg: "#df7f49",
        labelText: "#ffffff",
        border: "#df7f49",
        circleBg: "#dd8251"
      }
  }
}

const ICON_PATHS: Record<string, string> = {
  box: "M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  wind: "M12 3c-1.5 3-4 5-4 8a4 4 0 008 0c0-3-2.5-5-4-8z M4.5 12.5c1.5-.5 3 0 4.5 1.5M19.5 12.5c-1.5-.5-3 0-4.5 1.5",
  sigh: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3",
  senses: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  move: "M13 10V3L4 14h7v7l9-11h-7z",
  scan: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  muscle: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  journal: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  moon: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z",
}

function ActivityCard({
  activity,
  onSelect,
  className = "",
  isMobileStack = false,
  index = 0,
  isSelected = false,
}: ActivityCardProps) {
  const style = getDeterministicCardStyle(index)

  if (isMobileStack) {
    return (
      <button
        type="button"
        onClick={() => onSelect?.(activity)}
        aria-label={`${activity.title}, ${activity.duration}`}
        style={{
          backgroundColor: style.bg,
          borderColor: style.border,
          color: style.text,
          transform: isSelected
            ? "perspective(800px) rotateX(0deg)"
            : "perspective(800px) rotateX(-15deg)",
          transformOrigin: "top center",
          boxShadow: isSelected
            ? `0 25px 55px ${style.border}cc, 0 20px 50px rgba(0, 0, 0, 0.18)`
            : undefined,
        }}
        className={`relative flex flex-col h-[155px] min-[360px]:h-[175px] min-[390px]:h-[200px] w-full text-left rounded-[24px] min-[360px]:rounded-[28px] min-[390px]:rounded-[32px] p-4 min-[360px]:p-5 min-[390px]:p-6 border transition-all duration-300 overflow-hidden active:shadow-[0_16px_32px_rgba(0,0,0,0.12)] ${
          isSelected
            ? "z-50"
            : "shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
        } ${className}`}
      >
        <span className="absolute inset-0 bg-white/20 opacity-0 active:opacity-100 transition-opacity duration-75 pointer-events-none rounded-[24px] min-[360px]:rounded-[28px] min-[390px]:rounded-[32px] z-20" />

        <div className="flex items-start justify-between w-full z-10">
          <span className="font-extrabold text-[16px] min-[360px]:text-[18px] min-[390px]:text-[20px] tracking-tight leading-tight min-w-0 flex-1">
            {activity.title}
          </span>
          <span 
            style={{ backgroundColor: style.labelBg, color: style.labelText }}
            className="px-2.5 py-1 min-[360px]:px-4 min-[360px]:py-1.5 rounded-full text-[10px] min-[360px]:text-[11px] min-[390px]:text-xs font-bold whitespace-nowrap shrink-0 ml-2"
          >
            {activity.duration}
          </span>
        </div>

        {/* Bottom Circle with Cute Character inside */}
        <div 
          style={{ backgroundColor: style.circleBg }}
          className="absolute left-1/2 -translate-x-1/2 rounded-full flex items-center justify-center z-0 transition-transform duration-300 w-[220px] h-[220px] -bottom-[110px] min-[360px]:w-[250px] min-[360px]:h-[250px] min-[360px]:-bottom-[125px] min-[390px]:w-[280px] min-[390px]:h-[280px] min-[390px]:-bottom-[140px]"
        >
          <div className="mb-18 -translate-y-[20px] min-[360px]:-translate-y-[24px] min-[390px]:-translate-y-[30px]">
            <CuteCharacter id={activity.id} className="w-[150px] h-[150px] min-[360px]:w-[175px] min-[360px]:h-[175px] min-[390px]:w-[195px] min-[390px]:h-[195px]" />
          </div>
        </div>
      </button>
    )
  }

  // Desktop Card Design
  return (
    <button
      type="button"
      onClick={() => onSelect?.(activity)}
      aria-label={`${activity.title}, ${activity.duration}`}
      style={{
        backgroundColor: style.bg,
        borderColor: style.border,
        color: style.text,
      }}
      className={`group relative flex flex-col h-[200px] w-full text-left rounded-[32px] p-6 shadow-[0_6px_20px_rgba(0,0,0,0.04)] border transition-all duration-300 ease-out overflow-hidden hover:scale-[1.02] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 ${className}`}
    >
      {/* Glow overlay */}
      <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-[32px] z-20" />

      {/* Title & Duration */}
      <div className="flex items-start justify-between w-full z-10 gap-3">
        <span className="font-extrabold text-[20px] tracking-tight leading-tight">
          {activity.title}
        </span>
        <span className="text-[14px] font-bold opacity-80 shrink-0">
          {activity.duration}
        </span>
      </div>

      {/* Bottom Circle with Cute Character inside */}
      <div 
        style={{ backgroundColor: style.circleBg }}
        className="absolute -bottom-[140px] left-1/2 -translate-x-1/2 w-[280px] h-[280px] rounded-full flex items-center justify-center z-0 transition-transform duration-300 group-hover:scale-105"
      >
        <div className="mb-18 -translate-y-[25px]">
          <CuteCharacter id={activity.id} className="w-[195px] h-[195px]" />
        </div>
      </div>
    </button>
  )
}

export default memo(ActivityCard)
