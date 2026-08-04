import { BOX_PATTERN, type BreathingPattern } from "../types"

function withCycleSeconds(
  id: string,
  phases: BreathingPattern["phases"]
): BreathingPattern {
  return {
    id,
    phases,
    cycleSeconds: phases.reduce((sum, p) => sum + p.seconds, 0),
  }
}

/** Alias — prefer this name in new code. */
export const PATTERN_BOX = BOX_PATTERN

/** 4-7-8 Breathing: inhale 4 → hold 7 → exhale 8. */
export const PATTERN_478 = withCycleSeconds("478", [
  {
    id: "inhale",
    kind: "inhale",
    seconds: 4,
    label: "Inhale",
    hint: "through your nose",
  },
  {
    id: "hold",
    kind: "hold",
    seconds: 7,
    label: "Hold",
  },
  {
    id: "exhale",
    kind: "exhale",
    seconds: 8,
    label: "Exhale slowly",
    hint: "through your mouth",
  },
])

function bellyPhases(
  inhale: number,
  exhale: number
): BreathingPattern["phases"] {
  return [
    {
      id: "inhale",
      kind: "inhale",
      seconds: inhale,
      label: "Breathe in — let your belly rise",
    },
    {
      id: "exhale",
      kind: "exhale",
      seconds: exhale,
      label: "Breathe out — slowly",
    },
  ]
}

/** Belly Breathing — default standard 4:6, with gentle / deep pace variants. */
export const PATTERN_BELLY: BreathingPattern = {
  id: "belly",
  cycleSeconds: 10,
  phases: bellyPhases(4, 6),
  paceVariants: [
    {
      id: "gentle",
      label: "Gentle",
      description: "If 4-6 feels like a stretch",
      phases: bellyPhases(3, 4),
    },
    {
      id: "standard",
      label: "Standard",
      description: "A good place to start",
      phases: bellyPhases(4, 6),
    },
    {
      id: "deep",
      label: "Deep",
      description: "Once this feels easy",
      phases: bellyPhases(5, 8),
    },
  ],
}

export function patternFromBellyPace(
  paceId: string
): BreathingPattern {
  const variant =
    PATTERN_BELLY.paceVariants?.find((v) => v.id === paceId) ??
    PATTERN_BELLY.paceVariants?.[1]
  const phases = variant?.phases ?? PATTERN_BELLY.phases
  return withCycleSeconds(`belly-${variant?.id ?? "standard"}`, phases)
}

/** Round cycles so wall-clock duration lands nearest the chosen minutes. */
export function cyclesForDurationMinutes(
  minutes: number,
  cycleSeconds: number
): number {
  return Math.max(1, Math.round((minutes * 60) / cycleSeconds))
}

export const BELLY_DURATION_MINUTES = [2, 3, 5] as const

export function bellyDurationOptions(cycleSeconds: number) {
  return BELLY_DURATION_MINUTES.map((minutes) => {
    const cycles = cyclesForDurationMinutes(minutes, cycleSeconds)
    const actualSec = cycles * cycleSeconds
    const actualMin = Math.round(actualSec / 60)
    return {
      cycles,
      label: `${minutes} min`,
      detail: `${actualMin} min · ${cycles} breaths`,
    }
  })
}

/**
 * Physiological Sigh: inhale 2 → top-up inhale 1 → long exhale 5.
 * Distinct phase ids so double-inhale emits separate transitions.
 */
export const PATTERN_SIGH = withCycleSeconds("sigh", [
  {
    id: "inhale",
    kind: "inhale",
    seconds: 2,
    label: "In…",
    hint: "through your nose",
  },
  {
    id: "inhale-2",
    kind: "inhale",
    seconds: 1,
    label: "…and again",
    hint: "a short top-up",
  },
  {
    id: "exhale",
    kind: "exhale",
    seconds: 5,
    label: "Out, slowly",
    hint: "through your mouth",
  },
])