"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/**
 * Counts upward elapsed active time. Pause freezes; resume continues.
 */
export function useSessionTimer(isRunning: boolean) {
  const [elapsedMs, setElapsedMs] = useState(0)
  const accumulatedRef = useRef(0)
  const startedAtRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  const tick = useCallback(() => {
    if (startedAtRef.current == null) return
    const now = performance.now()
    setElapsedMs(accumulatedRef.current + (now - startedAtRef.current))
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    if (isRunning) {
      startedAtRef.current = performance.now()
      rafRef.current = requestAnimationFrame(tick)
    } else if (startedAtRef.current != null) {
      accumulatedRef.current += performance.now() - startedAtRef.current
      startedAtRef.current = null
      setElapsedMs(accumulatedRef.current)
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }

    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [isRunning, tick])

  const reset = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    startedAtRef.current = null
    accumulatedRef.current = 0
    setElapsedMs(0)
  }, [])

  return { elapsedMs, reset }
}
