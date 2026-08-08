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
}

function CuteCharacter({ id }: { id: string }) {
  if (id === "breathing") {
    return (
      <motion.svg
        className="w-40 h-40 select-none pointer-events-none"
        viewBox="0 0 100 100"
        animate={{ scale: [1, 1.08, 1], y: [0, -2, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M 25,60 C 20,60 15,55 15,48 C 15,41 21,36 28,36 C 30,30 36,25 44,25 C 52,25 58,31 60,38 C 63,35 67,34 71,34 C 77,34 82,39 82,45 C 82,51 77,56 71,56"
          fill="#FFFFFF"
          stroke="#2C3A00"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M 35,43 Q 39,47 43,43" fill="none" stroke="#2C3A00" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 53,43 Q 57,47 61,43" fill="none" stroke="#2C3A00" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 46,49 Q 48,51 50,49" fill="none" stroke="#2C3A00" strokeWidth="2" strokeLinecap="round" />
        <motion.g
          animate={{ opacity: [0, 1, 0], y: [0, -8, -12], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <text x="65" y="25" fill="#2C3A00" fontSize="8" fontWeight="bold" fontFamily="sans-serif">Z</text>
        </motion.g>
        <motion.g
          animate={{ opacity: [0, 1, 0], y: [4, -4, -8], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 3, delay: 1, repeat: Infinity, ease: "easeInOut" }}
        >
          <text x="73" y="18" fill="#2C3A00" fontSize="10" fontWeight="bold" fontFamily="sans-serif">Z</text>
        </motion.g>
      </motion.svg>
    )
  }

  if (id === "grounding-54321") {
    return (
      <motion.svg
        className="w-40 h-40 select-none pointer-events-none"
        viewBox="0 0 100 100"
        animate={{ y: [0, -4, 0], rotate: [0, 2, -2, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M 50,20 C 70,45 80,60 80,72 C 80,85 66,90 50,90 C 34,90 20,85 20,72 C 20,60 30,45 50,20 Z"
          fill="#FFF0FC"
          stroke="#400030"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="40" cy="62" r="6" fill="#400030" />
        <circle cx="60" cy="62" r="6" fill="#400030" />
        <circle cx="38" cy="60" r="1.8" fill="#FFFFFF" />
        <circle cx="58" cy="60" r="1.8" fill="#FFFFFF" />
        <circle cx="32" cy="68" r="3" fill="#FFB7F1" opacity="0.8" />
        <circle cx="68" cy="68" r="3" fill="#FFB7F1" opacity="0.8" />
        <path d="M 47,69 Q 50,73 53,69" fill="none" stroke="#400030" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M 22,72 Q 16,74 20,78" fill="none" stroke="#400030" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 78,72 Q 84,74 80,78" fill="none" stroke="#400030" strokeWidth="2.5" strokeLinecap="round" />
      </motion.svg>
    )
  }

  if (id === "micro-movement") {
    return (
      <motion.svg
        className="w-40 h-40 select-none pointer-events-none"
        viewBox="0 0 100 100"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M 50,18 L 78,34 L 78,66 L 50,82 L 22,66 L 22,34 Z"
          fill="#E8FEB4"
          stroke="#001C5C"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M 38,45 Q 43,40 48,45" fill="none" stroke="#001C5C" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 52,45 Q 57,40 62,45" fill="none" stroke="#001C5C" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 47,52 Q 50,56 53,52" fill="none" stroke="#001C5C" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M 32,80 Q 50,88 68,80" fill="none" stroke="#001C5C" strokeWidth="3" strokeLinecap="round" />
        <circle cx="20" cy="50" r="4" fill="#001C5C" />
        <circle cx="80" cy="50" r="4" fill="#001C5C" />
      </motion.svg>
    )
  }

  if (id === "progressive-muscle-relaxation") {
    return (
      <motion.svg
        className="w-40 h-40 select-none pointer-events-none"
        viewBox="0 0 100 100"
        animate={{ scaleX: [1, 0.95, 1.05, 1], scaleY: [1, 1.05, 0.95, 1] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M 50,15 L 62,38 L 86,42 L 68,60 L 72,85 L 50,73 L 28,85 L 32,60 L 14,42 L 38,38 Z"
          fill="#FFF9E0"
          stroke="#403000"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M 26,45 Q 16,35 22,28" fill="none" stroke="#403000" strokeWidth="3" strokeLinecap="round" />
        <path d="M 74,45 Q 84,35 78,28" fill="none" stroke="#403000" strokeWidth="3" strokeLinecap="round" />
        <circle cx="43" cy="50" r="2.5" fill="#403000" />
        <circle cx="57" cy="50" r="2.5" fill="#403000" />
        <path d="M 46,56 Q 50,62 54,56" fill="none" stroke="#403000" strokeWidth="2.2" strokeLinecap="round" />
      </motion.svg>
    )
  }

  if (id === "journal-reflection") {
    return (
      <motion.svg
        className="w-40 h-40 select-none pointer-events-none"
        viewBox="0 0 100 100"
        animate={{ rotate: [0, -3, 3, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <rect
          x="25"
          y="22"
          width="50"
          height="58"
          rx="12"
          fill="#E6FDF9"
          stroke="#003B2C"
          strokeWidth="2.5"
        />
        <circle cx="42" cy="45" r="4.5" fill="#003B2C" />
        <circle cx="58" cy="45" r="4.5" fill="#003B2C" />
        <circle cx="40.5" cy="43.5" r="1.5" fill="#FFFFFF" />
        <circle cx="56.5" cy="43.5" r="1.5" fill="#FFFFFF" />
        <path d="M 48,53 Q 51,55 54,53" fill="none" stroke="#003B2C" strokeWidth="2" strokeLinecap="round" />
        <line x1="35" y1="62" x2="65" y2="62" stroke="#003B2C" strokeWidth="2" strokeLinecap="round" />
        <line x1="35" y1="68" x2="55" y2="68" stroke="#003B2C" strokeWidth="2" strokeLinecap="round" />
        <motion.path
          d="M 68,38 L 78,28 L 75,25 L 65,35 Z"
          fill="#FFB536"
          stroke="#003B2C"
          strokeWidth="1.8"
          animate={{ y: [0, -3, 0], x: [0, 2, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.svg>
    )
  }

  return null
}

function getMobileStackCardStyle(id: string) {
  switch (id) {
    case "breathing":
      return {
        bg: "bg-[#CBEB7A]",
        text: "text-[#2C3A00]",
        labelBg: "bg-[#B5D965]",
        labelText: "text-[#2C3A00]",
        border: "border-[#B1D560]"
      }
    case "grounding-54321":
      return {
        bg: "bg-[#F99BE0]",
        text: "text-[#400030]",
        labelBg: "bg-[#E682CD]",
        labelText: "text-[#400030]",
        border: "border-[#E178C7]"
      }
    case "micro-movement":
      return {
        bg: "bg-[#8EB0FF]",
        text: "text-[#001C5C]",
        labelBg: "bg-[#799CEF]",
        labelText: "text-[#001C5C]",
        border: "border-[#7195EA]"
      }
    case "progressive-muscle-relaxation":
      return {
        bg: "bg-[#FFD875]",
        text: "text-[#403000]",
        labelBg: "bg-[#ECB751]",
        labelText: "text-[#403000]",
        border: "border-[#E6B046]"
      }
    case "journal-reflection":
      return {
        bg: "bg-[#82EED4]",
        text: "text-[#003B2C]",
        labelBg: "bg-[#6FD8BF]",
        labelText: "text-[#003B2C]",
        border: "border-[#67D0B7]"
      }
    default:
      return {
        bg: "bg-[#CBEB7A]",
        text: "text-[#2C3A00]",
        labelBg: "bg-[#B5D965]",
        labelText: "text-[#2C3A00]",
        border: "border-[#B1D560]"
      }
  }
}

/** Reusable Explore activity card — keyboard accessible, hover elevation. */
function ActivityCard({
  activity,
  onSelect,
  className = "",
  isMobileStack = false,
}: ActivityCardProps) {
  if (isMobileStack) {
    const style = getMobileStackCardStyle(activity.id)
    return (
      <button
        type="button"
        onClick={() => onSelect?.(activity)}
        aria-label={`${activity.title}, ${activity.duration}`}
        className={`relative flex flex-col h-[200px] w-full text-left rounded-[32px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)] border ${style.bg} ${style.border} ${style.text} transition-all duration-300 overflow-hidden active:shadow-[0_16px_32px_rgba(0,0,0,0.12)]`}
      >
        {/* Glow overlay that lights up on active/press */}
        <span className="absolute inset-0 bg-white/20 opacity-0 active:opacity-100 transition-opacity duration-75 pointer-events-none rounded-[32px] z-20" />

        <div className="flex items-start justify-between w-full z-10">
          <span className="font-extrabold text-[20px] tracking-tight leading-none">
            {activity.title}
          </span>
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${style.labelBg} ${style.labelText}`}>
            {activity.duration}
          </span>
        </div>

        <div className="absolute right-0 bottom-0 z-0">
          <CuteCharacter id={activity.id} />
        </div>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onSelect?.(activity)}
      aria-label={`${activity.title}, ${activity.duration}, ${EXPLORE_CATEGORY_LABELS[activity.category]}`}
      className={`group relative flex flex-col h-full w-full text-left rounded-[22px] bg-white border border-slate-100/90 p-4 sm:p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)] transition-all duration-300 ease-out cursor-pointer hover:scale-[1.02] hover:shadow-[0_14px_32px_rgba(15,23,42,0.09)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 motion-reduce:hover:scale-100 ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <ActivityIcon icon={activity.icon} category={activity.category} />
        <ChevronRight
          className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0 mt-1"
          aria-hidden
        />
      </div>

      <h4 className="font-bold text-[15px] sm:text-[16px] text-slate-800 tracking-tight leading-snug mb-1.5">
        {activity.title}
      </h4>

      <div className="flex flex-wrap items-center gap-2 mt-auto pt-1">
        <ActivityDuration duration={activity.duration} />
      </div>
    </button>
  )
}

export default memo(ActivityCard)

