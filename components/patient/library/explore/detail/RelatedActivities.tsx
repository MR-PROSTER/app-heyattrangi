"use client"

import { motion } from "framer-motion"
import type { ExploreActivity } from "@/data/exploreActivities"
import ActivityCard from "@/components/patient/library/explore/ActivityCard"

interface RelatedActivitiesProps {
  activities: ExploreActivity[]
  onSelectActivity: (activity: ExploreActivity) => void
}

export default function RelatedActivities({
  activities,
  onSelectActivity,
}: RelatedActivitiesProps) {
  if (activities.length === 0) return null

  return (
    <section aria-labelledby="related-activities-heading" className="space-y-4">
      <h2
        id="related-activities-heading"
        className="text-[13px] font-bold uppercase tracking-widest text-slate-400"
      >
        Related activities
      </h2>
      <div className="flex gap-3 sm:gap-3.5 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar snap-x">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            className="snap-start shrink-0 w-[260px] sm:w-[280px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              delay: 0.08 * index,
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
      </div>
    </section>
  )
}
