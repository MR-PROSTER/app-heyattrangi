/**
 * Dashboard Profile display helpers — pure, memoization-friendly.
 */

export type StreakDotState = "filled" | "today" | "empty"

/** Spec: always show week count (including 0 Weeks). */
export function streakWeeksFromDays(streakDays: number): number {
  const safe = Number.isFinite(streakDays) ? Math.max(0, Math.floor(streakDays)) : 0
  return Math.floor(safe / 7)
}

/** 4×7 activity dots derived from consecutive streak days (visual only). */
export function buildStreakDots(streakDays: number, cells = 28): StreakDotState[] {
  const safe = Number.isFinite(streakDays) ? Math.max(0, Math.floor(streakDays)) : 0
  const active = Math.min(safe, cells)
  return Array.from({ length: cells }, (_, i) => {
    const dayFromEnd = cells - 1 - i
    if (dayFromEnd === 0) return "today"
    if (dayFromEnd < active) return "filled"
    return "empty"
  })
}

export function isEmailVerified(emailVerified: Date | string | null | undefined): boolean {
  if (!emailVerified) return false
  const d = typeof emailVerified === "string" ? new Date(emailVerified) : emailVerified
  return !Number.isNaN(d.getTime())
}
