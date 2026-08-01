interface LoadingSkeletonProps {
  rows?: number
}

export default function LoadingSkeleton({ rows = 4 }: LoadingSkeletonProps) {
  return (
    <div role="status" aria-busy="true" aria-label="Loading settings" className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-16 w-full rounded-[var(--radius-xl)] border border-[var(--color-border)]
            bg-[var(--color-surface)] animate-pulse motion-reduce:animate-none"
        />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  )
}
