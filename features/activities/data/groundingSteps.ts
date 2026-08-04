import type { Sense, StepSpec } from "../types"

export const GROUNDING_STEPS: readonly StepSpec[] = [
  {
    id: "see",
    count: 5,
    sense: "see",
    prompt: "What are five things you can see?",
    hint: "Anything counts — a scuff on the floor, the way the light falls, your own hands.",
    fallbackPrompt:
      "Five things you can picture in the room around you.",
  },
  {
    id: "feel",
    count: 4,
    sense: "feel",
    prompt: "What are four things you can feel?",
    hint: "The chair under you, fabric on your skin, the air on your face — anything solid.",
    fallbackPrompt:
      "Four sensations you know well — warmth, pressure, texture, weight.",
  },
  {
    id: "hear",
    count: 3,
    sense: "hear",
    prompt: "What are three things you can hear?",
    hint: "Far or near. A fan, a voice, your own breathing.",
    fallbackPrompt:
      "Three things you can feel through your body — the floor, your clothes, your own heartbeat.",
  },
  {
    id: "smell",
    count: 2,
    sense: "smell",
    prompt: "What are two things you can smell?",
    hint: "Even a faint trace counts. Soap, air, nothing much — that's fine.",
    fallbackPrompt:
      "Two smells you love. Bring them to mind — rain on pavement, coffee, someone's shampoo.",
  },
  {
    id: "taste",
    count: 1,
    sense: "taste",
    prompt: "What is one thing you can taste?",
    hint: "Toothpaste, coffee, the inside of your mouth. Anything at all.",
    fallbackPrompt: "One taste you know well. What does it remind you of?",
  },
] as const

export const DEFAULT_GROUNDING_SENSES: Record<Sense, "default" | "substitute" | "skip"> = {
  see: "default",
  feel: "default",
  hear: "default",
  smell: "default",
  taste: "default",
}
