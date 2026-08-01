export type BreathPhaseId = "inhale" | "hold" | "exhale" | "inhale-2"

export interface BreathPhaseConfig {
  id: BreathPhaseId
  label: string
  seconds: number
  /** Target circle scale at end of phase */
  scale: number
}

export interface BreathingTechniqueConfig {
  slug: string
  title: string
  phases: BreathPhaseConfig[]
}

/** Shared timing configs — techniques differ only by phase timings. */
export const BREATHING_CONFIGS: Record<string, BreathingTechniqueConfig> = {
  "box-breathing": {
    slug: "box-breathing",
    title: "Box Breathing",
    phases: [
      { id: "inhale", label: "Breathe In", seconds: 4, scale: 1.15 },
      { id: "hold", label: "Hold", seconds: 4, scale: 1.15 },
      { id: "exhale", label: "Exhale", seconds: 4, scale: 0.85 },
      { id: "hold", label: "Hold", seconds: 4, scale: 0.85 },
    ],
  },
  "breathing-4-7-8": {
    slug: "breathing-4-7-8",
    title: "4-7-8 Breathing",
    phases: [
      { id: "inhale", label: "Breathe In", seconds: 4, scale: 1.12 },
      { id: "hold", label: "Hold", seconds: 7, scale: 1.12 },
      { id: "exhale", label: "Exhale", seconds: 8, scale: 0.82 },
    ],
  },
  "belly-breathing": {
    slug: "belly-breathing",
    title: "Belly Breathing",
    phases: [
      { id: "inhale", label: "Breathe In", seconds: 4, scale: 1.14 },
      { id: "exhale", label: "Exhale", seconds: 6, scale: 0.86 },
    ],
  },
  "physiological-sigh": {
    slug: "physiological-sigh",
    title: "Physiological Sigh",
    phases: [
      { id: "inhale", label: "Breathe In", seconds: 2, scale: 1.05 },
      { id: "inhale-2", label: "Breathe In Again", seconds: 1, scale: 1.18 },
      { id: "exhale", label: "Long Exhale", seconds: 5, scale: 0.8 },
    ],
  },
}

export function getBreathingConfig(
  slug: string
): BreathingTechniqueConfig | undefined {
  return BREATHING_CONFIGS[slug]
}
