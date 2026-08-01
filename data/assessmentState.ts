/**
 * Mock assessment state for Explore → Assessments (Mind Matrix only).
 * No backend — swap values here to preview Never / Taken / Locked UI.
 */

export type AssessmentUiStatus = "never" | "taken" | "locked"

export interface MindMatrixAssessmentState {
  lastTaken: string | null
  band: string | null
  nextAvailableDate: string | null
  canRetake: boolean
}

/** Existing Mind Matrix flow — do not rebuild. */
export const MIND_MATRIX_HREF = "/patient/ai-bot/screening"

export const MIND_MATRIX_COPY = {
  title: "Mind Matrix",
  description:
    "A short, 3-minute check-in on how your mind is working right now.",
} as const

/**
 * Preview state: already taken, Steady band, retake allowed.
 * To preview Never Taken: set lastTaken/band/nextAvailableDate to null, canRetake true.
 * To preview Monthly Lock: set canRetake false and nextAvailableDate to a future date.
 */
export const MIND_MATRIX_ASSESSMENT_STATE: MindMatrixAssessmentState = {
  lastTaken: "2026-06-15",
  band: "Steady",
  nextAvailableDate: "2026-07-15",
  canRetake: true,
}

export function resolveAssessmentUiStatus(
  state: MindMatrixAssessmentState
): AssessmentUiStatus {
  if (!state.lastTaken) return "never"
  if (!state.canRetake) return "locked"
  return "taken"
}

export function formatAssessmentDate(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}
