"use client"

import { useCallback, useEffect, useState } from "react"
import { BreathingSettings, DEFAULT_SETTINGS } from "@/utils/box-breathing/types"

const STORAGE_KEY = "box-breathing:settings:v1"

function loadSettings(): BreathingSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch {
    return DEFAULT_SETTINGS
  }
}

/** Persists user preferences (durations, voice, motion, etc.) to localStorage. */
export function useBreathingSettings() {
  const [settings, setSettings] = useState<BreathingSettings>(DEFAULT_SETTINGS)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setSettings(loadSettings())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // Private browsing / quota exceeded — preferences just won't persist.
    }
  }, [settings, hydrated])

  const updateSettings = useCallback((partial: Partial<BreathingSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }))
  }, [])

  return { settings, updateSettings, hydrated }
}
