"use client"

import { useCallback, useEffect, useRef } from "react"
import {
  adoptSharedAudioContext,
  getSharedAudioContext,
  isSharedAudioUnlocked,
  unlockSharedAudio,
} from "../lib/audioBridge"

/**
 * Micro Movement cue tones — distinct step-start / advisory-chime / session-end.
 */
export function useMicroMovementAudio(enabled: boolean, gainScale = 1) {
  const ctxRef = useRef<AudioContext | null>(null)
  const enabledRef = useRef(enabled)
  const gainRef = useRef(gainScale)

  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  useEffect(() => {
    gainRef.current = gainScale
  }, [gainScale])

  const ensureContext = useCallback(async () => {
    if (typeof window === "undefined") return null
    const shared = getSharedAudioContext()
    if (shared) {
      ctxRef.current = shared
      if (shared.state === "suspended") {
        try {
          await shared.resume()
        } catch {
          // ignore
        }
      }
      return shared
    }
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    if (!AC) return null
    if (!ctxRef.current) {
      ctxRef.current = new AC()
      adoptSharedAudioContext(ctxRef.current)
    }
    if (ctxRef.current.state === "suspended") {
      try {
        await ctxRef.current.resume()
      } catch {
        // ignore
      }
    }
    return ctxRef.current
  }, [])

  const unlock = useCallback(async () => {
    const ok = await unlockSharedAudio()
    if (ok) {
      ctxRef.current = getSharedAudioContext()
      return true
    }
    await ensureContext()
    return isSharedAudioUnlocked()
  }, [ensureContext])

  const playTone = useCallback(
    async (
      freq: number,
      durationSec: number,
      peakGain: number,
      attackSec: number,
      releaseSec = 0.08
    ) => {
      if (!enabledRef.current) return
      try {
        const ctx = await ensureContext()
        if (!ctx || ctx.state !== "running") return
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = "sine"
        osc.frequency.value = freq
        const now = ctx.currentTime
        const peak = peakGain * gainRef.current
        gain.gain.setValueAtTime(0, now)
        gain.gain.linearRampToValueAtTime(peak, now + attackSec)
        const releaseStart = Math.max(attackSec, durationSec - releaseSec)
        gain.gain.linearRampToValueAtTime(peak, now + releaseStart)
        gain.gain.linearRampToValueAtTime(0, now + durationSec)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + durationSec + 0.02)
      } catch {
        // never stall visuals
      }
    },
    [ensureContext]
  )

  /** Soft 528Hz sine, 180ms, 0.45 gain, 40ms attack */
  const cueStepStart = useCallback(() => {
    void playTone(528, 0.18, 0.45, 0.04)
  }, [playTone])

  /** 396Hz, 220ms, 0.4 gain — advisory complete */
  const cueAdvisoryComplete = useCallback(() => {
    void playTone(396, 0.22, 0.4, 0.03)
  }, [playTone])

  /** Two-tone fall 440→330, 600ms total */
  const cueSessionEnd = useCallback(async () => {
    if (!enabledRef.current) return
    try {
      const ctx = await ensureContext()
      if (!ctx || ctx.state !== "running") return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      const now = ctx.currentTime
      const peak = 0.35 * gainRef.current
      osc.frequency.setValueAtTime(440, now)
      osc.frequency.linearRampToValueAtTime(330, now + 0.6)
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(peak, now + 0.05)
      gain.gain.linearRampToValueAtTime(0, now + 0.6)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.62)
    } catch {
      // ignore
    }
  }, [ensureContext])

  return {
    unlock,
    cueStepStart,
    cueAdvisoryComplete,
    cueSessionEnd,
    isUnlocked: () => isSharedAudioUnlocked(),
  }
}
