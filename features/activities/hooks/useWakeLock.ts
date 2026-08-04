"use client"

import { useEffect, useRef } from "react"

type WakeLockSentinelLike = {
  released: boolean
  release: () => Promise<void>
  addEventListener: (type: "release", listener: () => void) => void
}

/**
 * Keep the screen awake while `active` is true. Feature-detected; no-ops when unsupported.
 * Released on pause (`active` false) and on unmount.
 */
export function useWakeLock(active: boolean): void {
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null)

  useEffect(() => {
    let cancelled = false

    async function acquire() {
      try {
        if (
          typeof navigator === "undefined" ||
          !("wakeLock" in navigator) ||
          !active
        ) {
          return
        }
        const lock = await (
          navigator as Navigator & {
            wakeLock: { request: (type: "screen") => Promise<WakeLockSentinelLike> }
          }
        ).wakeLock.request("screen")
        if (cancelled) {
          await lock.release()
          return
        }
        sentinelRef.current = lock
        lock.addEventListener("release", () => {
          if (sentinelRef.current === lock) sentinelRef.current = null
        })
      } catch {
        // Permission / unsupported — ignore
      }
    }

    async function release() {
      const s = sentinelRef.current
      sentinelRef.current = null
      if (s && !s.released) {
        try {
          await s.release()
        } catch {
          // ignore
        }
      }
    }

    if (active) {
      void acquire()
    } else {
      void release()
    }

    return () => {
      cancelled = true
      void release()
    }
  }, [active])
}
