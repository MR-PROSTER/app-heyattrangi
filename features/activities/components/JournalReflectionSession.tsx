"use client"

import type { Activity } from "../types"
import JournalReflection from "./JournalReflection"
import { useRouter } from "next/navigation"

interface JournalReflectionSessionProps {
  activity: Activity
  backHref?: string
}

export function JournalReflectionSession({
  activity,
  backHref = "/patient/library",
}: JournalReflectionSessionProps) {
  const router = useRouter()
  return (
    <JournalReflection
      onBack={() => router.push(backHref)}
      onDone={() => router.push(backHref)}
    />
  )
}
