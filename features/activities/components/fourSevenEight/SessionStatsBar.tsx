"use client"

import type { BreathingEngineState } from "../../hooks/usePacedTimeline"
import { formatDuration } from "../../lib/formatDuration"

interface SessionStatsBarProps {
  engine: BreathingEngineState
  plannedCycles: number
}

const PHASE_COPY: Record<string, string> = {
  inhale: "Inhale slowly",
  hold: "Hold your breath",
  exhale: "Exhale gently",
}

/** Live session stats — keyboard-friendly, no clock-watching pressure in the visualizer. */
export function SessionStatsBar({
  engine,
  plannedCycles,
}: SessionStatsBarProps) {
  const kind = engine.phaseSpec.kind
  const unlimited = plannedCycles <= 0
  const progressLabel = unlimited
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
      className="mx-auto mb-4 w-full max-w-sm rounded-2xl border border-hairline bg-surface/90 px-4 py-3 text-center backdrop-blur-sm"
      aria-live="polite"
      data-testid="session-stats"
    >
      <p className="text-lg font-medium text-ink">
        {PHASE_COPY[kind] ?? engine.phaseSpec.label}
      </p>
      <p className="mt-1 text-sm tabular-nums text-ink-muted">
        {engine.phaseRemaining}s remaining · {progressLabel}
      </p>
      <p className="mt-0.5 text-xs text-ink-subtle">
        {formatDuration(engine.elapsedMs)} elapsed · {engine.cyclesCompleted}{" "}
        completed
        {sessionPct != null ? ` · ${sessionPct}% session` : null}
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
