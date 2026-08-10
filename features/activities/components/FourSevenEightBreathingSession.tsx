"use client"

import { useRef } from "react"
import type { Activity } from "../types"
import FourSevenEightBreathing from "./FourSevenEightBreathing"
import { useRouter } from "next/navigation"
import { useSessionStore } from "../store/useSessionStore"

interface FourSevenEightBreathingSessionProps {
  activity: Activity
  backHref?: string
}

export function FourSevenEightBreathingSession({
  activity,
  backHref = "/patient/library",
}: FourSevenEightBreathingSessionProps) {
  const router = useRouter()
  const addSession = useSessionStore((s) => s.addSession)
  const startedAtRef = useRef(new Date().toISOString())
  const startMsRef = useRef(Date.now())

  return (
    <FourSevenEightBreathing
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
