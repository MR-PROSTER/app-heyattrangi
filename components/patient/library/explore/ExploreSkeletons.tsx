"use client"

/**
 * Lightweight skeletons for Explore lazy surfaces.
 * Visual-only — no data fetching.
 */

function Bone({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-slate-200/70 ${className}`}
      aria-hidden
    />
  )
}

export function ActivityGridSkeleton() {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4"
      role="status"
      aria-label="Loading activities"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-[22px] border border-slate-100 bg-white p-5 space-y-3"
        >
          <Bone className="w-11 h-11 rounded-2xl" />
          <Bone className="h-4 w-3/4" />
          <Bone className="h-3 w-full" />
          <Bone className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  )
}

export function ArticleGridSkeleton() {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"
      role="status"
      aria-label="Loading articles"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-[22px] border border-slate-100 bg-white p-5 space-y-3"
        >
          <Bone className="h-5 w-20 rounded-full" />
          <Bone className="h-4 w-4/5" />
          <Bone className="h-3 w-full" />
          <Bone className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  )
}

export function ListenGridSkeleton() {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"
      role="status"
      aria-label="Loading listen tracks"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-[22px] border border-slate-100 bg-white p-5 space-y-3"
        >
          <div className="flex justify-between">
            <Bone className="w-16 h-16 rounded-2xl" />
            <Bone className="w-9 h-9 rounded-full" />
          </div>
          <Bone className="h-4 w-2/3" />
          <Bone className="h-3 w-full" />
        </div>
      ))}
    </div>
  )
}

export function AssessmentCardSkeleton() {
  return (
    <div
      className="max-w-2xl rounded-[28px] border border-slate-100 bg-white p-8 space-y-4"
      role="status"
      aria-label="Loading assessment"
    >
      <div className="flex gap-6">
        <Bone className="w-24 h-24 rounded-[24px] shrink-0" />
        <div className="flex-1 space-y-3">
          <Bone className="h-5 w-24 rounded-full" />
          <Bone className="h-7 w-48" />
          <Bone className="h-4 w-full" />
          <Bone className="h-12 w-40 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

export function ActivityDetailSkeleton() {
  return (
    <div
      className="p-8 max-w-2xl mx-auto space-y-6"
      role="status"
      aria-label="Loading activity"
    >
      <Bone className="h-4 w-20" />
      <Bone className="w-24 h-24 rounded-[28px]" />
      <Bone className="h-8 w-2/3" />
      <Bone className="h-4 w-full" />
      <Bone className="h-32 w-full rounded-[22px]" />
      <Bone className="h-14 w-full rounded-2xl" />
    </div>
  )
}

export function PlayerSkeleton() {
  return (
    <div
      className="p-8 max-w-md mx-auto space-y-6 flex flex-col items-center"
      role="status"
      aria-label="Loading player"
    >
      <Bone className="h-4 w-16 self-start" />
      <Bone className="w-52 h-52 rounded-[28px]" />
      <Bone className="h-7 w-48" />
      <Bone className="h-4 w-64" />
      <Bone className="h-40 w-full rounded-[22px]" />
    </div>
  )
}
