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
  const router = useRouter()
  const pathname = usePathname() || ""
  const sessionActive = useSessionStore((s) => s.sessionActive)
  const setHasHydrated = useSessionStore((s) => s.setHasHydrated)

  useEffect(() => {
    const result = useSessionStore.persist.rehydrate()
    void Promise.resolve(result).then(() => setHasHydrated(true))
  }, [setHasHydrated])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.shiftKey && (e.key === "B" || e.key === "b"))) return
      const el = e.target as HTMLElement | null
      if (!el) return
      const tag = el.tagName
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        el.isContentEditable
      ) {
        return
      }
      e.preventDefault()
      performance.mark("sigh-card-tap")
      void unlockSharedAudio()
      router.push(SIGH_HREF)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [router])

  const onSighRoute = pathname.includes("physiological-sigh")
  if (sessionActive || onSighRoute) return null

  return (
    <button
      type="button"
      aria-label="Quick breathing reset"
      title="Quick breathing reset (Shift+B)"
      className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-brand text-white shadow-[0_4px_16px_rgba(249,115,22,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 md:bottom-8 md:right-8"
      onClick={() => {
        performance.mark("sigh-card-tap")
        void unlockSharedAudio()
        router.push(SIGH_HREF)
      }}
    >
      <Wind className="h-6 w-6" aria-hidden />
    </button>
  )
}
