"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Settings } from "lucide-react"
import type { Activity } from "../types"
import { PATTERN_SIGH } from "../data/patterns"
import {
  useBreathingEngine,
  type PhaseChangeEvent,
} from "../hooks/usePacedTimeline"
import { useSessionAudio } from "../hooks/useSessionAudio"
import { useWakeLock } from "../hooks/useWakeLock"
import { useSessionStore } from "../store/useSessionStore"
import { isSharedAudioUnlocked, unlockSharedAudio } from "../lib/audioBridge"
import { hapticTick } from "../lib/haptics"
import { SighVisualizer } from "./SighVisualizer"
import { formatDuration, formatMinutesApprox } from "../lib/formatDuration"

const DEFAULT_CYCLES = 5
const HISTORY_SLUG = "physiological-sigh"

interface PhysiologicalSighSessionProps {
  activity: Activity
  backHref?: string
  /** Exposed for tests — defaults to instant */
  startMode?: "guided" | "instant"
}

export function PhysiologicalSighSession({
  activity,
  backHref = "/patient/library",
  startMode = "instant",
}: PhysiologicalSighSessionProps) {
  void activity
  const router = useRouter()
  const prefs = useSessionStore((s) => s.prefs)
  const setPref = useSessionStore((s) => s.setPref)
  const addSession = useSessionStore((s) => s.addSession)
  const setSessionActive = useSessionStore((s) => s.setSessionActive)
  const countSessionsSince = useSessionStore((s) => s.countSessionsSince)
  const setHasHydrated = useSessionStore((s) => s.setHasHydrated)
  const hydrated = useSessionStore((s) => s._hasHydrated)

  const [cycles, setCycles] = useState(DEFAULT_CYCLES)
  const [screen, setScreen] = useState<"session" | "complete">(
    startMode === "instant" ? "session" : "session"
  )
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [liveAnnounce, setLiveAnnounce] = useState("")
  const [restartHint, setRestartHint] = useState<string | null>(null)
  const [showSoundChip, setShowSoundChip] = useState(false)
  const [consecutiveAgains, setConsecutiveAgains] = useState(0)
  const [showSupport, setShowSupport] = useState(false)
  const [result, setResult] = useState<{
    cyclesCompleted: number
    durationMs: number
  } | null>(null)

  const startedAtIsoRef = useRef("")
  const savedRef = useRef(false)
  const firstAnnounceReadyRef = useRef(false)
  const announceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const againDebounceRef = useRef(0)
  const settingsCloseRef = useRef<HTMLButtonElement | null>(null)

  const soundOn = prefs.sighSound ?? true
  const audio = useSessionAudio(soundOn, { profile: "sigh" })

  useEffect(() => {
    const result = useSessionStore.persist.rehydrate()
    void Promise.resolve(result).then(() => setHasHydrated(true))
  }, [setHasHydrated])

  useEffect(() => {
    setSessionActive(true)
    return () => setSessionActive(false)
  }, [setSessionActive])

  const onPhaseChange = useCallback(
    (phaseId: string, _cycle: number, detail?: PhaseChangeEvent) => {
      performance.mark("sigh-first-inhale-cue")
      const announce = () => {
        if (phaseId === "inhale-2") setLiveAnnounce("Again")
        else if (detail?.spec.kind === "exhale")
          setLiveAnnounce("Breathe out slowly")
        else setLiveAnnounce("Breathe in")
      }
      if (!firstAnnounceReadyRef.current) {
        // Heading gets 800ms first for screen readers
        if (announceTimerRef.current) clearTimeout(announceTimerRef.current)
        announceTimerRef.current = setTimeout(() => {
          firstAnnounceReadyRef.current = true
          announce()
        }, 800)
      } else {
        announce()
      }
      audio.cuePhaseId(phaseId, detail?.spec.kind ?? "inhale")
      if (phaseId === "inhale-2") hapticTick(prefs.haptics, 18)
      else if (detail?.spec.kind === "exhale") {
        try {
          if (prefs.haptics && typeof navigator !== "undefined") {
            navigator.vibrate?.([12, 80, 12])
          }
        } catch {
          // ignore
        }
      } else hapticTick(prefs.haptics, 10)
    },
    [audio, prefs.haptics]
  )

  const evaluateSupportNudgeRef = useRef(() => undefined as void)
  evaluateSupportNudgeRef.current = () => {
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000
    const count = countSessionsSince(HISTORY_SLUG, dayAgo)
    const last = prefs.lastSupportNudgeAt
    const today = new Date().toDateString()
    const alreadyToday = last && new Date(last).toDateString() === today
    if (count >= 5 && !alreadyToday) {
      // ≥6 including the one we're about to persist — count before persist is ≥5 means this makes 6
      setShowSupport(true)
      setPref("lastSupportNudgeAt", new Date().toISOString())
    } else {
      setShowSupport(false)
    }
  }

  const engine = useBreathingEngine({
    pattern: PATTERN_SIGH,
    totalCycles: cycles,
    cueLeadMs: 60,
    renderPolicy: "phase",
    visibilityMode: "restart-cycle",
    onPhaseChange,
    onCycleRestarted: () => {
      setRestartHint("Let's take that one again.")
      window.setTimeout(() => setRestartHint(null), 2000)
    },
    onComplete: () => {
      setResult({
        cyclesCompleted: cycles,
        durationMs: cycles * PATTERN_SIGH.cycleSeconds * 1000,
      })
      setScreen("complete")
      void audio.suspend()
      evaluateSupportNudgeRef.current()
    },
  })

  useWakeLock(screen === "session" && engine.status === "running")

  // Instant start on mount
  useEffect(() => {
    if (!hydrated || startMode !== "instant") return
    if (screen !== "session") return
    if (engine.status !== "idle") return
    startedAtIsoRef.current = new Date().toISOString()
    savedRef.current = false
    firstAnnounceReadyRef.current = false
    performance.mark("sigh-session-mount")
    if (!isSharedAudioUnlocked()) {
      setShowSoundChip(true)
    }
    engine.start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, startMode])

  // Silent save on route leave — no confirm dialog
  useEffect(() => {
    if (screen !== "session") return
    return () => {
      if (savedRef.current) return
      if (engine.status === "idle" || engine.status === "complete") return
      const { cyclesCompleted, elapsedMs } = engine.end()
      if (elapsedMs < 500) return
      addSession({
        activitySlug: HISTORY_SLUG,
        startedAt: startedAtIsoRef.current || new Date().toISOString(),
        durationMs: elapsedMs,
        cyclesCompleted,
        cyclesPlanned: cycles,
        completed: false,
        endedEarly: true,
      })
      savedRef.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen])

  useEffect(() => {
    if (screen !== "session") return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && settingsOpen) {
        e.preventDefault()
        setSettingsOpen(false)
        settingsCloseRef.current?.focus()
        return
      }
      if (e.code === "Space") {
        const tag = (e.target as HTMLElement)?.tagName
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON") return
        e.preventDefault()
        if (engine.status === "running") engine.pause()
        else if (engine.status === "paused") engine.resume()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [screen, engine, settingsOpen])

  const persist = useCallback(
    (cyclesCompleted: number, durationMs: number, completed: boolean) => {
      if (savedRef.current) return
      savedRef.current = true
      addSession({
        activitySlug: HISTORY_SLUG,
        startedAt: startedAtIsoRef.current || new Date().toISOString(),
        durationMs,
        cyclesCompleted,
        cyclesPlanned: cycles,
        completed,
        endedEarly: !completed,
      })
    },
    [addSession, cycles]
  )

  const startFreshRound = useCallback(() => {
    const now = performance.now()
    if (now - againDebounceRef.current < 400) return
    againDebounceRef.current = now
    savedRef.current = false
    startedAtIsoRef.current = new Date().toISOString()
    firstAnnounceReadyRef.current = false
    setResult(null)
    setScreen("session")
    engine.restart()
  }, [engine])

  if (!hydrated) {
    return (
      <div className="min-h-[100dvh] bg-canvas" aria-busy="true">
        <div className="mx-auto max-w-lg animate-pulse px-5 py-10">
          <div className="h-40 rounded-3xl bg-hairline" />
        </div>
      </div>
    )
  }

  if (screen === "complete" && result) {
    const pacingLocked = consecutiveAgains >= 4
    return (
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col items-center justify-center px-5 py-10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">
          That&apos;s {formatMinutesApprox(result.durationMs)} for you.
        </h1>
        <p className="mt-3 text-[15px] text-ink-muted">
          {formatDuration(result.durationMs)} · {result.cyclesCompleted}{" "}
          {result.cyclesCompleted === 1 ? "cycle" : "cycles"}
        </p>
        <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-ink-muted">
          Feeling a bit lightheaded or tingly? That&apos;s common — it passes.
          Breathe normally for a minute.
        </p>
        {showSupport ? (
          <p
            className="mt-4 max-w-sm text-[15px] leading-relaxed text-ink-muted"
            data-testid="sigh-support-nudge"
          >
            You&apos;ve reached for this a few times today. If things feel
            heavy,{" "}
            <Link
              href="/patient/library"
              className="text-accent underline-offset-2 hover:underline"
            >
              talking to someone
            </Link>{" "}
            can help more than breathing can.
          </p>
        ) : null}

        <div className="mt-10 flex w-full max-w-sm flex-col gap-3">
          {pacingLocked ? (
            <>
              <p className="text-[15px] leading-relaxed text-ink-muted">
                That&apos;s a good amount for now. Try sitting with it for a
                minute before going again.
              </p>
              <button
                type="button"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-brand px-8 text-base font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
                onClick={() => {
                  persist(result.cyclesCompleted, result.durationMs, true)
                  router.push(backHref)
                }}
              >
                Done
              </button>
              <button
                type="button"
                className="min-h-11 text-sm text-ink-subtle underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                onClick={() => {
                  persist(result.cyclesCompleted, result.durationMs, true)
                  setConsecutiveAgains((n) => n + 1)
                  startFreshRound()
                }}
              >
                Go again anyway
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-brand px-8 text-base font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
                onClick={() => {
                  persist(result.cyclesCompleted, result.durationMs, true)
                  setConsecutiveAgains((n) => n + 1)
                  startFreshRound()
                }}
              >
                Again
              </button>
              <button
                type="button"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-hairline bg-surface px-8 text-sm font-medium text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
                onClick={() => {
                  persist(result.cyclesCompleted, result.durationMs, true)
                  router.push(backHref)
                }}
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative min-h-[100dvh] bg-canvas"
      role="timer"
      aria-live="assertive"
      aria-atomic="true"
      data-start-mode={startMode}
    >
      <h1 className="sr-only">Physiological sigh, breathing reset</h1>
      <span className="sr-only">{liveAnnounce}</span>

      {restartHint ? (
        <p className="absolute inset-x-0 top-4 z-10 text-center text-sm text-ink-muted">
          {restartHint}
        </p>
      ) : null}

      <button
        ref={settingsCloseRef}
        type="button"
        className="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full border border-hairline bg-surface text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        aria-label="Session settings"
        onClick={() => setSettingsOpen(true)}
      >
        <Settings className="h-5 w-5" aria-hidden />
      </button>

      {showSoundChip ? (
        <button
          type="button"
          className="absolute left-4 top-4 z-20 min-h-11 rounded-full bg-brand px-4 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          onClick={async () => {
            await unlockSharedAudio()
            await audio.unlock()
            setPref("sighSound", true)
            setShowSoundChip(false)
          }}
        >
          Turn on sound
        </button>
      ) : null}

      <div className="mx-auto flex min-h-[100dvh] max-w-3xl flex-col items-center justify-center gap-6 px-4 py-10">
        <SighVisualizer engine={engine} totalCycles={cycles} />
        {/* No countdown numerals — intentional */}
      </div>

      {settingsOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-[rgba(20,33,61,0.35)] sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sigh-settings-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setSettingsOpen(false)
              settingsCloseRef.current?.focus()
            }
          }}
        >
          <div className="w-full max-w-sm rounded-t-3xl border border-hairline bg-surface p-6 shadow-lg sm:rounded-3xl">
            <h2
              id="sigh-settings-title"
              className="text-lg font-semibold text-ink"
            >
              Session settings
            </h2>
            <fieldset className="mt-4">
              <legend className="mb-2 text-sm font-medium text-ink">
                Cycles
              </legend>
              <div className="flex gap-2" role="radiogroup">
                {[3, 5, 8].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={cycles === n}
                    className={`min-h-11 flex-1 rounded-full border text-sm ${
                      cycles === n
                        ? "border-accent bg-accent-soft text-ink"
                        : "border-hairline text-ink-muted"
                    }`}
                    onClick={() => setCycles(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="min-h-11 flex-1 rounded-full border border-hairline text-sm"
                aria-pressed={soundOn}
                onClick={() => setPref("sighSound", !soundOn)}
              >
                Sound: {soundOn ? "On" : "Off"}
              </button>
              <button
                type="button"
                className="min-h-11 flex-1 rounded-full border border-hairline text-sm"
                aria-pressed={prefs.haptics}
                onClick={() => setPref("haptics", !prefs.haptics)}
              >
                Haptics: {prefs.haptics ? "On" : "Off"}
              </button>
            </div>
            <button
              type="button"
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              onClick={() => {
                setSettingsOpen(false)
                settingsCloseRef.current?.focus()
              }}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
