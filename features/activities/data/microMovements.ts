import type { MovementStep } from "../types"

const SUGGESTED = 20

/** Standard 8-step head → feet → whole sequence. */
export const MICRO_MOVEMENT_STEPS: readonly MovementStep[] = [
  {
    id: "jaw",
    count: 0,
    bodyRegion: "jaw",
    discreet: true,
    suggestedSeconds: SUGGESTED,
    prompt: "Let your teeth come apart. Notice if your jaw was holding something.",
    hint: "",
    fallbackPrompt: "",
    gentler: "Part your lips just a little. Soften the hinges of your jaw.",
    imagined:
      "Picture your jaw unclenching. Imagining it softens much of the same wiring.",
  },
  {
    id: "shoulders",
    count: 0,
    bodyRegion: "shoulders",
    discreet: true,
    suggestedSeconds: SUGGESTED,
    prompt: "Lift your shoulders toward your ears — then let them drop.",
    hint: "",
    fallbackPrompt: "",
    gentler: "Raise one shoulder a little, then release. Then the other.",
    imagined:
      "Picture your shoulders rising and falling. No need to move them.",
  },
  {
    id: "hands",
    count: 0,
    bodyRegion: "hands",
    discreet: true,
    suggestedSeconds: SUGGESTED,
    prompt: "Spread your fingers wide. Then let them go soft.",
    hint: "",
    fallbackPrompt: "",
    gentler: "Open one hand gently, then close it soft. Then the other.",
    imagined:
      "Picture your fingers spreading wide, then softening. Stay still if you like.",
  },
  {
    id: "neck",
    count: 0,
    bodyRegion: "neck",
    discreet: false,
    suggestedSeconds: SUGGESTED,
    prompt:
      "Tip one ear toward your shoulder. Slowly. Then the other side.",
    hint: "",
    fallbackPrompt: "",
    gentler:
      "Just turn your eyes to one side, then the other. Let your head follow only if it wants to.",
    imagined:
      "Picture the tilt without doing it. Imagining a movement lights up much of the same wiring.",
  },
  {
    id: "feet",
    count: 0,
    bodyRegion: "feet",
    discreet: true,
    suggestedSeconds: SUGGESTED,
    prompt: "Press your feet into the floor. Feel it press back.",
    hint: "",
    fallbackPrompt: "",
    gentler: "Rest your attention on the soles of your feet. A light press is enough.",
    imagined:
      "Picture your feet meeting the floor. Feel the contact in your mind.",
  },
  {
    id: "ankles",
    count: 0,
    bodyRegion: "ankles",
    discreet: true,
    suggestedSeconds: SUGGESTED,
    prompt: "Draw a slow circle with one ankle. Then the other.",
    hint: "",
    fallbackPrompt: "",
    gentler: "Rock one foot gently heel to toe. Then the other.",
    imagined:
      "Picture one ankle drawing a slow circle. Then the other. Stay still.",
  },
  {
    id: "spine",
    count: 0,
    bodyRegion: "spine",
    discreet: true,
    suggestedSeconds: SUGGESTED,
    prompt: "Grow a little taller through the top of your head.",
    hint: "",
    fallbackPrompt: "",
    discreetPrompt: "Lengthen through your spine — just an inch.",
    gentler: "Ease your sit bones into the seat. Let your back find a little length.",
    imagined:
      "Picture yourself growing taller through the crown. No need to move.",
  },
  {
    id: "whole",
    count: 0,
    bodyRegion: "whole",
    discreet: true,
    suggestedSeconds: SUGGESTED,
    prompt: "Nothing to do now. Just notice how your body feels.",
    hint: "",
    fallbackPrompt: "",
    gentler: "Nothing to do now. Just notice how your body feels.",
    imagined: "Nothing to do now. Just notice how your body feels.",
  },
]

/** Invisible face micro-moves — discreet mode only. */
export const DISCREET_ONLY_STEPS: readonly MovementStep[] = [
  {
    id: "tongue",
    count: 0,
    bodyRegion: "tongue",
    discreet: true,
    suggestedSeconds: SUGGESTED,
    prompt: "Let your tongue rest off the roof of your mouth.",
    hint: "",
    fallbackPrompt: "",
    gentler: "Notice where your tongue is. Soften it if it wants to.",
    imagined:
      "Picture your tongue resting low and soft. Stay still.",
  },
  {
    id: "brows",
    count: 0,
    bodyRegion: "brows",
    discreet: true,
    suggestedSeconds: SUGGESTED,
    prompt: "Soften the space between your eyebrows.",
    hint: "",
    fallbackPrompt: "",
    gentler: "Un-knit the space between your brows — just a little.",
    imagined:
      "Picture the space between your eyebrows softening. No need to move.",
  },
]

/**
 * Build the active sequence for a session.
 * Discreet: drops neck, inserts tongue + brows after jaw, uses discreet prompts.
 */
export function buildMicroMovementSteps(
  discreetMode: boolean
): MovementStep[] {
  if (!discreetMode) {
    return MICRO_MOVEMENT_STEPS.map((s) => ({ ...s }))
  }

  const base = MICRO_MOVEMENT_STEPS.filter((s) => s.discreet).map((s) => ({
    ...s,
    prompt: s.discreetPrompt ?? s.prompt,
  }))

  const jawIdx = base.findIndex((s) => s.id === "jaw")
  const insertAt = jawIdx >= 0 ? jawIdx + 1 : 1
  const withFace = [
    ...base.slice(0, insertAt),
    ...DISCREET_ONLY_STEPS.map((s) => ({ ...s })),
    ...base.slice(insertAt),
  ]
  return withFace
}

export function regionLabel(region: MovementStep["bodyRegion"]): string {
  switch (region) {
    case "jaw":
      return "Jaw"
    case "shoulders":
      return "Shoulders"
    case "hands":
      return "Hands"
    case "neck":
      return "Neck"
    case "feet":
      return "Feet"
    case "ankles":
      return "Ankles"
    case "spine":
      return "Spine"
    case "whole":
      return "Whole body"
    case "tongue":
      return "Tongue"
    case "brows":
      return "Brows"
  }
}
