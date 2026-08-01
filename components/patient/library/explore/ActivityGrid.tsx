"use client"

import { memo } from "react"
import { AnimatePresence, motion } from "framer-motion"
import type { ExploreActivity } from "@/data/exploreActivities"
import ActivityCard from "@/components/patient/library/explore/ActivityCard"
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"

interface ActivityGridProps {
  activities: ExploreActivity[]
  onSelectActivity?: (activity: ExploreActivity) => void
}

/**
 * Responsive activity card grid with filter-aware enter/exit animation.
 */
function ActivityGrid({ activities, onSelectActivity }: ActivityGridProps) {
  const reduced = usePrefersReducedMotion()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
      <AnimatePresence mode="popLayout">
        {activities.map((activity) => (
          <motion.div
            key={activity.id}
            layout={!reduced}
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: 8, scale: 0.98 }}
            transition={{
              duration: reduced ? 0.01 : 0.28,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <ActivityCard
              activity={activity}
              onSelect={onSelectActivity}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default memo(ActivityGrid)
