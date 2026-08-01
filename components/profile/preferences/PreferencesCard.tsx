"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import ProfileCard from "../ui/ProfileCard"
import ProfileHeader from "../ui/ProfileHeader"
import { PROFILE_STACK } from "../ui/profileChrome"
import PreferenceGroup from "./PreferenceGroup"
import PreferenceSelect from "./PreferenceSelect"
import PreferenceToggle from "./PreferenceToggle"
import ReminderScheduler from "./ReminderScheduler"
import { useProfile } from "../ProfileProvider"
import {
  applyAccessibilityPrefs,
  hasThemeSystem,
  PREFERENCE_LANGUAGES,
  readPreferences,
  writePreferences,
  type UserPreferences,
} from "./preferenceStorage"

export default function PreferencesCard() {
  const { user, setSaving: onSavingChange } = useProfile()
  const [prefs, setPrefs] = useState<UserPreferences | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const showAppearance = hasThemeSystem()

  useEffect(() => {
    const loaded = readPreferences(user.id, user.patient?.preferredLanguage)
    setPrefs(loaded)
    applyAccessibilityPrefs(loaded.accessibility)
  }, [user.id, user.patient?.preferredLanguage])

  const persist = useCallback(
    (next: UserPreferences) => {
      writePreferences(next, user.id)
      applyAccessibilityPrefs(next.accessibility)
      onSavingChange(true)
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => onSavingChange(false), 600)
    },
    [onSavingChange, user.id]
  )

  const update = useCallback(
    (updater: (prev: UserPreferences) => UserPreferences) => {
      setPrefs((prev) => {
        if (!prev) return prev
        const next = updater(prev)
        persist(next)
        return next
      })
    },
    [persist]
  )

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [])

  if (!prefs) {
    return (
      <ProfileCard id="preferences" aria-labelledby="preferences-heading">
        <div role="status" aria-busy="true" aria-label="Loading preferences" className="space-y-3">
          <div className="h-5 w-36 rounded-xl bg-gray-100/90 animate-pulse motion-reduce:animate-none" />
          <div className="h-3 w-52 max-w-full rounded-xl bg-gray-100/90 animate-pulse motion-reduce:animate-none" />
          <div className="h-24 w-full rounded-2xl bg-gray-100/90 animate-pulse motion-reduce:animate-none" />
          <span className="sr-only">Loading preferences…</span>
        </div>
      </ProfileCard>
    )
  }

  return (
    <ProfileCard id="preferences" aria-labelledby="preferences-heading">
      <div className={PROFILE_STACK}>
        <ProfileHeader
          titleId="preferences-heading"
          title="Preferences"
          description="Manage your personal experience."
          className="!mb-0"
        />

        <PreferenceGroup
          id="pref-language"
          title="Language"
          description="Choose the language you prefer for your experience."
        >
          <PreferenceSelect
            label="Current Language"
            value={prefs.language}
            options={PREFERENCE_LANGUAGES.map((lang) => ({
              value: lang,
              label: lang,
            }))}
            onChange={(language) => update((p) => ({ ...p, language }))}
          />
        </PreferenceGroup>

        <PreferenceGroup
          id="pref-mood-reminder"
          title="Mood Reminder"
          description="Optional prompts — off by default, yours to shape."
        >
          <ReminderScheduler
            value={prefs.moodReminder}
            onChange={(moodReminder) => update((p) => ({ ...p, moodReminder }))}
          />
        </PreferenceGroup>

        <PreferenceGroup
          id="pref-accessibility"
          title="Accessibility"
          description="Adjust how the app feels and reads."
        >
          <div className="space-y-1 divide-y divide-gray-100">
            <PreferenceToggle
              label="Reduce Motion"
              description="Limit animations and transitions."
              checked={prefs.accessibility.reduceMotion}
              onChange={(reduceMotionPref) =>
                update((p) => ({
                  ...p,
                  accessibility: { ...p.accessibility, reduceMotion: reduceMotionPref },
                }))
              }
            />
            <PreferenceToggle
              label="Larger Text"
              description="Increase base text size for easier reading."
              checked={prefs.accessibility.largerText}
              onChange={(largerText) =>
                update((p) => ({
                  ...p,
                  accessibility: { ...p.accessibility, largerText },
                }))
              }
            />
            <PreferenceToggle
              label="High Contrast"
              description="Strengthen contrast for clearer text and controls."
              checked={prefs.accessibility.highContrast}
              onChange={(highContrast) =>
                update((p) => ({
                  ...p,
                  accessibility: { ...p.accessibility, highContrast },
                }))
              }
            />
          </div>
        </PreferenceGroup>

        {showAppearance ? (
          <PreferenceGroup
            id="pref-appearance"
            title="Appearance"
            description="Choose how Attrangi looks on this device."
          >
            <p className="text-sm text-gray-500 font-medium">Theme options</p>
          </PreferenceGroup>
        ) : null}
      </div>
    </ProfileCard>
  )
}
