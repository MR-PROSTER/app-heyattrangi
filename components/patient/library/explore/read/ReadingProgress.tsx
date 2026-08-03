"use client"

interface ReadingProgressProps {
  progress: number
}

/** Soft sticky progress bar for article reading. */
export default function ReadingProgress({ progress }: ReadingProgressProps) {
  const value = Math.min(100, Math.max(0, progress))

  return (
    <div
      className="sticky top-0 z-30 h-[2px] w-full bg-[#EDEAE3]"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      aria-label="Reading progress"
    >
      <div
        className="h-full bg-[#C8C4BC] transition-[width] duration-150 ease-out"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}
