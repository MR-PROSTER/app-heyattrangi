"use client"

import type { Activity } from "../types"
import GroundingExercise from "./GroundingExercise"
import Link from "next/link"

interface GroundingSessionProps {
  activity: Activity
  backHref?: string
}

export function GroundingSession({ activity, backHref = "/patient/library" }: GroundingSessionProps) {
  return (
    <div className="relative min-h-[100dvh] bg-[#f8fafc] flex flex-col items-center justify-center p-4">
      {/* Top Header Row with Close button */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between pointer-events-none">
        <Link
          href={backHref}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 shadow-sm transition-all"
          aria-label="Exit session"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>
      </div>

      <GroundingExercise />
    </div>
  )
}
