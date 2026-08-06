import type { Activity } from "../types"
import { BOX_PATTERN } from "../types"
import { PATTERN_478, PATTERN_BELLY, PATTERN_SIGH } from "./patterns"

/**
 * Typed registry of Explore activities.
 * Box Breathing and 4-7-8 are interactive; others show a calm “coming soon”.
 */
export const ACTIVITIES: readonly Activity[] = [
  {
    id: "breathing",
    title: "Breathing",
    slug: "breathing",
    category: "breathing",
    durationLabel: "1–5 min",
    description:
      "Choose a pattern — Box, 4-7-8, belly, or a quick sigh — and follow along.",
    longDescription:
      "One quiet place for guided breathing. Pick the pattern that fits the moment, choose how long you’d like, and follow at your own pace.",
    icon: "box",
    kind: "breathing",
    defaultCycles: 8,
  },
  {
    id: "box-breathing",
    title: "Box Breathing",
    slug: "box-breathing",
    category: "breathing",
    durationLabel: "2 min",
    description: "Slow guided breathing to help regulate your breath.",
    longDescription:
      "A steady four-count breathing rhythm that you can return to whenever things feel overwhelming. Take each breath slowly and allow yourself to settle into the pace.",
    icon: "box",
    kind: "box-breathing",
    pattern: BOX_PATTERN,
    defaultCycles: 8,
  },
  {
    id: "breathing-4-7-8",
    title: "4-7-8 Breathing",
    slug: "breathing-4-7-8",
    category: "breathing",
    durationLabel: "3 min",
    description: "A longer exhale pattern that might help you unwind.",
    longDescription:
      "A simple inhale, hold, and longer exhale pattern you can try when you want a quieter moment. Move through each count at a pace that feels comfortable for you.",
    icon: "clock",
    kind: "four-seven-eight",
    pattern: PATTERN_478,
    defaultCycles: 9,
  },
  {
    id: "belly-breathing",
    title: "Belly Breathing",
    slug: "belly-breathing",
    category: "breathing",
    durationLabel: "3 min",
    description: "Simple diaphragmatic breaths — a gentle first practice.",
    longDescription:
      "A soft way to notice your breath as it moves through your belly. There is no right depth or speed — just a few calm breaths whenever you need a pause.",
    icon: "wind",
    kind: "breathing",
    pattern: PATTERN_BELLY,
    defaultCycles: 18,
  },
  {
    id: "physiological-sigh",
    title: "Physiological Sigh",
    slug: "physiological-sigh",
    category: "breathing",
    durationLabel: "<1 min",
    description: "A quick double inhale and long exhale when you need a reset.",
    longDescription:
      "A brief double inhale followed by a long, easy exhale. You can use it once or a few times when you want a small reset in the middle of your day.",
    icon: "sigh",
    kind: "breathing",
    pattern: PATTERN_SIGH,
    defaultCycles: 5,
  },
  {
    id: "grounding-54321",
    title: "5-4-3-2-1 Grounding",
    slug: "5-4-3-2-1-grounding",
    category: "grounding",
    durationLabel: "4 min",
    description: "Name what you see, touch, hear, smell, and taste.",
    longDescription:
      "A gentle sensory check-in that invites you to notice what is around you right now. Move through each sense at your own pace, without needing to get anything perfect.",
    icon: "senses",
    kind: "grounding",
  },
  {
    id: "micro-movement",
    title: "Micro Movement",
    slug: "micro-movement",
    category: "grounding",
    durationLabel: "3 min",
    description: "Tiny, gentle movements to reconnect with your body.",
    longDescription:
      "Eight tiny movements — small enough for a desk, a passenger seat, or lying in bed. Attention travels through the body. Every step has a gentler and imagined option.",
    icon: "move",
    kind: "micro-movement",
  },
  /*
  {
    id: "body-scan",
    title: "Body Scan",
    slug: "body-scan",
    category: "relaxation",
    durationLabel: "5 min",
    description: "Bring soft attention through your body, part by part.",
    longDescription:
      "A quiet walk of attention through your body, feet to head. Notice whatever you find — warmth, pressure, or nothing at all — without needing to change it.",
    icon: "scan",
    kind: "body-scan",
  },
  */
  {
    id: "progressive-muscle-relaxation",
    title: "Progressive Muscle Relaxation",
    slug: "progressive-muscle-relaxation",
    category: "relaxation",
    durationLabel: "6 min",
    description: "Tense and release muscle groups to invite ease.",
    longDescription:
      "Gently tense and release different muscle groups. The contrast can help you notice where you are holding on, and give those areas a chance to soften.",
    icon: "muscle",
    kind: "progressive-muscle-relaxation",
  },
  {
    id: "journal-reflection",
    title: "Journal Reflection",
    slug: "journal-reflection",
    category: "journaling",
    durationLabel: "5 min",
    description: "A quiet prompt to write whatever is on your mind.",
    longDescription:
      "A short writing space with a simple prompt. You can jot a few lines or more — whatever feels useful. There is no need for polish or a particular outcome.",
    icon: "journal",
    kind: "journal-reflection",
  },
  /*
  {
    id: "sleep-wind-down",
    title: "Sleep Wind Down",
    slug: "sleep-wind-down",
    category: "sleep",
    durationLabel: "5 min",
    description: "A gentle wind-down routine you can try before rest.",
    longDescription:
      "A calm wind-down you can try before rest. Soft breathing and quiet attention to help your body settle into a slower evening rhythm, without forcing sleep.",
    icon: "moon",
    kind: "coming-soon",
  },
  */
] as const

export function getActivityBySlug(slug: string): Activity | undefined {
  return ACTIVITIES.find((a) => a.slug === slug)
}

/** Duration presets: label → cycle count (box 4-4-4-4 = 16s/cycle) */
export const DURATION_PRESETS = [
  { label: "1 min", cycles: 4 },
  { label: "2 min", cycles: 8 },
  { label: "5 min", cycles: 19 },
] as const
