"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Wind } from "lucide-react"
import { unlockSharedAudio } from "@/features/activities/lib/audioBridge"
import { useSessionStore } from "@/features/activities/store/useSessionStore"

const SIGH_HREF = "/explore/activities/physiological-sigh"

/**
 * Global quick access to Physiological Sigh — FAB on mobile, compact control.
 * Hidden while any breathing session is active.
 */
export function QuickBreatheButton() {
  return null
}
