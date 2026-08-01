/**
 * Presentation metadata for wellness UI (icons / category chrome).
 * Activity content lives in the database — this file is display-only.
 */

export type WellnessCategoryId =
  | "breathing"
  | "grounding"
  | "relaxation"
  | "journaling"
  | "sleep"

export type WellnessCategoryColor =
  | "teal"
  | "green"
  | "purple"
  | "orange"
  | "indigo"

export interface WellnessCategoryMeta {
  id: WellnessCategoryId
  title: string
  description: string
  color: WellnessCategoryColor
  iconPath: string
}

/** Client-facing activity shape used by existing UI components. */
export interface WellnessActivity {
  id: string
  slug: string
  categoryId: WellnessCategoryId
  title: string
  shortDescription: string
  estimatedDuration: string
  benefits: string
  instructions: string[]
  iconPath: string
  audioUrl?: string | null
  displayOrder?: number
  phase?: number
  isAvailable?: boolean
}

export const WELLNESS_CATEGORIES: WellnessCategoryMeta[] = [
  {
    id: "breathing",
    title: "Breathing",
    description: "Slow, guided breath patterns that might help you settle.",
    color: "teal",
    iconPath:
      "M12 3c-1.5 3-4 5-4 8a4 4 0 008 0c0-3-2.5-5-4-8z M4.5 12.5c1.5-.5 3 0 4.5 1.5M19.5 12.5c-1.5-.5-3 0-4.5 1.5 M8 18.5c1.2.8 2.5 1.5 4 1.5s2.8-.7 4-1.5",
  },
  {
    id: "grounding",
    title: "Grounding",
    description: "Simple sensory check-ins to reconnect with the present moment.",
    color: "green",
    iconPath:
      "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    id: "relaxation",
    title: "Relaxation",
    description: "Gentle body-based practices for release and ease.",
    color: "purple",
    iconPath:
      "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  },
  {
    id: "journaling",
    title: "Journaling",
    description: "Quiet space to write whatever is on your mind.",
    color: "orange",
    iconPath:
      "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  },
  {
    id: "sleep",
    title: "Sleep",
    description: "Wind-down routines you can try before rest.",
    color: "indigo",
    iconPath:
      "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z",
  },
]

/** Icon paths keyed by slug — preserves UI icons without storing in DB content model. */
export const WELLNESS_ACTIVITY_ICONS: Record<string, string> = {
  "box-breathing":
    "M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z",
  "breathing-4-7-8": "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  "belly-breathing":
    "M12 3c-1.5 3-4 5-4 8a4 4 0 008 0c0-3-2.5-5-4-8z M9.5 16.5c.5 1.5 1.5 2.5 2.5 3.5 1-1 2-2 2.5-3.5",
  "physiological-sigh":
    "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3",
  "grounding-54321":
    "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  "category-naming": "M4 6h16M4 10h16M4 14h10M4 18h8",
  "object-focus": "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  pmr: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  "body-scan": "M13 10V3L4 14h7v7l9-11h-7z",
  "micro-movement":
    "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  "open-reflection":
    "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  "prompted-reflection":
    "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
  "sleep-wind-down":
    "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z",
  "sleep-audio":
    "M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z",
}

export function getCategoryById(
  categoryId: WellnessCategoryId
): WellnessCategoryMeta | undefined {
  return WELLNESS_CATEGORIES.find((c) => c.id === categoryId)
}

export function getActivityIconPath(slug: string): string {
  return (
    WELLNESS_ACTIVITY_ICONS[slug] ??
    "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
  )
}
