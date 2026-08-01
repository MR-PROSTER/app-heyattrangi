/**
 * Supported app languages — server source of truth for Settings → Language.
 */
export const SETTINGS_LANGUAGES = [
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

export type SettingsLanguage = (typeof SETTINGS_LANGUAGES)[number]

export function isSettingsLanguage(value: string): value is SettingsLanguage {
  return (SETTINGS_LANGUAGES as readonly string[]).includes(value)
}

export function listSettingsLanguages(): SettingsLanguage[] {
  return [...SETTINGS_LANGUAGES]
}
