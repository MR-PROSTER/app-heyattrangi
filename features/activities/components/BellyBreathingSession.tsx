"use client"

import { useRef } from "react"
import type { Activity } from "../types"
import BellyBreathing from "./BellyBreathing"
import { useRouter } from "next/navigation"
import { useSessionStore } from "../store/useSessionStore"

interface BellyBreathingSessionProps {
  activity: Activity
  backHref?: string
  modeOptions?: any
  mode?: any
  onModeChange?: (id: any) => void
}

export function BellyBreathingSession({
  activity,
  backHref = "/patient/library",
  modeOptions,
  mode,
  onModeChange,
}: BellyBreathingSessionProps) {
  const router = useRouter()
  const addSession = useSessionStore((s) => s.addSession)
  const startedAtRef = useRef(new Date().toISOString())
  const startMsRef = useRef(Date.now())

  return (
    <BellyBreathing
      onBack={() => router.push(backHref)}
      onDone={() => {
        const durationMs = Date.now() - startMsRef.current
        addSession({
          activitySlug: activity.slug,
          startedAt: startedAtRef.current,
          durationMs,
          cyclesCompleted: 0,
          cyclesPlanned: 0,
          completed: true,
          kind: "paced",
        })
        router.push(backHref)
      }}
    />
  )
}
