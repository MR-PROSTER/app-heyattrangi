/**
 * Client preference storage for Profile → Preferences.
 * No backend — mirrors VideoSettings localStorage pattern.
 */

export const PREFERENCE_LANGUAGES = [
  "English",
  "Hindi",
  "Telugu",
  "Tamil",
  "Kannada",
  "Malayalam",
  "Marathi",
  "Gujarati",
  "Bengali",
  "Urdu",
] as const

export type PreferenceLanguage = (typeof PREFERENCE_LANGUAGES)[number]

export type WeekdayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"

export const WEEKDAYS: { key: WeekdayKey; label: string }[] = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
]

export interface MoodReminderPrefs {
  enabled: boolean
  reminderTime: string
  quietStart: string
  quietEnd: string
  weekdays: WeekdayKey[]
  repeat: boolean
}

export interface AccessibilityPrefs {
  reduceMotion: boolean
  largerText: boolean
  highContrast: boolean
}

export interface UserPreferences {
  language: string
  moodReminder: MoodReminderPrefs
  accessibility: AccessibilityPrefs
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  language: "English",
  moodReminder: {
    enabled: false,
    reminderTime: "09:00",
    quietStart: "22:00",
    quietEnd: "07:00",
    weekdays: ["mon", "tue", "wed", "thu", "fri"],
    repeat: true,
  },
  accessibility: {
    reduceMotion: false,
    largerText: false,
    highContrast: false,
  },
}

function storageKey(userId?: string | null) {
  return userId ? `heyattrangi_preferences_${userId}` : "heyattrangi_preferences"
}

export function readPreferences(
  userId?: string | null,
  seedLanguage?: string | null
): UserPreferences {
  const base: UserPreferences = {
    ...DEFAULT_PREFERENCES,
    language:
      seedLanguage && PREFERENCE_LANGUAGES.includes(seedLanguage as PreferenceLanguage)
        ? seedLanguage
        : DEFAULT_PREFERENCES.language,
    moodReminder: { ...DEFAULT_PREFERENCES.moodReminder },
    accessibility: { ...DEFAULT_PREFERENCES.accessibility },
  }

  if (typeof window === "undefined") return base

  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return base
    const parsed = JSON.parse(raw) as Partial<UserPreferences>
    return {
      language: parsed.language || base.language,
      moodReminder: {
        ...base.moodReminder,
        ...(parsed.moodReminder || {}),
        weekdays: parsed.moodReminder?.weekdays?.length
          ? parsed.moodReminder.weekdays
          : base.moodReminder.weekdays,
      },
      accessibility: {
        ...base.accessibility,
        ...(parsed.accessibility || {}),
      },
    }
  } catch {
    return base
  }
}

export function writePreferences(prefs: UserPreferences, userId?: string | null) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(prefs))
  } catch {
    /* ignore quota */
  }
}

/** Apply accessibility prefs to the document (local-only, no theme system). */
export function applyAccessibilityPrefs(a11y: AccessibilityPrefs) {
  if (typeof document === "undefined") return
  const root = document.documentElement
  root.classList.toggle("pref-reduce-motion", a11y.reduceMotion)
  root.classList.toggle("pref-larger-text", a11y.largerText)
  root.classList.toggle("pref-high-contrast", a11y.highContrast)
  root.style.setProperty(
    "scroll-behavior",
    a11y.reduceMotion ? "auto" : ""
  )
}

/** True only when an app-level theme switcher exists. */
export function hasThemeSystem(): boolean {
  return false
}
