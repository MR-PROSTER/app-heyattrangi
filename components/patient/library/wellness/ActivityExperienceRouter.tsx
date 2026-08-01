"use client"

import type { WellnessActivity, WellnessCategoryColor } from "@/lib/data/wellnessActivities"
import {
  BellyBreathingExperience,
  BoxBreathingExperience,
  Breathing478Experience,
  PhysiologicalSighExperience,
} from "./BreathingExperiences"
import {
  CategoryNamingExperience,
  Grounding54321Experience,
  ObjectFocusExperience,
} from "./GroundingExperiences"
import {
  BodyScanExperience,
  MicroMovementExperience,
  ProgressiveMuscleExperience,
} from "./RelaxationExperiences"
import {
  GuidedSleepExperience,
  OpenReflectionExperience,
  PromptedReflectionExperience,
  WindDownExperience,
} from "./JournalSleepExperiences"

interface ActivityExperienceRouterProps {
  activity: WellnessActivity
  color: WellnessCategoryColor
  onExit: () => void
  onDone: () => void
}

export default function ActivityExperienceRouter({
  activity,
  color,
  onExit,
  onDone,
}: ActivityExperienceRouterProps) {
  const shared = {
    activityId: activity.id,
    title: activity.title,
    estimatedDuration: activity.estimatedDuration,
    color,
    onExit,
    onDone,
  }

  switch (activity.slug) {
    case "box-breathing":
      return <BoxBreathingExperience {...shared} />
    case "breathing-4-7-8":
      return <Breathing478Experience {...shared} />
    case "belly-breathing":
      return <BellyBreathingExperience {...shared} />
    case "physiological-sigh":
      return <PhysiologicalSighExperience {...shared} />
    case "grounding-54321":
      return <Grounding54321Experience {...shared} />
    case "category-naming":
      return <CategoryNamingExperience {...shared} />
    case "object-focus":
      return <ObjectFocusExperience {...shared} />
    case "pmr":
      return <ProgressiveMuscleExperience {...shared} />
    case "body-scan":
      return <BodyScanExperience {...shared} />
    case "micro-movement":
      return <MicroMovementExperience {...shared} />
    case "open-reflection":
      return <OpenReflectionExperience {...shared} />
    case "prompted-reflection":
      return <PromptedReflectionExperience {...shared} />
    case "sleep-wind-down":
      return <WindDownExperience {...shared} />
    case "sleep-audio":
      return <GuidedSleepExperience {...shared} />
    default:
      return <ObjectFocusExperience {...shared} />
  }
}
