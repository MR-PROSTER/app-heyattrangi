"use client"

import { useCallback, useEffect, useRef } from "react"
import type { PhaseKind } from "../types"

const PHASE_START: Record<PhaseKind, string> = {
  inhale: "Breathe in slowly through your nose",
  hold: "Hold your breath gently",
  exhale: "Exhale slowly through your mouth",
}

const INTRO_TEXT =
  "Let's begin. Breathe in for four seconds, hold for seven, then exhale for eight."

export interface FourSevenEightSpeechOptions {
  enabled: boolean
  rate?: number
  volume?: number
  voiceURI?: string | null
}

/**
 * 4-7-8 voice guide — a spoken intro on the first cycle, full instructional
 * phrasing at the start of each phase, then counting 2…N through it.
 */
export function use478SpeechGuide(options: FourSevenEightSpeechOptions) {
  const optsRef = useRef(options)
  const lastPhaseKeyRef = useRef<string | null>(null)
  const lastCountRef = useRef<number | null>(null)
  const beganRef = useRef(false)
  // While the spoken intro is still playing, phase cues wait rather than
  // cutting it off — the intro finishes, then the first "Breathe in" follows.
  const introPendingRef = useRef(false)

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

  const speak = useCallback(
    (text: string, opts?: { keepQueue?: boolean; onEnd?: () => void }) => {
      const { enabled, rate = 0.92, volume = 0.85, voiceURI } = optsRef.current
      if (!enabled) return
      if (typeof window === "undefined" || !window.speechSynthesis) return
      try {
        if (!opts?.keepQueue) window.speechSynthesis.cancel()
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
        if (opts?.onEnd) u.onend = opts.onEnd
        window.speechSynthesis.speak(u)
      } catch {
        // ignore
      }
    },
    []
  )

  const speakBegin = useCallback(() => {
    if (beganRef.current) return
    beganRef.current = true
    introPendingRef.current = true
    speak(INTRO_TEXT, {
      onEnd: () => {
        introPendingRef.current = false
      },
    })
    // Speech synthesis can silently fail to fire onend (unsupported voices,
    // tab backgrounded); don't let phase cues stay muted forever.
    window.setTimeout(() => {
      introPendingRef.current = false
    }, 6000)
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
      if (introPendingRef.current) return

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
    introPendingRef.current = false
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
    supported: typeof window !== "undefined" && !!window.speechSynthesis,
  }
}
