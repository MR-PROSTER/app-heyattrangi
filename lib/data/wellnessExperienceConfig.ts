import type { WellnessCategoryColor } from "@/lib/data/wellnessActivities"
import { ENCOURAGING_MESSAGES } from "@/lib/data/wellnessTheme"

export type ExperiencePlayerProps = {
  activityId: string
  title: string
  estimatedDuration: string
  color: WellnessCategoryColor
  onExit: () => void
  onDone: () => void
}

export type BreathPhase = "inhale" | "hold1" | "exhale" | "hold2"

export type BreathPattern = {
  inhale: number
  hold1: number
  exhale: number
  hold2: number
  cycles: number
  labels: Partial<Record<BreathPhase, string>>
}

export const BREATH_PATTERNS: Record<string, BreathPattern> = {
  "box-breathing": {
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    cycles: 4,
    labels: {
      inhale: "Inhale",
      hold1: "Hold",
      exhale: "Exhale",
      hold2: "Hold",
    },
  },
  "breathing-4-7-8": {
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    cycles: 4,
    labels: {
      inhale: "Inhale 4",
      hold1: "Hold 7",
      exhale: "Exhale 8",
    },
  },
}

export const CATEGORY_NAMING_CHALLENGES = [
  { label: "Animals", goal: 10, placeholder: "e.g. dolphin" },
  { label: "Colors", goal: 10, placeholder: "e.g. teal" },
  { label: "Foods", goal: 10, placeholder: "e.g. mango" },
  { label: "Cities", goal: 8, placeholder: "e.g. Lisbon" },
]

export const OBJECT_FOCUS_PROMPTS = [
  "What color stands out most?",
  "How would you describe the texture?",
  "What shape or outline do you notice?",
  "Does it feel light or heavy?",
  "What might its purpose be?",
]

export const PMR_MUSCLE_GROUPS = [
  { id: "feet", label: "Feet", hint: "Gently tense your feet, then release." },
  { id: "calves", label: "Calves", hint: "Tighten your calves for a moment, then soften." },
  { id: "thighs", label: "Thighs", hint: "Squeeze your thighs, then let go." },
  { id: "hands", label: "Hands", hint: "Make soft fists, then open your hands." },
  { id: "arms", label: "Arms", hint: "Tense your arms briefly, then release." },
  { id: "shoulders", label: "Shoulders", hint: "Lift shoulders toward ears, then drop." },
  { id: "face", label: "Face", hint: "Scrunch gently, then soften your face." },
]

export const BODY_SCAN_REGIONS = [
  { id: "head", label: "Head", hint: "Notice the top of your head and face." },
  { id: "shoulders", label: "Shoulders", hint: "Feel your shoulders soft or held." },
  { id: "chest", label: "Chest", hint: "Notice the rise and fall of your chest." },
  { id: "arms", label: "Arms", hint: "Bring awareness into arms and hands." },
  { id: "legs", label: "Legs", hint: "Sense your thighs, knees, and calves." },
  { id: "feet", label: "Feet", hint: "Rest attention gently on your feet." },
]

export const MICRO_MOVEMENTS = [
  { id: "neck", label: "Neck stretch", hint: "Slowly tilt your head side to side." },
  { id: "shoulders", label: "Shoulder rolls", hint: "Roll shoulders forward, then back." },
  { id: "wrists", label: "Wrist stretch", hint: "Circle your wrists a few times." },
  { id: "stand", label: "Stand up", hint: "Stand if you can do so safely." },
  { id: "walk", label: "Walk", hint: "Take a few easy steps in place or nearby." },
]

export const WIND_DOWN_ITEMS = [
  { id: "brightness", label: "Reduce brightness", hint: "Dim screens and nearby lights." },
  { id: "water", label: "Drink water", hint: "Take a few small sips if you like." },
  { id: "breathing", label: "Deep breathing", hint: "Take three slow, comfortable breaths." },
  { id: "phone", label: "No phone", hint: "Put your phone out of easy reach." },
  { id: "relax", label: "Relax", hint: "Settle into a resting position." },
]

export const JOURNAL_PROMPTS = [
  "What's one thing that's been on your mind today?",
  "What's something that went okay today, even a small thing?",
  "What would help right now, if anything?",
  "What are you grateful for in this moment?",
  "What can wait until tomorrow?",
]

export function getEncouragingMessage(seed: string): string {
  const sum = seed.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return ENCOURAGING_MESSAGES[Math.abs(sum) % ENCOURAGING_MESSAGES.length]
}
