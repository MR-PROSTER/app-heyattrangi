export default function ActivitySessionLoading() {
  return (
    <div className="min-h-[100dvh] bg-canvas" aria-busy="true" aria-label="Loading session">
      <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col items-center justify-between px-5 py-10">
        <div className="h-10 w-40 animate-pulse rounded-2xl bg-hairline" />
        <div className="aspect-square w-[min(58vw,320px)] animate-pulse rounded-[28%] bg-hairline" />
        <div className="flex w-full flex-col items-center gap-4">
          <div className="h-2 w-48 animate-pulse rounded-full bg-hairline" />
          <div className="flex gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-11 w-11 animate-pulse rounded-full bg-hairline"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
