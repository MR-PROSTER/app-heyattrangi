"use client"

import { useCallback, useEffect, useRef } from "react"
import type { PhaseKind } from "../types"

const PHASE_START: Record<PhaseKind, string> = {
  inhale: "Breathe in",
  hold: "Hold",
  exhale: "Breathe out",
}

export interface BoxSpeechOptions {
  enabled: boolean
  rate?: number
  volume?: number
  voiceURI?: string | null
}

/**
 * Box breathing voice guide — phase cues plus counting 2…N during each side.
 * Syncs with the breathing engine via phase + remaining seconds.
 */
export function useBoxSpeechGuide(options: BoxSpeechOptions) {
  const optsRef = useRef(options)
  const lastPhaseKeyRef = useRef<string | null>(null)
  const lastCountRef = useRef<number | null>(null)
  const beganRef = useRef(false)

  useEffect(() => {
    optsRef.current = options
    if (!options.enabled && typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }, [options])

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const speak = useCallback((text: string) => {
    const { enabled, rate = 0.92, volume = 0.85, voiceURI } = optsRef.current
    if (!enabled) return
    if (typeof window === "undefined" || !window.speechSynthesis) return
    try {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.rate = rate
      u.pitch = 1
      u.volume = volume
      if (voiceURI) {
        const voice = window.speechSynthesis
          .getVoices()
          .find((v) => v.voiceURI === voiceURI)
        if (voice) u.voice = voice
      }
      window.speechSynthesis.speak(u)
    } catch {
      // ignore
    }
  }, [])

  const speakBegin = useCallback(() => {
    if (beganRef.current) return
    beganRef.current = true
    speak("Let's begin.")
  }, [speak])

  const syncPhase = useCallback(
    (
      kind: PhaseKind,
      phaseKey: string,
      phaseSeconds: number,
      remaining: number,
      running: boolean
    ) => {
      if (!running) return

      if (lastPhaseKeyRef.current !== phaseKey) {
        lastPhaseKeyRef.current = phaseKey
        lastCountRef.current = null
        speak(PHASE_START[kind])
        return
      }

      const elapsed = phaseSeconds - remaining
      if (elapsed >= 2 && elapsed <= phaseSeconds) {
        const count = elapsed
        if (lastCountRef.current === count) return
        lastCountRef.current = count
        speak(String(count))
      }
    },
    [speak]
  )

  const reset = useCallback(() => {
    lastPhaseKeyRef.current = null
    lastCountRef.current = null
    beganRef.current = false
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }, [])

  const mute = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }, [])

  return {
    speakBegin,
    syncPhase,
    reset,
    mute,
    supported:
      typeof window !== "undefined" && !!window.speechSynthesis,
  }
}
