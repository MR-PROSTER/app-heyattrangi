export interface RelaxationStepConfig {
  id: string
  instruction: string
}

export interface RelaxationConfig {
  slug: string
  title: string
  intro: string
  steps: RelaxationStepConfig[]
}

export const RELAXATION_CONFIGS: Record<string, RelaxationConfig> = {
  "body-scan": {
    slug: "body-scan",
    title: "Body Scan",
    intro: "Bring soft attention through your body, one area at a time.",
    steps: [
      { id: "feet", instruction: "Notice your feet." },
      { id: "legs", instruction: "Notice your legs." },
      { id: "hips", instruction: "Notice your hips and lower back." },
      { id: "belly", instruction: "Notice your belly." },
      { id: "chest", instruction: "Notice your chest." },
      { id: "shoulders", instruction: "Relax your shoulders." },
      { id: "neck", instruction: "Relax your neck." },
      { id: "jaw", instruction: "Relax your jaw." },
      { id: "face", instruction: "Soften your face." },
      { id: "whole", instruction: "Rest with your whole body for a moment." },
    ],
  },
  "progressive-muscle-relaxation": {
    slug: "progressive-muscle-relaxation",
    title: "Progressive Muscle Relaxation",
    intro: "Gently tense, then release each area.",
    steps: [
      { id: "hands", instruction: "Gently tense your hands, then release." },
      { id: "arms", instruction: "Gently tense your arms, then release." },
      { id: "shoulders", instruction: "Lift your shoulders, then let them drop." },
      { id: "face", instruction: "Tighten your face gently, then soften." },
      { id: "chest", instruction: "Squeeze your chest lightly, then release." },
      { id: "belly", instruction: "Tighten your belly, then let it soften." },
      { id: "legs", instruction: "Tense your legs, then release." },
      { id: "feet", instruction: "Curl your toes, then let them rest." },
      { id: "whole", instruction: "Feel the ease through your whole body." },
    ],
  },
}

export function getRelaxationConfig(
  slug: string
): RelaxationConfig | undefined {
  return RELAXATION_CONFIGS[slug]
}
