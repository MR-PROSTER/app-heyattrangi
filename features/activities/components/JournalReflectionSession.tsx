"use client"

import { useRef } from "react"
import type { Activity } from "../types"
import JournalReflection from "./JournalReflection"
import { useRouter } from "next/navigation"
import { useSessionStore } from "../store/useSessionStore"

interface JournalReflectionSessionProps {
  activity: Activity
  backHref?: string
}

export function JournalReflectionSession({
  activity,
  backHref = "/patient/library",
}: JournalReflectionSessionProps) {
  const router = useRouter()
  const addSession = useSessionStore((s) => s.addSession)
  const startedAtRef = useRef(new Date().toISOString())
  const startMsRef = useRef(Date.now())

  return (
    <JournalReflection
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
