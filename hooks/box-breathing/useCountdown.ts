"use client"

import { useCallback, useEffect, useRef, useState } from "react"

interface UseCountdownOptions {
  seconds: number
  /** Called once the countdown reaches zero and has held briefly. */
  onComplete?: () => void
  /** How long to hold on "0" (rendered as the final beat) before firing onComplete. */
  holdMs?: number
}

/** Generic drift-tolerant countdown, reused for the pre-session 3-2-1 and any other numeric countdowns. */
export function useCountdown({ seconds, onComplete, holdMs = 550 }: UseCountdownOptions) {
  const [count, setCount] = useState(seconds)
  const [isRunning, setIsRunning] = useState(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (!isRunning) return

    if (count > 0) {
      const id = setTimeout(() => setCount((c) => c - 1), 1000)
      return () => clearTimeout(id)
    }

    const id = setTimeout(() => {
      setIsRunning(false)
      onCompleteRef.current?.()
    }, holdMs)
    return () => clearTimeout(id)
  }, [isRunning, count, holdMs])

  const start = useCallback(() => {
    setCount(seconds)
    setIsRunning(true)
  }, [seconds])

  const reset = useCallback(() => {
    setIsRunning(false)
    setCount(seconds)
  }, [seconds])

  return { count, isRunning, start, reset }
}
