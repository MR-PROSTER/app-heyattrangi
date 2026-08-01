import type { ExploreActivityCategory } from "@/data/exploreActivities"
import { getBreathingConfig } from "@/data/activities/breathingConfigs"
import { getGroundingConfig } from "@/data/activities/groundingConfigs"
import { getRelaxationConfig } from "@/data/activities/relaxationConfigs"
import { getJournalConfig } from "@/data/activities/journalConfigs"
import { getSleepConfig } from "@/data/activities/sleepConfigs"

export type ActivityEngineKind =
  | "breathing"
  | "grounding"
  | "relaxation"
  | "journaling"
  | "sleep"

export function resolveActivityEngine(
  slug: string,
  category: ExploreActivityCategory
): ActivityEngineKind {
  if (getBreathingConfig(slug)) return "breathing"
  if (getGroundingConfig(slug)) return "grounding"
  if (getRelaxationConfig(slug)) return "relaxation"
  if (getJournalConfig(slug)) return "journaling"
  if (getSleepConfig(slug)) return "sleep"
  return category
}
