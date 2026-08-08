"use client"

import type { Activity } from "../types"
import BellyBreathing from "./BellyBreathing"
import { useRouter } from "next/navigation"

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
  return (
    <BellyBreathing
      onBack={() => router.push(backHref)}
      onDone={() => router.push(backHref)}
    />
  )
}
