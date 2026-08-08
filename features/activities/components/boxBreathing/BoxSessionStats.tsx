"use client"

import type { BreathingEngineState } from "../../hooks/usePacedTimeline"
import { formatDuration } from "../../lib/formatDuration"

interface BoxSessionStatsProps {
  engine: BreathingEngineState
  plannedCycles: number
}

/** Cycle progress + elapsed time under instructions. */
export function BoxSessionStats({
  engine,
  plannedCycles,
}: BoxSessionStatsProps) {
  const unlimited = plannedCycles <= 0
  const cycleLabel = unlimited
    ? `Cycle ${engine.cycle}`
    : `Cycle ${Math.min(engine.cycle, plannedCycles)} of ${plannedCycles}`

  const sessionPct = unlimited
    ? null
    : Math.min(
        100,
        Math.round(
          ((engine.cyclesCompleted + engine.cycleProgress) / plannedCycles) *
            100
        )
      )

  return (
    <div
      className="mx-auto mt-2 w-full max-w-xs text-center"
      data-testid="box-session-stats"
    >
      <p className="text-sm font-medium text-ink-muted">{cycleLabel}</p>
      <p className="mt-0.5 text-xs text-ink-subtle">
        {formatDuration(engine.elapsedMs)} · {engine.cyclesCompleted} completed
        {sessionPct != null ? ` · ${sessionPct}%` : null}
      </p>
      {!unlimited ? (
        <div
          className="mt-2 h-1 w-full overflow-hidden rounded-full bg-hairline"
          role="progressbar"
          aria-valuenow={sessionPct ?? 0}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Session progress"
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
            style={{ width: `${sessionPct ?? 0}%` }}
          />
        </div>
      ) : null}
    </div>
  )
}
