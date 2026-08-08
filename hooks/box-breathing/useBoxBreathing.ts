"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { BoxBreathingEngine, PHASE_META } from "@/utils/box-breathing/breathingEngine"
import type { BreathingSettings, BreathingSnapshot } from "@/utils/box-breathing/types"

interface UseBoxBreathingArgs {
  settings: BreathingSettings
  onSpeak: (text: string) => void
  onStopSpeech: () => void
}

/**
 * Owns a BoxBreathingEngine instance for the lifetime of the component, mirrors its
 * snapshot into React state, and fires voice cues / haptic pulses / tab-visibility
 * auto-pause off the engine's events.
 */
export function useBoxBreathing({ settings, onSpeak, onStopSpeech }: UseBoxBreathingArgs) {
  const engineRef = useRef<BoxBreathingEngine | null>(null)
  if (!engineRef.current) {
    engineRef.current = new BoxBreathingEngine({
      phaseDurationSec: settings.phaseDurationSec,
      totalCycles: settings.totalCycles,
    })
  }

  const [snapshot, setSnapshot] = useState<BreathingSnapshot>(() => engineRef.current!.getSnapshot())
  const lastSpokenSecondRef = useRef<number | null>(null)
  const wasAutoPausedRef = useRef(false)
  const hapticsEnabledRef = useRef(settings.hapticsEnabled)
  hapticsEnabledRef.current = settings.hapticsEnabled

  useEffect(() => {
    const engine = engineRef.current!
    const unsubscribe = engine.subscribe((snap, event) => {
      setSnapshot(snap)

      if (event.type === "phase") {
        lastSpokenSecondRef.current = null
        onSpeak(PHASE_META[snap.phase].voiceLabel)
        if (hapticsEnabledRef.current && typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate(snap.phase === "inhale" || snap.phase === "exhale" ? 40 : 15)
        }
      }

      if (event.type === "tick" && snap.secondsRemaining !== snap.phaseDurationSec) {
        if (lastSpokenSecondRef.current !== snap.secondsRemaining) {
          lastSpokenSecondRef.current = snap.secondsRemaining
          const spokenCount = snap.phaseDurationSec - snap.secondsRemaining + 1
          onSpeak(String(spokenCount))
        }
      }

      if (event.type === "completed") {
        onSpeak("Well done. You've completed your breathing exercise.")
      }
    })
    return () => {
      unsubscribe()
      engine.destroy()
    }
    // Engine is created once and lives for the component's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    engineRef.current?.updateConfig({
      phaseDurationSec: settings.phaseDurationSec,
      totalCycles: settings.totalCycles,
    })
  }, [settings.phaseDurationSec, settings.totalCycles])

  useEffect(() => {
    function handleVisibility() {
      const engine = engineRef.current
      if (!engine) return
      if (document.hidden) {
        if (engine.getSnapshot().status === "running") {
          wasAutoPausedRef.current = true
          engine.pause()
          onStopSpeech()
        }
      } else if (wasAutoPausedRef.current) {
        wasAutoPausedRef.current = false
        engine.resume()
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [onStopSpeech])

  const start = useCallback(() => engineRef.current?.start(), [])
  const pause = useCallback(() => {
    engineRef.current?.pause()
    onStopSpeech()
  }, [onStopSpeech])
  const resume = useCallback(() => engineRef.current?.resume(), [])
  const restart = useCallback(() => {
    onStopSpeech()
    engineRef.current?.restart()
  }, [onStopSpeech])

  return { snapshot, start, pause, resume, restart }
}
