"use client"

import type { Activity } from "../types"
import FourSevenEightBreathing from "./FourSevenEightBreathing"
import { useRouter } from "next/navigation"

interface FourSevenEightBreathingSessionProps {
  activity: Activity
  backHref?: string
}

export function FourSevenEightBreathingSession({
  activity,
  backHref = "/patient/library",
}: FourSevenEightBreathingSessionProps) {
  const router = useRouter()
  return (
    <FourSevenEightBreathing
      onBack={() => router.push(backHref)}
      onDone={() => router.push(backHref)}
    />
  )
}
