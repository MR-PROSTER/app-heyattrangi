"use client"

import { memo } from "react"
import { ChevronRight } from "lucide-react"
import type { ExploreActivity } from "@/data/exploreActivities"
import { EXPLORE_CATEGORY_LABELS } from "@/data/exploreActivities"
import ActivityIcon from "@/components/patient/library/explore/ActivityIcon"
import ActivityDuration from "@/components/patient/library/explore/ActivityDuration"

interface ActivityCardProps {
  activity: ExploreActivity
  onSelect?: (activity: ExploreActivity) => void
  className?: string
}

/** Reusable Explore activity card — keyboard accessible, hover elevation. */
function ActivityCard({
  activity,
  onSelect,
  className = "",
}: ActivityCardProps) {
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
      <p className="text-slate-500 text-sm font-medium leading-relaxed mb-4 line-clamp-2 flex-grow">
        {activity.description}
      </p>

      <div className="flex flex-wrap items-center gap-2 mt-auto pt-1">
        <ActivityDuration duration={activity.duration} />
      </div>
    </button>
  )
}

export default memo(ActivityCard)
