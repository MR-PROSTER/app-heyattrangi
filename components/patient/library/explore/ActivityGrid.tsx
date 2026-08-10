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
    <>
      {/* Mobile view: Overlapping 3D card deck list */}
      <div className="flex md:hidden flex-col -space-y-8 pt-4 pb-20">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            style={{ zIndex: index + 1 }}
            whileHover={reduced ? undefined : { y: -16, scale: 1.02, zIndex: 50 }}
            whileTap={reduced ? undefined : { y: -24, scale: 0.97, zIndex: 100 }}
            transition={{ type: "spring", stiffness: 350, damping: 20 }}
            className="w-full relative cursor-pointer"
          >
            <ActivityCard
              activity={activity}
              onSelect={onSelectActivity}
              isMobileStack
              index={index}
            />
          </motion.div>
        ))}
      </div>

      {/* Desktop view: Standard Grid */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        <AnimatePresence mode="popLayout">
          {activities.map((activity, index) => (
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
                index={index}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}

export default memo(ActivityGrid)
