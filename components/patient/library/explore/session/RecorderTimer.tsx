"use client"

import { formatElapsed } from "@/components/patient/library/explore/session/SessionState"

interface RecorderTimerProps {
  elapsedMs: number
  isPaused: boolean
}

export default function RecorderTimer({
  elapsedMs,
  isPaused,
}: RecorderTimerProps) {
  return (
    <time
      dateTime={`PT${Math.floor(elapsedMs / 1000)}S`}
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Elapsed time ${formatElapsed(elapsedMs)}${isPaused ? ", paused" : ""}`}
      className={`tabular-nums text-sm font-bold tracking-wide ${
        isPaused ? "text-slate-400" : "text-slate-700"
      }`}
    >
      {formatElapsed(elapsedMs)}
    </time>
  )
}
