"use client"

import type { ExploreActivity } from "@/data/exploreActivities"
import ExploreSectionHeader from "@/components/patient/library/explore/ExploreSectionHeader"
import ActivityCard from "@/components/patient/library/explore/ActivityCard"

interface RecommendedSectionProps {
  activities: ExploreActivity[]
  onSelectActivity?: (activity: ExploreActivity) => void
}

export default function RecommendedSection({
  activities,
  onSelectActivity,
}: RecommendedSectionProps) {
  if (activities.length === 0) return null

  return (
    <section aria-labelledby="recommended-heading">
      <ExploreSectionHeader title="Recommended for you" />
      <div className="flex gap-3 sm:gap-3.5 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar snap-x">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="snap-start shrink-0 w-[260px] sm:w-[280px]"
          >
            <ActivityCard
              activity={activity}
              onSelect={onSelectActivity}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
