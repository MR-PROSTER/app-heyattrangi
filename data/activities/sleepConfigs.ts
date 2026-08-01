export interface SleepConfig {
  slug: string
  title: string
  headline: string
  lines: string[]
}

export const SLEEP_CONFIGS: Record<string, SleepConfig> = {
  "sleep-wind-down": {
    slug: "sleep-wind-down",
    title: "Sleep Wind Down",
    headline: "Settle into the evening",
    lines: [
      "Let the day soften at the edges.",
      "There is nothing you need to finish right now.",
      "Breathe slowly, and allow rest to find you.",
    ],
  },
}

export function getSleepConfig(slug: string): SleepConfig | undefined {
  return SLEEP_CONFIGS[slug]
}
