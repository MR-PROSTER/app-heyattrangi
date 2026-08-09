"use client"

import { useRef } from "react"
import type { Activity } from "../types"
import MicroMovement from "./MicroMovement"
import { useRouter } from "next/navigation"
import { useSessionStore } from "../store/useSessionStore"

interface MicroMovementSessionProps {
  activity: Activity
  backHref?: string
}

export function MicroMovementSession({
  activity,
  backHref = "/patient/library",
}: MicroMovementSessionProps) {
  const router = useRouter()
  const addSession = useSessionStore((s) => s.addSession)
  const startedAtRef = useRef(new Date().toISOString())
  const startMsRef = useRef(Date.now())

  return (
    <MicroMovement
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
          kind: "stepped",
        })
        router.push(backHref)
      }}
    />
  )
}
