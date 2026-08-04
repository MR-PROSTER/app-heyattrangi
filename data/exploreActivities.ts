export type ExploreActivityCategory =
  | "breathing"
  | "grounding"
  | "relaxation"
  | "journaling"
  | "sleep"

export type ExploreActivityIcon =
  | "box"
  | "clock"
  | "wind"
  | "sigh"
  | "senses"
  | "move"
  | "scan"
  | "muscle"
  | "journal"
  | "moon"

export type ExploreActivityDifficulty = "Beginner" | "Gentle" | "Intermediate"

export type ExploreActivityAudio = "Yes" | "No" | "Optional"

export interface ExploreActivity {
  id: string
  title: string
  slug: string
  category: ExploreActivityCategory
  duration: string
  description: string
  longDescription: string
  icon: ExploreActivityIcon
  recommended: boolean
  difficulty: ExploreActivityDifficulty
  audio: ExploreActivityAudio
  type: string
}

export const EXPLORE_ACTIVITIES: ExploreActivity[] = [
  {
    id: "breathing",
    title: "Breathing",
    slug: "breathing",
    category: "breathing",
    duration: "1–5 min",
    description:
      "Choose a pattern — Box, 4-7-8, belly, or a quick sigh — and follow along.",
    longDescription:
      "One quiet place for guided breathing. Pick the pattern that fits the moment, choose how long you’d like, and follow at your own pace.",
    icon: "box",
    recommended: true,
    difficulty: "Beginner",
    audio: "Optional",
    type: "Guided breathing",
  },
  {
    id: "grounding-54321",
    title: "5-4-3-2-1 Grounding",
    slug: "5-4-3-2-1-grounding",
    category: "grounding",
    duration: "4 min",
    description: "Name what you see, touch, hear, smell, and taste.",
    longDescription:
      "A gentle sensory check-in that invites you to notice what is around you right now. Move through each sense at your own pace, without needing to get anything perfect.",
    icon: "senses",
    recommended: true,
    difficulty: "Beginner",
    audio: "Optional",
    type: "Sensory grounding",
  },
  {
    id: "micro-movement",
    title: "Micro Movement",
    slug: "micro-movement",
    category: "grounding",
    duration: "3 min",
    description: "Tiny, gentle movements to reconnect with your body.",
    longDescription:
      "Small, easy movements you can do almost anywhere. A way to reconnect with your body through soft stretches and shifts, without strain or pressure.",
    icon: "move",
    recommended: false,
    difficulty: "Gentle",
    audio: "No",
    type: "Body awareness",
  },
  {
    id: "body-scan",
    title: "Body Scan",
    slug: "body-scan",
    category: "relaxation",
    duration: "5 min",
    description: "Bring soft attention through your body, part by part.",
    longDescription:
      "A quiet walk of attention through your body, one area at a time. Notice whatever you find — tension, ease, or nothing much — and keep moving with kindness.",
    icon: "scan",
    recommended: false,
    difficulty: "Beginner",
    audio: "Optional",
    type: "Guided relaxation",
  },
  {
    id: "progressive-muscle-relaxation",
    title: "Progressive Muscle Relaxation",
    slug: "progressive-muscle-relaxation",
    category: "relaxation",
    duration: "6 min",
    description: "Tense and release muscle groups to invite ease.",
    longDescription:
      "Gently tense and release different muscle groups. The contrast can help you notice where you are holding on, and give those areas a chance to soften.",
    icon: "muscle",
    recommended: false,
    difficulty: "Intermediate",
    audio: "Optional",
    type: "Guided relaxation",
  },
  {
    id: "journal-reflection",
    title: "Journal Reflection",
    slug: "journal-reflection",
    category: "journaling",
    duration: "5 min",
    description: "A quiet prompt to write whatever is on your mind.",
    longDescription:
      "A short writing space with a simple prompt. You can jot a few lines or more — whatever feels useful. There is no need for polish or a particular outcome.",
    icon: "journal",
    recommended: false,
    difficulty: "Beginner",
    audio: "No",
    type: "Reflection",
  },
  {
    id: "sleep-wind-down",
    title: "Sleep Wind Down",
    slug: "sleep-wind-down",
    category: "sleep",
    duration: "5 min",
    description: "A gentle wind-down routine you can try before rest.",
    longDescription:
      "A calm wind-down you can try before rest. Soft breathing and quiet attention to help your body settle into a slower evening rhythm, without forcing sleep.",
    icon: "moon",
    recommended: false,
    difficulty: "Gentle",
    audio: "Optional",
    type: "Wind-down",
  },
]

export const EXPLORE_CATEGORY_LABELS: Record<ExploreActivityCategory, string> = {
  breathing: "Breathing",
  grounding: "Grounding",
  relaxation: "Relaxation",
  journaling: "Journaling",
  sleep: "Sleep",
}

export function filterExploreActivities(
  category: "all" | ExploreActivityCategory
): ExploreActivity[] {
  if (category === "all") return EXPLORE_ACTIVITIES
  return EXPLORE_ACTIVITIES.filter((a) => a.category === category)
}

export function getExploreActivityBySlug(
  slug: string
): ExploreActivity | undefined {
  return EXPLORE_ACTIVITIES.find((a) => a.slug === slug)
}

export function getRelatedExploreActivities(
  activity: ExploreActivity,
  limit = 3
): ExploreActivity[] {
  return EXPLORE_ACTIVITIES.filter(
    (a) => a.category === activity.category && a.id !== activity.id
  ).slice(0, limit)
}
