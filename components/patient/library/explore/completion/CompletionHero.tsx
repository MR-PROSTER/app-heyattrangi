"use client"

import { motion } from "framer-motion"
import type { ExploreActivity } from "@/data/exploreActivities"
import ActivityIcon from "@/components/patient/library/explore/ActivityIcon"
import { formatElapsed } from "@/components/patient/library/explore/session/SessionState"

interface CompletionHeroProps {
  activity: ExploreActivity
  elapsedMs: number
}

export default function CompletionHero({
  activity,
  elapsedMs,
}: CompletionHeroProps) {
  return (
    <div className="flex flex-col items-center text-center gap-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.86 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
        aria-hidden
      >
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100/80 shadow-[0_12px_36px_rgba(249,115,22,0.12)] flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white border border-orange-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
      </motion.div>

      <ActivityIcon
        icon={activity.icon}
        category={activity.category}
        size="md"
      />

      <div className="space-y-1.5">
        <h1 className="font-extrabold text-2xl sm:text-[28px] text-slate-800 tracking-tight">
          {activity.title}
        </h1>
        <p className="text-slate-500 font-medium text-sm tabular-nums">
          Duration completed · {formatElapsed(elapsedMs)}
        </p>
      </div>
    </div>
  )
}
