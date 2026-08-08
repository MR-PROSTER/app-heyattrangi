"use client"

interface CycleProgressProps {
  cycle: number
  totalCycles: number
}

export function CycleProgress({ cycle, totalCycles }: CycleProgressProps) {
  const unlimited = totalCycles <= 0
  const pct = unlimited
    ? 0
    : Math.min(100, Math.max(0, (cycle / totalCycles) * 100))

  return (
    <div className="mx-auto w-full max-w-xs px-4">
      <p className="mb-2 text-center text-sm text-ink-subtle">
        {unlimited ? `Cycle ${cycle}` : `Cycle ${cycle} of ${totalCycles}`}
      </p>
      {unlimited ? (
        <div
          className="h-1 w-full overflow-hidden rounded-full bg-hairline"
          role="status"
          aria-label={`Cycle ${cycle}, unlimited session`}
        >
          <div className="h-full w-full bg-accent/25" />
        </div>
      ) : (
        <div
          className="h-1 w-full overflow-hidden rounded-full bg-hairline"
          role="progressbar"
          aria-valuenow={cycle}
          aria-valuemin={1}
          aria-valuemax={totalCycles}
          aria-label={`Cycle ${cycle} of ${totalCycles}`}
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  )
}
