"use client"

import type { Activity } from "../types"
import MicroMovement from "./MicroMovement"
import { useRouter } from "next/navigation"

interface MicroMovementSessionProps {
  activity: Activity
  backHref?: string
}

export function MicroMovementSession({
  activity,
  backHref = "/patient/library",
}: MicroMovementSessionProps) {
  const router = useRouter()
  return (
    <MicroMovement
      onBack={() => router.push(backHref)}
      onDone={() => router.push(backHref)}
    />
  )
}
