export const MOOD_NOTE_CHAR_LIMIT = {
  FREE: 1000,
  PREMIUM: 2000,
} as const

export const MOOD_CHECKIN_DAILY_LIMIT = {
  FREE: 10,
  PREMIUM: 20,
} as const

export const MOOD_CHECKIN_REQUESTS_PER_MINUTE = {
  FREE: 5,
  PREMIUM: 10,
} as const

export const MOOD_RATE_LIMIT_WINDOW_MS = 60 * 1000
export const MOOD_DAILY_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000

export function isPremiumMoodPlan(plan?: string | null) {
  return plan === "PREMIUM" || plan === "ORGANIZATION"
}

export function getMoodNoteLimit(plan?: string | null) {
  return isPremiumMoodPlan(plan) ? MOOD_NOTE_CHAR_LIMIT.PREMIUM : MOOD_NOTE_CHAR_LIMIT.FREE
}

export function getMoodDailyLimit(plan?: string | null) {
  return isPremiumMoodPlan(plan) ? MOOD_CHECKIN_DAILY_LIMIT.PREMIUM : MOOD_CHECKIN_DAILY_LIMIT.FREE
}

export function getMoodRateLimit(plan?: string | null) {
  return isPremiumMoodPlan(plan)
    ? MOOD_CHECKIN_REQUESTS_PER_MINUTE.PREMIUM
    : MOOD_CHECKIN_REQUESTS_PER_MINUTE.FREE
}
