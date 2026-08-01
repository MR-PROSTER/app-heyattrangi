export type WellnessCategoryId =
  | "breathing"
  | "grounding"
  | "relaxation"
  | "journaling"
  | "sleep"

export type ActivityDifficulty = "Beginner" | "Intermediate" | "Advanced"

export type WellnessCategoryColor =
  | "teal"
  | "green"
  | "purple"
  | "orange"
  | "indigo"

export interface WellnessActivity {
  id: string
  slug: string
  categoryId: WellnessCategoryId
  title: string
  shortDescription: string
  /** Display duration, e.g. "2 min" */
  estimatedDuration: string
  /** One-paragraph "what this activity helps with" copy */
  benefits: string
  /** Ordered step-by-step instructions */
  instructions: string[]
  /** Beginner | Intermediate | Advanced */
  difficulty: ActivityDifficulty
  iconPath: string
}

export interface WellnessCategoryMeta {
  id: WellnessCategoryId
  title: string
  description: string
  color: WellnessCategoryColor
  iconPath: string
}

/** Temporary local catalog — replace with API response in a later phase. */
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

export const WELLNESS_ACTIVITIES: WellnessActivity[] = [
  {
    id: "box-breathing",
    slug: "box-breathing",
    categoryId: "breathing",
    title: "Box Breathing",
    shortDescription: "Slow guided breathing to help regulate your breath.",
    estimatedDuration: "2 min",
    difficulty: "Beginner",
    benefits:
      "This even, four-part rhythm might help slow your pace and give your mind something steady to follow when things feel busy.",
    instructions: [
      "Inhale slowly for 4 seconds.",
      "Hold for 4 seconds.",
      "Exhale for 4 seconds.",
      "Hold again for 4 seconds.",
      "Repeat the cycle for about 2 minutes, or as long as it feels comfortable.",
    ],
    iconPath:
      "M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z",
  },
  {
    id: "breathing-4-7-8",
    slug: "breathing-4-7-8",
    categoryId: "breathing",
    title: "4-7-8 Breathing",
    shortDescription: "A longer exhale pattern that might help you unwind.",
    estimatedDuration: "3 min",
    difficulty: "Intermediate",
    benefits:
      "A longer exhale can feel soothing after a full day. This pattern gives structure if you want a calm breath practice without overthinking it.",
    instructions: [
      "Inhale quietly through your nose for 4 seconds.",
      "Hold your breath gently for 7 seconds.",
      "Exhale slowly through your mouth for 8 seconds.",
      "Repeat for several cycles, aiming for about 3 minutes.",
    ],
    iconPath: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    id: "belly-breathing",
    slug: "belly-breathing",
    categoryId: "breathing",
    title: "Belly Breathing",
    shortDescription: "Simple diaphragmatic breaths — a gentle first practice.",
    estimatedDuration: "3 min",
    difficulty: "Beginner",
    benefits:
      "Belly breathing is a simple way to notice your breath without adding pressure. It can feel grounding if shorter, faster breathing has taken over.",
    instructions: [
      "Sit or lie down somewhere comfortable.",
      "Place one hand lightly on your belly.",
      "Inhale through your nose and feel your belly rise.",
      "Exhale slowly through your mouth and feel your belly fall.",
      "Continue for about 3 minutes at an easy pace.",
    ],
    iconPath:
      "M12 3c-1.5 3-4 5-4 8a4 4 0 008 0c0-3-2.5-5-4-8z M9.5 16.5c.5 1.5 1.5 2.5 2.5 3.5 1-1 2-2 2.5-3.5",
  },
  {
    id: "physiological-sigh",
    slug: "physiological-sigh",
    categoryId: "breathing",
    title: "Physiological Sigh",
    shortDescription: "A quick double inhale and long exhale when you need a reset.",
    estimatedDuration: "<1 min",
    difficulty: "Beginner",
    benefits:
      "This short pattern is easy to try once or twice when you want a quick way to release tension — no long session required.",
    instructions: [
      "Take a full inhale through your nose.",
      "Add a second, shorter inhale on top of the first.",
      "Exhale slowly and fully through your mouth.",
      "Repeat 1–3 times if it feels helpful.",
    ],
    iconPath:
      "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3",
  },
  {
    id: "grounding-54321",
    slug: "grounding-54321",
    categoryId: "grounding",
    title: "5-4-3-2-1 Senses",
    shortDescription: "Name what you see, touch, hear, smell, and taste.",
    estimatedDuration: "3–4 min",
    difficulty: "Beginner",
    benefits:
      "Naming what your senses notice can gently pull attention back to the present when thoughts feel scattered or intense.",
    instructions: [
      "Name 5 things you can see around you.",
      "Name 4 things you can touch or feel.",
      "Name 3 things you can hear.",
      "Name 2 things you can smell (or recall a familiar scent).",
      "Name 1 thing you can taste (or take a sip of water).",
    ],
    iconPath:
      "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  },
  {
    id: "category-naming",
    slug: "category-naming",
    categoryId: "grounding",
    title: "Category Naming",
    shortDescription: "Name items in a category against a short timer.",
    estimatedDuration: "1–2 min",
    difficulty: "Beginner",
    benefits:
      "Listing items in a category gives your mind a narrow, concrete task — useful when rumination feels hard to interrupt.",
    instructions: [
      "Pick a category (for example: colors, cities, or animals).",
      "Set a short timer for about 60–90 seconds (or just count steadily).",
      "Name as many items in that category as you can.",
      "When time is up, pause and notice how you feel — no score needed.",
    ],
    iconPath: "M4 6h16M4 10h16M4 14h10M4 18h8",
  },
  {
    id: "object-focus",
    slug: "object-focus",
    categoryId: "grounding",
    title: "Object Focus",
    shortDescription: "Describe one nearby object in gentle detail.",
    estimatedDuration: "1–2 min",
    difficulty: "Beginner",
    benefits:
      "Describing one object in detail can soft-focus attention and give racing thoughts a smaller target.",
    instructions: [
      "Choose one object within reach or view.",
      "Notice its color, shape, and size.",
      "Describe its texture and any patterns you see.",
      "Note temperature, weight, or how light hits it.",
      "When you're ready, gently look away and continue your day.",
    ],
    iconPath: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  },
  {
    id: "pmr",
    slug: "pmr",
    categoryId: "relaxation",
    title: "Progressive Muscle Relaxation",
    shortDescription: "Tense and release muscle groups, one area at a time.",
    estimatedDuration: "8–10 min",
    difficulty: "Intermediate",
    benefits:
      "Alternating tension and release might help you notice where you're holding strain — and invite those areas to soften.",
    instructions: [
      "Find a comfortable seated or lying position.",
      "Starting with your feet, gently tense the muscles for about 5 seconds.",
      "Release fully and notice the difference for several breaths.",
      "Move upward through calves, thighs, hands, arms, shoulders, and face.",
      "Finish with a few easy breaths, scanning for remaining tension.",
    ],
    iconPath:
      "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  },
  {
    id: "body-scan",
    slug: "body-scan",
    categoryId: "relaxation",
    title: "Short Body Scan",
    shortDescription: "Move attention slowly from head to toe.",
    estimatedDuration: "5 min",
    difficulty: "Beginner",
    benefits:
      "A brief body scan can help you check in with how you feel without needing to change or fix anything.",
    instructions: [
      "Sit or lie down and soften your gaze or close your eyes.",
      "Bring attention to the top of your head.",
      "Slowly move awareness down through your face, neck, and shoulders.",
      "Continue through chest, belly, hips, legs, and feet.",
      "Spend a few breaths noticing your body as a whole.",
    ],
    iconPath: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    id: "micro-movement",
    slug: "micro-movement",
    categoryId: "relaxation",
    title: "Micro Movement Break",
    shortDescription: "Stand, stretch, and roll your shoulders — briefly.",
    estimatedDuration: "<1 min",
    difficulty: "Beginner",
    benefits:
      "A few gentle movements can interrupt long sitting and offer a small reset when energy feels stuck.",
    instructions: [
      "Stand up if you can do so safely.",
      "Roll your shoulders slowly forward and back.",
      "Stretch your arms overhead or out to the sides.",
      "Gently turn your neck left and right.",
      "Take one easy breath and return to what you were doing.",
    ],
    iconPath:
      "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    id: "open-reflection",
    slug: "open-reflection",
    categoryId: "journaling",
    title: "Open Reflection",
    shortDescription: "A free-form space to write whatever feels useful.",
    estimatedDuration: "Variable",
    difficulty: "Beginner",
    benefits:
      "An open page gives you room to spill thoughts as they are — no format required, and no right or wrong length.",
    instructions: [
      "Set a few minutes aside, or write until you feel done.",
      "Write whatever is on your mind — full sentences optional.",
      "If you get stuck, write \"I'm noticing…\" and keep going.",
      "Stop whenever it feels like enough for now.",
    ],
    iconPath:
      "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  },
  {
    id: "prompted-reflection",
    slug: "prompted-reflection",
    categoryId: "journaling",
    title: "Prompted Reflection",
    shortDescription: "Start with a gentle prompt if a blank page feels hard.",
    estimatedDuration: "Variable",
    difficulty: "Beginner",
    benefits:
      "A single prompt can make starting easier when a blank page feels overwhelming, while still leaving the response open-ended.",
    instructions: [
      "Choose one prompt that fits today.",
      "Option: \"What's one thing that's been on your mind today?\"",
      "Option: \"What's something that went okay today, even a small thing?\"",
      "Option: \"What would help right now, if anything?\"",
      "Write a short response — a few lines is enough.",
    ],
    iconPath:
      "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
  },
  {
    id: "sleep-wind-down",
    slug: "sleep-wind-down",
    categoryId: "sleep",
    title: "Wind-Down Sleep Routine",
    shortDescription: "A short nighttime routine you can try before rest.",
    estimatedDuration: "7 min",
    difficulty: "Beginner",
    benefits:
      "A gentle wind-down routine can signal that the day is closing — helpful if you want a bridge from activity to rest.",
    instructions: [
      "Dim the lights and put your phone out of easy reach if you can.",
      "Take three slow breaths.",
      "Loosen your shoulders and jaw.",
      "Think of one thing from the day you're okay leaving until tomorrow.",
      "Lie down and breathe quietly for a few more minutes.",
    ],
    iconPath:
      "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z",
  },
  {
    id: "sleep-audio",
    slug: "sleep-audio",
    categoryId: "sleep",
    title: "Guided Sleep Audio",
    shortDescription: "A longer guided listening practice for winding down.",
    estimatedDuration: "12 min",
    difficulty: "Intermediate",
    benefits:
      "Guided listening can occupy attention while your body settles — useful when quiet alone feels restless at bedtime.",
    instructions: [
      "Get comfortable in bed or a quiet spot.",
      "Close your eyes or keep a soft gaze.",
      "Follow the guided instructions when the audio player is available.",
      "Until then, use the wind-down steps above as a text guide at your own pace.",
      "If you drift off, that's fine — there's nothing you need to finish.",
    ],
    iconPath:
      "M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z",
  },
]

export function getActivitiesByCategory(
  categoryId: WellnessCategoryId
): WellnessActivity[] {
  return WELLNESS_ACTIVITIES.filter((a) => a.categoryId === categoryId)
}

export function getCategoryById(
  categoryId: WellnessCategoryId
): WellnessCategoryMeta | undefined {
  return WELLNESS_CATEGORIES.find((c) => c.id === categoryId)
}
