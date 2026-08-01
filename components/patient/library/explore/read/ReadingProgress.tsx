"use client"

interface ReadingProgressProps {
  progress: number
}

/** Visual-only sticky progress bar. No analytics. */
export default function ReadingProgress({ progress }: ReadingProgressProps) {
  const value = Math.min(100, Math.max(0, progress))

  return (
    <div
      className="sticky top-0 z-30 w-full h-1 bg-slate-100/80"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      aria-label="Reading progress"
    >
      <div
        className="h-full bg-orange-400 transition-[width] duration-150 ease-out"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}
