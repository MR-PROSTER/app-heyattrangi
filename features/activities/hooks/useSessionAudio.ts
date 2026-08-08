"use client"

import { useCallback, useEffect, useRef } from "react"
import type { PhaseKind } from "../types"
import {
  adoptSharedAudioContext,
  getSharedAudioContext,
  isSharedAudioUnlocked,
  unlockSharedAudio,
} from "../lib/audioBridge"

export type AudioCueProfile = "box" | "478" | "belly" | "sigh"

/**
 * Soft WebAudio cue tones. AudioContext is created lazily on the first user gesture.
 */
export function useSessionAudio(
  enabled: boolean,
  options?: {
    profile?: AudioCueProfile
    exhaleGuide?: boolean
    bellyGuideTone?: boolean
  }
) {
  const profile = options?.profile ?? "box"
  const exhaleGuide = options?.exhaleGuide ?? false
  const bellyGuideTone = options?.bellyGuideTone ?? false
  const ctxRef = useRef<AudioContext | null>(null)
  const enabledRef = useRef(enabled)
  const guideOscRef = useRef<OscillatorNode | null>(null)
  const guideGainRef = useRef<GainNode | null>(null)
  const bellyPadRef = useRef<{
    osc: OscillatorNode
    gain: GainNode
  } | null>(null)
  const ownsContextRef = useRef(false)

  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

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
      ownsContextRef.current = true
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

  const stopExhaleGuide = useCallback(() => {
    try {
      guideOscRef.current?.stop()
    } catch {
      // already stopped
    }
    guideOscRef.current = null
    guideGainRef.current = null
  }, [])

  const stopBellyPad = useCallback(() => {
    const pad = bellyPadRef.current
    if (!pad) return
    try {
      const ctx = ctxRef.current
      if (ctx) {
        const now = ctx.currentTime
        pad.gain.gain.cancelScheduledValues(now)
        pad.gain.gain.linearRampToValueAtTime(0, now + 0.2)
        pad.osc.stop(now + 0.25)
      } else {
        pad.osc.stop()
      }
    } catch {
      // already stopped
    }
    bellyPadRef.current = null
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
      releaseSec: number
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
        gain.gain.setValueAtTime(0, now)
        gain.gain.linearRampToValueAtTime(peakGain, now + attackSec)
        const releaseStart = Math.max(attackSec, durationSec - releaseSec)
        gain.gain.linearRampToValueAtTime(peakGain, now + releaseStart)
        gain.gain.linearRampToValueAtTime(0, now + durationSec)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + durationSec + 0.02)
      } catch {
        // Never stall the visual on audio failure
      }
    },
    [ensureContext]
  )

  const startExhaleGuide = useCallback(async () => {
    if (!enabledRef.current || !exhaleGuide) return
    const ctx = await ensureContext()
    if (!ctx) return
    stopExhaleGuide()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.value = 180
    const now = ctx.currentTime
    gain.gain.setValueAtTime(0.08, now)
    gain.gain.linearRampToValueAtTime(0, now + 8)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 8.05)
    guideOscRef.current = osc
    guideGainRef.current = gain
  }, [ensureContext, exhaleGuide, stopExhaleGuide])

  const ensureBellyPad = useCallback(async () => {
    if (!enabledRef.current || !bellyGuideTone) return null
    const ctx = await ensureContext()
    if (!ctx) return null
    if (bellyPadRef.current) return bellyPadRef.current
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.value = 220
    gain.gain.value = 0
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    bellyPadRef.current = { osc, gain }
    return bellyPadRef.current
  }, [bellyGuideTone, ensureContext])

  const swellBellyPad = useCallback(
    async (kind: PhaseKind) => {
      if (!bellyGuideTone) return
      const pad = await ensureBellyPad()
      if (!pad || !ctxRef.current) return
      const now = ctxRef.current.currentTime
      pad.gain.gain.cancelScheduledValues(now)
      if (kind === "inhale") {
        pad.gain.gain.setValueAtTime(pad.gain.gain.value, now)
        pad.gain.gain.linearRampToValueAtTime(0.06, now + 0.8)
      } else {
        pad.gain.gain.setValueAtTime(pad.gain.gain.value, now)
        pad.gain.gain.linearRampToValueAtTime(0.01, now + 1.2)
      }
    },
    [bellyGuideTone, ensureBellyPad]
  )

  const cuePhaseKind = useCallback(
    (kind: PhaseKind) => {
      if (profile === "sigh") {
        if (kind === "inhale") void playTone(440, 0.1, 0.5, 0.02, 0.05)
        else if (kind === "exhale") void playTone(294, 0.26, 0.45, 0.02, 0.22)
        return
      }
      if (profile === "belly") {
        if (kind === "inhale") {
          void playTone(396, 0.14, 0.5, 0.03, 0.05)
          void swellBellyPad("inhale")
        } else if (kind === "exhale") {
          void playTone(264, 0.2, 0.5, 0.02, 0.16)
          void swellBellyPad("exhale")
        }
        return
      }
      if (profile === "478") {
        if (kind === "inhale") {
          stopExhaleGuide()
          void playTone(440, 0.12, 0.08, 0.02, 0.1)
        } else if (kind === "hold") {
          stopExhaleGuide()
          void playTone(520, 0.09, 0.048, 0.015, 0.07)
        } else if (kind === "exhale") {
          void playTone(330, 0.22, 0.07, 0.02, 0.18)
          void startExhaleGuide()
        }
        return
      }
      if (kind === "inhale") void playTone(440, 0.12, 0.08, 0.02, 0.1)
      else if (kind === "exhale") void playTone(330, 0.12, 0.08, 0.02, 0.1)
    },
    [
      playTone,
      profile,
      startExhaleGuide,
      stopExhaleGuide,
      swellBellyPad,
    ]
  )

  const cuePhaseId = useCallback(
    (phaseId: string, kind: PhaseKind) => {
      if (profile === "sigh") {
        if (phaseId === "inhale-2") {
          void playTone(660, 0.07, 0.55, 0.01, 0.04)
        } else if (kind === "inhale") {
          void playTone(440, 0.1, 0.5, 0.02, 0.05)
        } else if (kind === "exhale") {
          void playTone(294, 0.26, 0.45, 0.02, 0.22)
        }
        return
      }
      cuePhaseKind(kind)
    },
    [cuePhaseKind, playTone, profile]
  )

  const cuePhase = useCallback(
    (phase: string) => {
      if (phase === "inhale" || phase === "inhale-2") {
        cuePhaseId(phase, "inhale")
      } else if (phase === "exhale") cuePhaseKind("exhale")
      else if (phase === "hold" || phase === "hold-in" || phase === "hold-out") {
        if (profile === "478") cuePhaseKind("hold")
      }
    },
    [cuePhaseId, cuePhaseKind, profile]
  )

  const suspend = useCallback(async () => {
    stopExhaleGuide()
    stopBellyPad()
  }, [stopBellyPad, stopExhaleGuide])

  const resumeAudio = useCallback(async () => {
    if (!enabledRef.current) return
    await ensureContext()
  }, [ensureContext])

  useEffect(() => {
    return () => {
      stopExhaleGuide()
      stopBellyPad()
    }
  }, [stopBellyPad, stopExhaleGuide])

  return {
    unlock,
    cuePhase,
    cuePhaseKind,
    cuePhaseId,
    suspend,
    resumeAudio,
    isUnlocked: () => isSharedAudioUnlocked(),
  }
}
