"use client"

interface CycleProgressProps {
  cycle: number
  totalCycles: number
}

export function CycleProgress({ cycle, totalCycles }: CycleProgressProps) {
  const pct = Math.min(100, Math.max(0, (cycle / totalCycles) * 100))

  return (
    <div className="mx-auto w-full max-w-xs px-4">
      <p className="mb-2 text-center text-sm text-ink-subtle">
        Cycle {cycle} of {totalCycles}
      </p>
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
    </div>
  )
}
