"use client"

import { useCallback, useEffect, useRef } from "react"
import {
  adoptSharedAudioContext,
  getSharedAudioContext,
  unlockSharedAudio,
} from "../lib/audioBridge"

export type NatureSoundId = "off" | "rain" | "forest" | "ocean" | "wind"

/**
 * Soft WebAudio ambience beds — no external assets.
 * Tuned filters approximate rain / forest / ocean / wind.
 */
export function useNatureAmbience(
  sound: NatureSoundId,
  enabled: boolean
) {
  const ctxRef = useRef<AudioContext | null>(null)
  const nodesRef = useRef<{
    source: AudioBufferSourceNode
    gain: GainNode
    filter: BiquadFilterNode
  } | null>(null)

  const stop = useCallback(() => {
    const nodes = nodesRef.current
    if (!nodes) return
    try {
      const ctx = ctxRef.current
      const now = ctx?.currentTime ?? 0
      nodes.gain.gain.cancelScheduledValues(now)
      nodes.gain.gain.linearRampToValueAtTime(0, now + 0.4)
      nodes.source.stop(now + 0.45)
    } catch {
      // ignore
    }
    nodesRef.current = null
  }, [])

  const start = useCallback(
    async (id: NatureSoundId) => {
      if (id === "off" || !enabled) {
        stop()
        return
      }
      await unlockSharedAudio()
      const shared = getSharedAudioContext()
      let ctx = shared
      if (!ctx) {
        const AC =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext
        if (!AC) return
        ctx = new AC()
        adoptSharedAudioContext(ctx)
      }
      ctxRef.current = ctx
      if (ctx.state === "suspended") {
        try {
          await ctx.resume()
        } catch {
          return
        }
      }
      stop()

      const len = ctx.sampleRate * 2
      const buffer = ctx.createBuffer(1, len, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      let last = 0
      for (let i = 0; i < len; i++) {
        const white = Math.random() * 2 - 1
        // pink-ish
        last = (last + 0.02 * white) / 1.02
        data[i] = last * 4
      }

      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true
      const filter = ctx.createBiquadFilter()
      const gain = ctx.createGain()
      gain.gain.value = 0

      if (id === "rain") {
        filter.type = "highpass"
        filter.frequency.value = 600
        gain.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 0.5)
      } else if (id === "forest") {
        filter.type = "bandpass"
        filter.frequency.value = 400
        filter.Q.value = 0.7
        gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.5)
      } else if (id === "ocean") {
        filter.type = "lowpass"
        filter.frequency.value = 350
        gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.5)
      } else {
        filter.type = "highpass"
        filter.frequency.value = 200
        gain.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 0.5)
      }

      source.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      source.start()
      nodesRef.current = { source, gain, filter }
    },
    [enabled, stop]
  )

  useEffect(() => {
    void start(sound)
    return () => stop()
  }, [sound, enabled, start, stop])

  return { stop }
}
