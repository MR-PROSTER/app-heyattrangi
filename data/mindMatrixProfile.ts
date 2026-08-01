/**
 * Profile Mind Matrix presentation data.
 * No backend — uses the same monthly retake rules as Explore assessment state.
 */

import {
  formatAssessmentDate,
  MIND_MATRIX_HREF,
  type MindMatrixAssessmentState,
} from "@/data/assessmentState"

export { MIND_MATRIX_HREF, formatAssessmentDate }

export interface MindMatrixHistoryItem {
  id: string
  /** ISO date YYYY-MM-DD */
  date: string
  band: string
  /** Minutes to complete */
  durationMinutes: number
  /** API risk tier for existing MindMatrixResult screen */
  riskLevel: "Low" | "Mild" | "Moderate" | "High"
  /** Display score 0–100 (presentation only) */
  score: number
  /** Local completion time label, e.g. "2:14 PM" */
  completionTime: string
}

export interface MindMatrixProfileState {
  latest: MindMatrixHistoryItem | null
  canRetake: boolean
  nextAvailableDate: string | null
  history: MindMatrixHistoryItem[]
}

/** Calm, non-clinical band interpretation — never alarming, never comparative. */
export function getCalmBandInsight(band: string): string {
  switch (band) {
    case "Sharp":
      return "Your latest check-in suggests a clear and present state of mind."
    case "Focused":
      return "Your latest check-in suggests a focused and settled emotional state."
    case "Steady":
      return "Your latest check-in suggests a generally steady emotional state."
    case "Drifting":
      return "Your latest check-in suggests a softer, more open pace — a gentle moment to notice how you feel."
    case "Foggy":
      return "Your latest check-in suggests a quieter day for your mind. Rest and kindness toward yourself are welcome."
    default:
      return "Your latest check-in is saved here whenever you want to revisit it."
  }
}

export function addOneMonthIso(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(d.getTime())) return isoDate
  d.setMonth(d.getMonth() + 1)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/** Monthly availability — same rule pattern as Explore (retake after nextAvailableDate). */
export function resolveRetakeAvailability(
  lastTaken: string | null,
  nextAvailableDate: string | null,
  now = new Date()
): { canRetake: boolean; nextAvailableDate: string | null } {
  if (!lastTaken) {
    return { canRetake: true, nextAvailableDate: null }
  }
  const next = nextAvailableDate || addOneMonthIso(lastTaken)
  const nextDate = new Date(`${next}T00:00:00`)
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const canRetake = !Number.isNaN(nextDate.getTime()) && nextDate <= today
  return { canRetake, nextAvailableDate: canRetake ? null : next }
}

export function formatDuration(minutes: number): string {
  if (minutes < 1) return "Under a minute"
  if (minutes === 1) return "1 minute"
  return `${minutes} minutes`
}

export function formatCompletionTime(time: string): string {
  return time
}

export function resultHref(riskLevel: string): string {
  return `${MIND_MATRIX_HREF}?result=${encodeURIComponent(riskLevel)}`
}

/**
 * Profile history (last 5). Swap to empty `history: []` to preview Never Taken.
 * Aligns with Explore monthly lock when canRetake is false.
 */
const PROFILE_HISTORY: MindMatrixHistoryItem[] = [
  {
    id: "mm-1",
    date: "2026-06-15",
    band: "Steady",
    durationMinutes: 3,
    riskLevel: "Moderate",
    score: 62,
    completionTime: "2:14 PM",
  },
  {
    id: "mm-2",
    date: "2026-05-12",
    band: "Focused",
    durationMinutes: 4,
    riskLevel: "Mild",
    score: 77,
    completionTime: "10:05 AM",
  },
  {
    id: "mm-3",
    date: "2026-04-10",
    band: "Steady",
    durationMinutes: 3,
    riskLevel: "Moderate",
    score: 58,
    completionTime: "7:42 PM",
  },
  {
    id: "mm-4",
    date: "2026-03-08",
    band: "Sharp",
    durationMinutes: 3,
    riskLevel: "Low",
    score: 90,
    completionTime: "9:20 AM",
  },
  {
    id: "mm-5",
    date: "2026-02-05",
    band: "Focused",
    durationMinutes: 5,
    riskLevel: "Mild",
    score: 74,
    completionTime: "4:55 PM",
  },
]

export function getMindMatrixProfileState(
  now = new Date()
): MindMatrixProfileState {
  const history = PROFILE_HISTORY.slice(0, 5)
  const latest = history[0] ?? null
  if (!latest) {
    return {
      latest: null,
      canRetake: true,
      nextAvailableDate: null,
      history: [],
    }
  }
  const nextCandidate = addOneMonthIso(latest.date)
  const { canRetake, nextAvailableDate } = resolveRetakeAvailability(
    latest.date,
    nextCandidate,
    now
  )
  return {
    latest,
    canRetake,
    nextAvailableDate,
    history,
  }
}

/** Bridge to Explore-style state if needed elsewhere. */
export function toExploreAssessmentState(
  state: MindMatrixProfileState
): MindMatrixAssessmentState {
  return {
    lastTaken: state.latest?.date ?? null,
    band: state.latest?.band ?? null,
    nextAvailableDate: state.nextAvailableDate,
    canRetake: state.canRetake,
  }
}
