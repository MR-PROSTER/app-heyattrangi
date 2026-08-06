"use client"

import type { Activity } from "../types"
import ProgressiveMuscleRelaxation from "./ProgressiveMuscleRelaxation"
import { useRouter } from "next/navigation"

interface ProgressiveMuscleRelaxationSessionProps {
  activity: Activity
  backHref?: string
}

export function ProgressiveMuscleRelaxationSession({
  activity,
  backHref = "/patient/library",
}: ProgressiveMuscleRelaxationSessionProps) {
  const router = useRouter()
  return (
    <ProgressiveMuscleRelaxation
      onBack={() => router.push(backHref)}
      onDone={() => router.push(backHref)}
    />
  )
}
