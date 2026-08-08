"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import { useSessionStore } from "../../store/useSessionStore"
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion"
import { useWakeLock } from "../../hooks/useWakeLock"
import { SessionCompleteCard } from "../SessionCompleteCard"

/** Shared store rehydration for activity sessions. */
export function useStoreHydration(): boolean {
  const hasHydrated = useSessionStore((s) => s._hasHydrated)
  const setHasHydrated = useSessionStore((s) => s.setHasHydrated)

  useEffect(() => {
    const result = useSessionStore.persist.rehydrate()
    void Promise.resolve(result).then(() => {
      setHasHydrated(true)
    })
  }, [setHasHydrated])

  return hasHydrated
}

export function SessionHydrationGate({
  hydrated,
  children,
}: {
  hydrated: boolean
  children: ReactNode
}) {
  if (!hydrated) {
    return (
      <div className="min-h-[100dvh] bg-canvas" aria-busy="true">
        <div className="mx-auto max-w-lg animate-pulse px-5 py-10">
          <div className="mb-6 h-8 w-24 rounded-full bg-hairline" />
          <div className="mb-4 h-10 w-2/3 rounded-2xl bg-hairline" />
          <div className="h-40 rounded-3xl bg-hairline" />
        </div>
      </div>
    )
  }
  return <>{children}</>
}

/** Marks session active for FAB hiding; requests wake lock while `wakeLock` is true. */
export function useSessionLifecycle(opts: {
  active: boolean
  wakeLock?: boolean
}) {
  const setSessionActive = useSessionStore((s) => s.setSessionActive)
  useEffect(() => {
    setSessionActive(opts.active)
    return () => setSessionActive(false)
  }, [opts.active, setSessionActive])
  useWakeLock(!!opts.wakeLock)
}

/** Idle chrome dimming — shared by paced and stepped sessions. */
export function useIdleChromeDim(enabled: boolean) {
  const reducedMotion = usePrefersReducedMotion()
  const [chromeDimmed, setChromeDimmed] = useState(false)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const bumpChrome = useCallback(() => {
    setChromeDimmed(false)
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    if (reducedMotion || !enabled) return
    idleTimerRef.current = setTimeout(() => setChromeDimmed(true), 5000)
  }, [reducedMotion, enabled])

  useEffect(() => {
    if (!enabled) return
    const onMove = () => bumpChrome()
    window.addEventListener("pointermove", onMove)
    window.addEventListener("keydown", onMove)
    idleTimerRef.current = setTimeout(() => setChromeDimmed(true), 5000)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("keydown", onMove)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [enabled, bumpChrome])

  return {
    chromeDimmed: chromeDimmed && !reducedMotion && enabled,
    bumpChrome,
  }
}

interface LeaveConfirmProps {
  open: boolean
  title?: string
  body?: string
  onKeepGoing: () => void
  onLeave: () => void
}

export function LeaveConfirmDialog({
  open,
  title = "End this session?",
  body = "Whatever you have done so far still counts.",
  onKeepGoing,
  onLeave,
}: LeaveConfirmProps) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-[rgba(20,33,61,0.35)] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="end-session-title"
    >
      <div className="w-full max-w-sm rounded-3xl border border-hairline bg-surface p-6 shadow-[0_1px_3px_rgba(20,33,61,0.06),0_8px_24px_-12px_rgba(20,33,61,0.10)]">
        <h2
          id="end-session-title"
          className="text-xl font-semibold tracking-tight text-ink"
        >
          {title}
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{body}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-hairline px-5 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
            onClick={onKeepGoing}
          >
            Keep going
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
            onClick={onLeave}
          >
            End session
          </button>
        </div>
      </div>
    </div>
  )
}

interface SessionFrameProps {
  children: ReactNode
  className?: string
  role?: string
  ariaLive?: "off" | "polite" | "assertive"
  liveAnnounce?: string
}

/** Activity-agnostic canvas frame. */
export function SessionFrame({
  children,
  className = "",
  role,
  ariaLive = "polite",
  liveAnnounce = "",
}: SessionFrameProps) {
  return (
    <div
      className={`relative min-h-[100dvh] bg-canvas ${className}`}
      role={role}
      aria-live={ariaLive}
      aria-atomic="true"
    >
      {liveAnnounce ? <span className="sr-only">{liveAnnounce}</span> : null}
      {children}
    </div>
  )
}

interface CompleteFrameProps {
  plannedCycles: number
  cyclesCompleted: number
  durationMs: number
  completedFully: boolean
  endedEarly?: boolean
  headlineOverride?: string
  againLabel?: string
  doneLabel?: string
  againPrimary?: boolean
  footer?: ReactNode
  onDone: () => void
  onAgain: () => void
  onSaveMood?: (mood: 1 | 2 | 3 | 4 | 5 | undefined) => void
  hideMood?: boolean
}

export function SessionCompleteFrame({
  plannedCycles,
  cyclesCompleted,
  durationMs,
  completedFully,
  endedEarly,
  headlineOverride,
  onDone,
  onAgain,
  onSaveMood,
  footer,
}: CompleteFrameProps) {
  return (
    <div className="min-h-[100dvh] bg-canvas">
      <SessionCompleteCard
        plannedCycles={plannedCycles}
        cyclesCompleted={cyclesCompleted}
        durationMs={durationMs}
        completedFully={completedFully}
        endedEarly={endedEarly}
        headlineOverride={headlineOverride}
        onDone={onDone}
        onAgain={onAgain}
        onSaveMood={onSaveMood}
      />
      {footer}
    </div>
  )
}

export function useSessionNavigation(backHref: string) {
  const router = useRouter()
  return {
    goBack: () => router.push(backHref),
    router,
  }
}
