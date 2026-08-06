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
import GroundingExercise from "@/features/activities/components/GroundingExercise"
import BellyBreathing from "@/features/activities/components/BellyBreathing"
import FourSevenEightBreathing from "@/features/activities/components/FourSevenEightBreathing"

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
      return <FourSevenEightBreathing onBack={onExit} onDone={onDone} />
    case "belly-breathing":
      return <BellyBreathing onBack={onExit} onDone={onDone} />
    case "physiological-sigh":
      return <PhysiologicalSighExperience {...shared} />
    case "grounding-54321":
      return <GroundingExercise onExit={onExit} onDone={onDone} />

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
