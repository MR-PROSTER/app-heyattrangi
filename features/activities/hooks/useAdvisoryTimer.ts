"use client"

/* Advisory dwell timer — same pause accounting pattern as usePacedTimeline. */

import { useCallback, useEffect, useRef, useState } from "react"
import { useMotionValue, type MotionValue } from "framer-motion"

export interface AdvisoryTimerState {
  /** 0→1 progress through suggestedSeconds */
  progress: number
  progressMv: MotionValue<number>
  complete: boolean
  remainingMs: number
  paused: boolean
  pause: () => void
  resume: () => void
  restart: () => void
}

/**
 * Lossless pause/resume advisory timer. Never auto-advances a session —
 * consumers listen to `complete` for chimes only.
 *
 * `running` gates the rAF loop without resetting. Identity of
 * `suggestedSeconds` (plus optional `resetKey`) restarts the timer.
 */
export function useAdvisoryTimer(
  suggestedSeconds: number | undefined,
  opts?: {
    /** When false, the loop stops but progress is preserved (use for pause). */
    running?: boolean
    /** Change this to force a restart (e.g. step id). */
    resetKey?: string | number
    onComplete?: () => void
  }
): AdvisoryTimerState {
  const running = opts?.running ?? true
  const resetKey = opts?.resetKey
  const durationMs = (suggestedSeconds ?? 0) * 1000
  const progressMv = useMotionValue(0)
  const [progress, setProgress] = useState(0)
  const [complete, setComplete] = useState(false)
  const [paused, setPaused] = useState(false)
  const [remainingMs, setRemainingMs] = useState(durationMs)

  const startedAtRef = useRef(0)
  const pauseAccumulatedRef = useRef(0)
  const pauseStartedRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const completedRef = useRef(false)
  const onCompleteRef = useRef(opts?.onComplete)
  onCompleteRef.current = opts?.onComplete

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const getElapsed = useCallback((now: number) => {
    const pauseExtra =
      pauseStartedRef.current !== null ? now - pauseStartedRef.current : 0
    return Math.max(
      0,
      now - startedAtRef.current - pauseAccumulatedRef.current - pauseExtra
    )
  }, [])

  const tick = useCallback(() => {
    if (!durationMs || completedRef.current) return
    const now = performance.now()
    const elapsed = getElapsed(now)
    const p = Math.min(1, elapsed / durationMs)
    progressMv.set(p)
    const rem = Math.max(0, durationMs - elapsed)
    setProgress(p)
    setRemainingMs(rem)
    if (p >= 1 && !completedRef.current) {
      completedRef.current = true
      setComplete(true)
      stopLoop()
      onCompleteRef.current?.()
      return
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [durationMs, getElapsed, progressMv, stopLoop])

  const restart = useCallback(() => {
    stopLoop()
    completedRef.current = false
    pauseAccumulatedRef.current = 0
    pauseStartedRef.current = null
    startedAtRef.current = performance.now()
    progressMv.set(0)
    setProgress(0)
    setComplete(false)
    setPaused(false)
    setRemainingMs(durationMs)
  }, [durationMs, progressMv, stopLoop])

  const pause = useCallback(() => {
    if (pauseStartedRef.current !== null || completedRef.current) return
    pauseStartedRef.current = performance.now()
    setPaused(true)
    stopLoop()
  }, [stopLoop])

  const resume = useCallback(() => {
    if (pauseStartedRef.current === null) return
    pauseAccumulatedRef.current +=
      performance.now() - pauseStartedRef.current
    pauseStartedRef.current = null
    setPaused(false)
  }, [])

  // Restart when duration / step identity changes
  useEffect(() => {
    if (!durationMs) {
      stopLoop()
      progressMv.set(0)
      setProgress(0)
      setComplete(false)
      setRemainingMs(0)
      completedRef.current = false
      return
    }
    restart()
    return () => stopLoop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedSeconds, resetKey, durationMs])

  // Drive the loop from running + paused state without resetting
  useEffect(() => {
    if (!durationMs || completedRef.current) {
      stopLoop()
      return
    }
    if (!running) {
      if (pauseStartedRef.current === null && !completedRef.current) {
        pauseStartedRef.current = performance.now()
        setPaused(true)
      }
      stopLoop()
      return
    }
    // running again
    if (pauseStartedRef.current !== null) {
      pauseAccumulatedRef.current +=
        performance.now() - pauseStartedRef.current
      pauseStartedRef.current = null
      setPaused(false)
    }
    stopLoop()
    rafRef.current = requestAnimationFrame(tick)
    return () => stopLoop()
  }, [running, durationMs, tick, stopLoop, suggestedSeconds, resetKey])

  useEffect(() => () => stopLoop(), [stopLoop])

  return {
    progress,
    progressMv,
    complete,
    remainingMs,
    paused,
    pause,
    resume,
    restart,
  }
}
