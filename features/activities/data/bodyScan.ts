import type {
  RegionSpec,
  ScanDurationId,
  ScanRegionId,
  Timeline,
  TimelineSegment,
} from "../types"

export const SCAN_REGION_SPECS: readonly RegionSpec[] = [
  {
    id: "feet-toes",
    label: "Feet & toes",
    prompt:
      "Start at your feet. Whatever's there — warmth, pressure, nothing at all.",
  },
  {
    id: "lower-legs",
    label: "Lower legs",
    prompt: "Let your attention move up through your calves and shins.",
  },
  {
    id: "knees-thighs",
    label: "Knees & thighs",
    prompt:
      "Your knees. Your thighs, resting against whatever's holding them.",
  },
  {
    id: "hips-seat",
    label: "Hips & seat",
    prompt: "Where your body meets the chair or the bed. Notice the contact.",
  },
  {
    id: "lower-back",
    label: "Lower back",
    prompt: "Your lower back. No need to change anything.",
  },
  {
    id: "belly",
    label: "Belly",
    prompt: "Your belly, moving a little with your breath.",
  },
  {
    id: "chest",
    label: "Chest",
    prompt: "Your chest. See if you can just observe it.",
  },
  {
    id: "upper-back-shoulders",
    label: "Upper back & shoulders",
    prompt:
      "Across your shoulders. This is where a lot of us hold things.",
  },
  {
    id: "hands-arms",
    label: "Hands & arms",
    prompt: "Down your arms to your hands. Your fingertips.",
  },
  {
    id: "neck-throat",
    label: "Neck & throat",
    prompt: "Your throat, your neck.",
  },
  {
    id: "face-jaw",
    label: "Face & jaw",
    prompt:
      "Your jaw, your cheeks, the space between your eyebrows.",
  },
  {
    id: "whole",
    label: "Whole body",
    prompt: "Now the whole of you at once. Nothing to find. Just here.",
  },
] as const

/** Regions commonly left out — shown in the pre-session skip picker. */
export const SKIPPABLE_SCAN_REGIONS: readonly ScanRegionId[] = [
  "chest",
  "belly",
  "hips-seat",
]

export const SCAN_DURATION_SECONDS: Record<ScanDurationId, number> = {
  "3min": 180,
  "5min": 300,
  "10min": 600,
}

export const SCAN_DURATION_OPTIONS: readonly {
  id: ScanDurationId
  label: string
  totalSeconds: number
}[] = [
  { id: "3min", label: "3 min", totalSeconds: 180 },
  { id: "5min", label: "5 min", totalSeconds: 300 },
  { id: "10min", label: "10 min", totalSeconds: 600 },
]

export const ANCHOR_PROMPTS: Record<
  "hands" | "feet" | "breath" | "sound",
  string
> = {
  hands: "Bring your attention back to your hands. Whatever's there is enough.",
  feet: "Bring your attention back to your feet. Whatever's there is enough.",
  breath: "Come back to the feeling of your breath, wherever you notice it.",
  sound: "Come back to a sound in the room. Just listening, nothing to do.",
}

/**
 * Build a loops:false timeline. Skipped regions are omitted; their time is
 * redistributed evenly so the session still lands on totalSeconds.
 */
export function buildBodyScanTimeline(
  totalSeconds: number,
  skipRegions: readonly string[] = []
): Timeline {
  const skip = new Set(skipRegions)
  const active = SCAN_REGION_SPECS.filter((r) => !skip.has(r.id))
  if (active.length === 0) {
    return { id: "body-scan", loops: false, segments: [] }
  }
  const per = totalSeconds / active.length
  const segments: TimelineSegment[] = active.map((r) => ({
    id: r.id,
    seconds: per,
    label: r.label,
    hint: r.prompt,
    meta: r,
  }))
  return {
    id: "body-scan",
    loops: false,
    segments,
  }
}

/** Default 5 min, all regions — for imports that want a static Timeline. */
export const BODY_SCAN_TIMELINE: Timeline = buildBodyScanTimeline(300)

export function isRegionSpec(v: unknown): v is RegionSpec {
  return (
    !!v &&
    typeof v === "object" &&
    "id" in v &&
    "prompt" in v &&
    typeof (v as RegionSpec).prompt === "string"
  )
}
