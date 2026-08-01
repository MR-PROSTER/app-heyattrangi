"use client"

import dynamic from "next/dynamic"
import type { ExploreActivity } from "@/data/exploreActivities"
import { resolveActivityEngine } from "@/data/activities"
import { getBreathingConfig } from "@/data/activities/breathingConfigs"
import { getGroundingConfig } from "@/data/activities/groundingConfigs"
import { getRelaxationConfig } from "@/data/activities/relaxationConfigs"
import { getJournalConfig } from "@/data/activities/journalConfigs"
import { getSleepConfig } from "@/data/activities/sleepConfigs"
import ActivitySessionPlaceholder from "@/components/patient/library/explore/session/ActivitySessionPlaceholder"

const BreathingEngine = dynamic(
  () => import("@/components/patient/library/explore/engines/BreathingEngine"),
  { ssr: false }
)
const GroundingEngine = dynamic(
  () => import("@/components/patient/library/explore/engines/GroundingEngine"),
  { ssr: false }
)
const RelaxationEngine = dynamic(
  () => import("@/components/patient/library/explore/engines/RelaxationEngine"),
  { ssr: false }
)
const JournalEngine = dynamic(
  () => import("@/components/patient/library/explore/engines/JournalEngine"),
  { ssr: false }
)
const SleepEngine = dynamic(
  () => import("@/components/patient/library/explore/engines/SleepEngine"),
  { ssr: false }
)

interface ActivityRendererProps {
  activity: ExploreActivity
  isPaused: boolean
}

/**
 * Routes an activity into the correct guided engine (lazy-loaded).
 */
export default function ActivityRenderer({
  activity,
  isPaused,
}: ActivityRendererProps) {
  const engine = resolveActivityEngine(activity.slug, activity.category)

  switch (engine) {
    case "breathing": {
      const config = getBreathingConfig(activity.slug)
      if (!config) break
      return <BreathingEngine config={config} isPaused={isPaused} />
    }
    case "grounding": {
      const config = getGroundingConfig(activity.slug)
      if (!config) break
      return <GroundingEngine config={config} isPaused={isPaused} />
    }
    case "relaxation": {
      const config = getRelaxationConfig(activity.slug)
      if (!config) break
      return <RelaxationEngine config={config} isPaused={isPaused} />
    }
    case "journaling": {
      const config = getJournalConfig(activity.slug)
      if (!config) break
      return <JournalEngine config={config} isPaused={isPaused} />
    }
    case "sleep": {
      const config = getSleepConfig(activity.slug)
      if (!config) break
      return <SleepEngine config={config} isPaused={isPaused} />
    }
  }

  return (
    <ActivitySessionPlaceholder
      activityName={activity.title}
      isPaused={isPaused}
    />
  )
}
