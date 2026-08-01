"use client"

import { useEffect, useState } from "react"
import { toast, Toaster } from "sonner"
import SettingsToggle from "../SettingsToggle"
import SettingsInput from "../SettingsInput"
import {
  DEFAULT_PREFERENCES,
  readPreferences,
  writePreferences,
  type MoodReminderPrefs,
} from "@/components/profile/preferences/preferenceStorage"

interface NotificationsSettingsProps {
  userId: string
}

/** Mood Reminder only — default OFF; times shown when enabled. */
export default function NotificationsSettings({ userId }: NotificationsSettingsProps) {
  const [mood, setMood] = useState<MoodReminderPrefs>(DEFAULT_PREFERENCES.moodReminder)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const prefs = readPreferences(userId)
    setMood({ ...DEFAULT_PREFERENCES.moodReminder, ...prefs.moodReminder })
    setReady(true)
  }, [userId])

  const persist = (next: MoodReminderPrefs) => {
    const previous = mood
    setMood(next)
    try {
      const prefs = readPreferences(userId)
      writePreferences({ ...prefs, moodReminder: next }, userId)
    } catch {
      setMood(previous)
      toast.error("Couldn't update reminder preference")
    }
  }

  if (!ready) {
    return (
      <div className="pt-2" aria-busy="true">
        <div className="h-16 rounded-[var(--radius-xl)] bg-[var(--color-border)] animate-pulse motion-reduce:animate-none" />
      </div>
    )
  }

  return (
    <div className="space-y-4 pt-2">
      <Toaster position="top-center" richColors closeButton />

      <SettingsToggle
        label="Mood Reminder"
        checked={mood.enabled}
        onChange={(enabled) => persist({ ...mood, enabled })}
      />

      {mood.enabled ? (
        <div className="space-y-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <SettingsInput
            label="Reminder Time"
            type="time"
            value={mood.reminderTime}
            onChange={(e) => persist({ ...mood, reminderTime: e.target.value })}
          />
          <SettingsInput
            label="Quiet Hours Start"
            type="time"
            value={mood.quietStart}
            onChange={(e) => persist({ ...mood, quietStart: e.target.value })}
          />
          <SettingsInput
            label="Quiet Hours End"
            type="time"
            value={mood.quietEnd}
            onChange={(e) => persist({ ...mood, quietEnd: e.target.value })}
          />
        </div>
      ) : null}
    </div>
  )
}
