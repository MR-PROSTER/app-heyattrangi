"use client"

import { useCallback, useEffect, useRef } from "react"
import {
  adoptSharedAudioContext,
  getSharedAudioContext,
  isSharedAudioUnlocked,
  unlockSharedAudio,
} from "../lib/audioBridge"

/**
 * Body Scan interim tones + optional pink-noise ambience bed.
 */
export function useScanAudio(enabled: boolean, ambience: boolean) {
  const ctxRef = useRef<AudioContext | null>(null)
  const enabledRef = useRef(enabled)
  const ambienceNodesRef = useRef<{
    source: AudioBufferSourceNode
    gain: GainNode
    filter: BiquadFilterNode
  } | null>(null)

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
      attackSec: number
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
        gain.gain.linearRampToValueAtTime(0, now + durationSec)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + durationSec + 0.02)
      } catch {
        // never stall
      }
    },
    [ensureContext]
  )

  /** Region transition: 528Hz, 200ms, 0.35 gain, 60ms attack */
  const cueRegion = useCallback(() => {
    void playTone(528, 0.2, 0.35, 0.06)
  }, [playTone])

  /** Anchor return: 396Hz, 300ms */
  const cueAnchor = useCallback(() => {
    void playTone(396, 0.3, 0.35, 0.05)
  }, [playTone])

  /** Session end: 440→330 over 900ms */
  const cueSessionEnd = useCallback(async () => {
    if (!enabledRef.current) return
    try {
      const ctx = await ensureContext()
      if (!ctx || ctx.state !== "running") return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      const now = ctx.currentTime
      osc.frequency.setValueAtTime(440, now)
      osc.frequency.linearRampToValueAtTime(330, now + 0.9)
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.3, now + 0.06)
      gain.gain.linearRampToValueAtTime(0, now + 0.9)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.92)
    } catch {
      // ignore
    }
  }, [ensureContext])

  const stopAmbience = useCallback(() => {
    const nodes = ambienceNodesRef.current
    if (!nodes) return
    try {
      nodes.gain.gain.linearRampToValueAtTime(0, (ctxRef.current?.currentTime ?? 0) + 0.3)
      nodes.source.stop((ctxRef.current?.currentTime ?? 0) + 0.35)
    } catch {
      // ignore
    }
    ambienceNodesRef.current = null
  }, [])

  const startAmbience = useCallback(async () => {
    if (!enabledRef.current || !ambience) return
    const ctx = await ensureContext()
    if (!ctx || ctx.state !== "running") return
    stopAmbience()
    // Filtered noise buffer (~2s loop)
    const len = ctx.sampleRate * 2
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let last = 0
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1
      // crude pink-ish filter
      last = (last + 0.02 * white) / 1.02
      data[i] = last * 3.5
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    const filter = ctx.createBiquadFilter()
    filter.type = "lowpass"
    filter.frequency.value = 800
    const gain = ctx.createGain()
    gain.gain.value = 0.04
    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    source.start()
    ambienceNodesRef.current = { source, gain, filter }
  }, [ambience, ensureContext, stopAmbience])

  useEffect(() => {
    if (ambience && enabled) {
      void startAmbience()
    } else {
      stopAmbience()
    }
    return () => stopAmbience()
  }, [ambience, enabled, startAmbience, stopAmbience])

  return {
    unlock,
    cueRegion,
    cueAnchor,
    cueSessionEnd,
    isUnlocked: () => isSharedAudioUnlocked(),
  }
}
