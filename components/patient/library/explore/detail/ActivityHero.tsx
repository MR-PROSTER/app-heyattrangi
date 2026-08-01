"use client"

import { motion } from "framer-motion"
import type { ExploreActivity } from "@/data/exploreActivities"
import { EXPLORE_CATEGORY_LABELS } from "@/data/exploreActivities"
import ActivityIcon from "@/components/patient/library/explore/ActivityIcon"
import ActivityBadge from "@/components/patient/library/explore/ActivityBadge"
import ActivityDuration from "@/components/patient/library/explore/ActivityDuration"

interface ActivityHeroProps {
  activity: ExploreActivity
}

export default function ActivityHero({ activity }: ActivityHeroProps) {
  return (
    <header className="flex flex-col items-start gap-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="shadow-[0_18px_40px_rgba(15,23,42,0.08)] rounded-[28px]"
      >
        <ActivityIcon
          icon={activity.icon}
          category={activity.category}
          size="lg"
        />
      </motion.div>

      <div className="flex flex-wrap items-center gap-2">
        <ActivityBadge label={EXPLORE_CATEGORY_LABELS[activity.category]} />
        <ActivityDuration duration={activity.duration} />
      </div>

      <div className="space-y-2 max-w-xl">
        <h1
          id={`activity-title-${activity.id}`}
          className="font-extrabold text-[26px] md:text-[32px] text-slate-800 tracking-tight leading-tight"
        >
          {activity.title}
        </h1>
        <p className="text-slate-500 font-medium text-sm md:text-[15px] leading-relaxed">
          {activity.description}
        </p>
      </div>
    </header>
  )
}
