/**
 * Route-level skeleton while Profile user data streams in.
 */
export default function ProfileLoading() {
  return (
    <main
      className="flex h-full min-h-screen w-full flex-col bg-[var(--color-bg)]"
      aria-busy="true"
      aria-label="Loading profile"
    >
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col">
        <div
          className="sticky top-0 z-20 grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-[var(--text-xs)]
            px-[var(--text-xs)] pt-[max(0.5rem,env(safe-area-inset-top))] pb-[var(--text-xs)]"
        >
          <div className="size-11 rounded-full bg-[var(--color-border)] animate-pulse motion-reduce:animate-none" />
          <div className="mx-auto h-5 w-20 rounded-[var(--radius-sm)] bg-[var(--color-border)] animate-pulse motion-reduce:animate-none" />
          <div className="size-11 rounded-full bg-[var(--color-border)] animate-pulse motion-reduce:animate-none" />
        </div>

        <div className="flex-1 px-5 pb-[max(2rem,env(safe-area-inset-bottom))]">
          <div className="rounded-[var(--radius-xl)] bg-[var(--color-accent-light)]/50 px-4 pb-6 pt-4">
            <div className="flex flex-col items-center">
              <div className="size-24 rounded-full bg-[var(--color-border)] animate-pulse motion-reduce:animate-none" />
              <div className="mt-[var(--text-base)] h-6 w-40 max-w-full rounded-[var(--radius-sm)] bg-[var(--color-border)] animate-pulse motion-reduce:animate-none" />
              <div className="mt-[var(--text-xs)] h-4 w-52 max-w-full rounded-[var(--radius-sm)] bg-[var(--color-border)] animate-pulse motion-reduce:animate-none" />
              <div className="mt-[var(--text-xs)] h-3 w-36 max-w-full rounded-[var(--radius-sm)] bg-[var(--color-border)] animate-pulse motion-reduce:animate-none" />
            </div>
            <div className="mt-6 h-28 w-full rounded-[var(--radius-xl)] bg-[var(--color-surface)] border border-[var(--color-border)] animate-pulse motion-reduce:animate-none" />
          </div>

          <div className="mt-5 space-y-4">
            <div className="h-28 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] animate-pulse motion-reduce:animate-none" />
            <div className="h-32 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] animate-pulse motion-reduce:animate-none" />
          </div>
        </div>
      </div>
      <span className="sr-only">Loading profile…</span>
    </main>
  )
}
