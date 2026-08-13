"use client"

import { memo, useState, useEffect } from "react"
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
  const [activeCardId, setActiveCardId] = useState<string | null>(null)

  // Reset selected state only when component unmounts
  useEffect(() => {
    return () => {
      setActiveCardId(null)
    }
  }, [])

  const handleCardSelect = (activity: ExploreActivity) => {
    setActiveCardId(activity.id)
    setTimeout(() => {
      onSelectActivity?.(activity)
    }, 480)
  }

  return (
    <>
      {/* Mobile view: Overlapping 3D card deck list */}
      <div className="flex md:hidden flex-col -space-y-[32px] min-[360px]:-space-y-[38px] min-[390px]:-space-y-[45px] pt-4 pb-20">
        {activities.map((activity, index) => {
          const isSelected = activeCardId === activity.id
          const isAnySelected = activeCardId !== null
          const isOthersSelected = isAnySelected && !isSelected

          return (
            <motion.div
              key={activity.id}
              style={{ zIndex: isSelected ? 500 : index + 1 }}
              animate={
                isSelected
                  ? { y: -65, scale: 1.05, opacity: 1 }
                  : isOthersSelected
                    ? { y: 15, scale: 0.95, opacity: 0.1 }
                    : { y: 0, scale: 1, opacity: 1 }
              }
              whileHover={activeCardId ? undefined : (reduced ? undefined : { y: -16, scale: 1.02, zIndex: 50 })}
              whileTap={activeCardId ? undefined : (reduced ? undefined : { y: -24, scale: 0.97, zIndex: 100 })}
              transition={{
                type: "tween",
                duration: isSelected ? 0.45 : 0.25,
                ease: isSelected ? [0.25, 1, 0.5, 1] : "easeOut",
              }}
              className="w-full relative cursor-pointer"
            >
              <ActivityCard
                activity={activity}
                onSelect={handleCardSelect}
                isMobileStack
                index={index}
                isSelected={isSelected}
                className={isSelected ? "pointer-events-none" : ""}
              />
            </motion.div>
          )
        })}
      </div>

      {/* Desktop view: Standard Grid */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        <AnimatePresence mode="popLayout">
          {activities.map((activity, index) => {
            const isSelected = activeCardId === activity.id
            const isAnySelected = activeCardId !== null
            const isOthersSelected = isAnySelected && !isSelected

            return (
              <motion.div
                key={activity.id}
                style={{ zIndex: isSelected ? 500 : 1 }}
                layout={!reduced}
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={
                  isSelected
                    ? { y: -30, scale: 1.05, opacity: 1 }
                    : isOthersSelected
                      ? { y: 0, scale: 0.95, opacity: 0.1 }
                      : { opacity: 1, y: 0, scale: 1 }
                }
                exit={reduced ? undefined : { opacity: 0, y: 8, scale: 0.98 }}
                transition={{
                  type: "tween",
                  duration: isSelected ? 0.45 : 0.28,
                  ease: [0.25, 1, 0.5, 1],
                }}
              >
                <ActivityCard
                  activity={activity}
                  onSelect={handleCardSelect}
                  index={index}
                  isSelected={isSelected}
                  className={isSelected ? "pointer-events-none" : ""}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </>
  )
}

export default memo(ActivityGrid)
