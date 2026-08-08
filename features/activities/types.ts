export type PhaseKind = "inhale" | "hold" | "exhale"

/** Legacy Box phase ids — kept so Box regression tests stay unmodified. */
export type Phase = "inhale" | "hold-in" | "exhale" | "hold-out"

export type EngineStatus = "idle" | "running" | "paused" | "complete"

export interface PhaseSpec {
  kind: PhaseKind
  seconds: number
  /** Shown in the UI, e.g. "Inhale", "Hold", "Exhale slowly" */
  label: string
  /** Optional second line, e.g. "through your nose" */
  hint?: string
  /**
   * Stable callback / a11y id. Box uses hold-in / hold-out so the two holds
   * remain distinct for onPhaseChange listeners and regression tests.
   */
  id: Phase | string
}

export interface TimelineSegment {
  id: string
  seconds: number
  label: string
  hint?: string
  meta?: unknown
}

export interface Timeline {
  id: string
  segments: readonly TimelineSegment[]
  loops: boolean
}

export interface BreathingPattern {
  id: string
  phases: readonly PhaseSpec[]
  /** Sum of phase seconds — memoized for display */
  cycleSeconds: number
  /** Alternative phase timings the user can pick between. First entry is the default. */
  paceVariants?: readonly {
    id: string
    label: string
    description?: string
    phases: readonly PhaseSpec[]
  }[]
}

export type ActivityCategory =
  | "breathing"
  | "grounding"
  | "relaxation"
  | "journaling"
  | "sleep"

export type ActivityIcon =
  | "box"
  | "clock"
  | "wind"
  | "sigh"
  | "senses"
  | "move"
  | "scan"
  | "muscle"
  | "journal"
  | "moon"

export type ActivityKind =
  | "breathing"
  | "box-breathing"
  | "four-seven-eight"
  | "grounding"
  | "micro-movement"
  | "body-scan"
  | "progressive-muscle-relaxation"
  | "journal-reflection"
  | "coming-soon"

export type ScanEyes = "closed" | "open"

export type ScanAnchor = "hands" | "feet" | "breath" | "sound"

export type ScanFeeling = "calm" | "restless" | "hard-to-tell"

export type ScanDurationId = "3min" | "5min" | "10min"

export type ScanRegionId =
  | "feet-toes"
  | "lower-legs"
  | "knees-thighs"
  | "hips-seat"
  | "lower-back"
  | "belly"
  | "chest"
  | "upper-back-shoulders"
  | "hands-arms"
  | "neck-throat"
  | "face-jaw"
  | "whole"

export interface RegionSpec {
  id: ScanRegionId
  label: string
  prompt: string
  /** Narration audio for this region. Falls back to tones when absent. */
  narrationUrl?: string
}

export interface Activity {
  id: string
  title: string
  slug: string
  category: ActivityCategory
  durationLabel: string
  description: string
  longDescription: string
  icon: ActivityIcon
  kind: ActivityKind
  pattern?: BreathingPattern
  defaultCycles?: number
}

export type SessionKind = "paced" | "stepped"

export type Sense = "see" | "feel" | "hear" | "smell" | "taste"

export type SensePreference = "default" | "substitute" | "skip"

export interface StepSpec {
  id: string
  /** How many items to gather. 0 = dwell-only step (Next always available). */
  count: number
  /** Grounding sense — optional for non-sensory stepped activities */
  sense?: Sense
  prompt: string
  hint: string
  fallbackPrompt: string
  /** Advisory dwell. Renders an ambient ring; NEVER auto-advances. */
  suggestedSeconds?: number
}

export interface StepResult {
  stepId: string
  sense?: Sense
  filled: number
  skipped: boolean
  substituted: boolean
  entries: readonly string[]
}

export type BodyRegion =
  | "jaw"
  | "shoulders"
  | "hands"
  | "neck"
  | "feet"
  | "ankles"
  | "spine"
  | "whole"
  | "tongue"
  | "brows"

export type MovementLevel = "standard" | "gentler" | "imagined" | "skip"

export interface MovementStep extends StepSpec {
  bodyRegion: BodyRegion
  discreet: boolean
  /** Smaller version of the same movement. */
  gentler: string
  /** Motor-imagery version — no movement at all. */
  imagined: string
  /** Discreet-mode prompt override when present */
  discreetPrompt?: string
}


export interface SessionRecord {
  id: string
  activitySlug: string
  startedAt: string
  durationMs: number
  cyclesCompleted: number
  cyclesPlanned: number
  completed: boolean
  mood?: 1 | 2 | 3 | 4 | 5
  endedEarly?: boolean
  kind?: SessionKind
  stepsCompleted?: number
  /** Body scan completion feeling — mood-equivalent, never scored */
  scanFeeling?: ScanFeeling
  /** Optional free-text grounding entries — local only */
  groundingEntries?: readonly {
    sense: Sense
    text: string
  }[]
}


export const PHASES: readonly Phase[] = [
  "inhale",
  "hold-in",
  "exhale",
  "hold-out",
] as const

export const PHASE_LABELS: Record<Phase, string> = {
  inhale: "Inhale",
  "hold-in": "Hold",
  exhale: "Exhale",
  "hold-out": "Hold",
}

/** Box Breathing pattern — exported from types so existing Box tests import paths stay valid. */
export const BOX_PATTERN: BreathingPattern = {
  id: "box",
  cycleSeconds: 16,
  phases: [
    { id: "inhale", kind: "inhale", seconds: 4, label: "Inhale" },
    { id: "hold-in", kind: "hold", seconds: 4, label: "Hold" },
    { id: "exhale", kind: "exhale", seconds: 4, label: "Exhale" },
    { id: "hold-out", kind: "hold", seconds: 4, label: "Hold" },
  ],
}
