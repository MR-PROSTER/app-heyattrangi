export interface GroundingStepConfig {
  id: string
  headline: string
  detail: string
}

export interface GroundingConfig {
  slug: string
  title: string
  steps: GroundingStepConfig[]
}

export const GROUNDING_CONFIGS: Record<string, GroundingConfig> = {
  "5-4-3-2-1-grounding": {
    slug: "5-4-3-2-1-grounding",
    title: "5-4-3-2-1 Grounding",
    steps: [
      {
        id: "see",
        headline: "Find",
        detail: "5 things you can see.",
      },
      {
        id: "touch",
        headline: "Find",
        detail: "4 things you can touch.",
      },
      {
        id: "hear",
        headline: "Find",
        detail: "3 things you can hear.",
      },
      {
        id: "smell",
        headline: "Notice",
        detail: "2 things you can smell.",
      },
      {
        id: "taste",
        headline: "Notice",
        detail: "1 thing you can taste.",
      },
    ],
  },
  "object-focus": {
    slug: "object-focus",
    title: "Object Focus",
    steps: [
      {
        id: "choose",
        headline: "Choose",
        detail: "One object near you.",
      },
      {
        id: "color",
        headline: "Notice",
        detail: "Its color and shape.",
      },
      {
        id: "texture",
        headline: "Notice",
        detail: "Its texture or surface.",
      },
      {
        id: "weight",
        headline: "Sense",
        detail: "Its weight or presence.",
      },
      {
        id: "rest",
        headline: "Rest",
        detail: "Your attention gently on it for a few breaths.",
      },
    ],
  },
  "category-naming": {
    slug: "category-naming",
    title: "Category Naming",
    steps: [
      {
        id: "colors",
        headline: "Name",
        detail: "Three colors you can see.",
      },
      {
        id: "sounds",
        headline: "Name",
        detail: "Two sounds around you.",
      },
      {
        id: "textures",
        headline: "Name",
        detail: "Two textures you can feel.",
      },
      {
        id: "words",
        headline: "Name",
        detail: "One kind word for yourself.",
      },
    ],
  },
  "micro-movement": {
    slug: "micro-movement",
    title: "Micro Movement",
    steps: [
      {
        id: "shoulders",
        headline: "Gently",
        detail: "Roll your shoulders once or twice.",
      },
      {
        id: "hands",
        headline: "Softly",
        detail: "Open and close your hands.",
      },
      {
        id: "neck",
        headline: "Slowly",
        detail: "Turn your head side to side.",
      },
      {
        id: "feet",
        headline: "Feel",
        detail: "Press your feet into the floor.",
      },
      {
        id: "settle",
        headline: "Settle",
        detail: "Return to a comfortable stillness.",
      },
    ],
  },
}

export function getGroundingConfig(
  slug: string
): GroundingConfig | undefined {
  return GROUNDING_CONFIGS[slug]
}
