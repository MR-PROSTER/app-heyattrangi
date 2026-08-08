"use client"

import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import type { Activity } from "../types"

export function ComingSoonActivity({ activity }: { activity: Activity }) {
  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col bg-canvas px-5 py-6">
      <Link
        href="/patient/library"
        className="mb-8 inline-flex min-h-11 items-center gap-1 self-start text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        aria-label="Back to Explore"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
        Explore
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">
        {activity.title}
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
        {activity.longDescription}
      </p>
      <p className="mt-8 text-[15px] leading-relaxed text-ink-subtle">
        This guided session is almost ready. In the meantime, Box Breathing is
        available whenever you want a quiet reset.
      </p>
      <Link
        href="/explore/activities/breathing"
        className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-8 text-base font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
      >
        Try Box Breathing
      </Link>
    </div>
  )
}
