"use client"

import { useCallback, useEffect, useRef } from "react"

/**
 * Preloads and plays optional narration clips per region.
 * No-ops cleanly when narrationUrl is undefined — no network requests.
 */
export function useNarration(enabled: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const preloadedRef = useRef<Map<string, HTMLAudioElement>>(new Map())
  const enabledRef = useRef(enabled)

  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  const preload = useCallback((url: string | undefined) => {
    if (!url || typeof window === "undefined") return
    if (preloadedRef.current.has(url)) return
    const a = new Audio()
    a.preload = "auto"
    a.src = url
    preloadedRef.current.set(url, a)
  }, [])

  const stop = useCallback(() => {
    const cur = audioRef.current
    if (cur) {
      try {
        cur.pause()
        cur.currentTime = 0
      } catch {
        // ignore
      }
      audioRef.current = null
    }
  }, [])

  const play = useCallback(
    async (url: string | undefined) => {
      stop()
      if (!url || !enabledRef.current) return
      try {
        const existing = preloadedRef.current.get(url)
        const a = existing ?? new Audio(url)
        if (!existing) preloadedRef.current.set(url, a)
        audioRef.current = a
        await a.play()
      } catch {
        // Missing file / autoplay — silent fallback to tones
      }
    },
    [stop]
  )

  useEffect(() => () => stop(), [stop])

  return { play, preload, stop }
}
