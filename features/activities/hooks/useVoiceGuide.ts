"use client"

import { useCallback, useEffect, useRef } from "react"
import type { PhaseKind } from "../types"

const PHRASE: Record<PhaseKind, string> = {
  inhale: "Breathe in",
  hold: "Hold",
  exhale: "Breathe out",
}

/**
 * Optional spoken phase cues via SpeechSynthesis.
 * No-ops when unsupported or disabled. Cancels pending speech on cleanup.
 */
export function useVoiceGuide(enabled: boolean) {
  const enabledRef = useRef(enabled)
  const lastKeyRef = useRef<string | null>(null)

  useEffect(() => {
    enabledRef.current = enabled
    if (!enabled && typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }, [enabled])

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const speakPhase = useCallback((kind: PhaseKind, key: string) => {
    if (!enabledRef.current) return
    if (typeof window === "undefined" || !window.speechSynthesis) return
    if (lastKeyRef.current === key) return
    lastKeyRef.current = key
    try {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(PHRASE[kind])
      u.rate = 0.9
      u.pitch = 1
      u.volume = 0.85
      window.speechSynthesis.speak(u)
    } catch {
      // ignore
    }
  }, [])

  const mute = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }, [])

  return { speakPhase, mute, supported: typeof window !== "undefined" && !!window.speechSynthesis }
}
