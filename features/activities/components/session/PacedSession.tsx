"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import type { Activity, BreathingPattern, PhaseKind } from "../../types"
import {
  useBreathingEngine,
  type BreathingEngineState,
} from "../../hooks/usePacedTimeline"
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion"
import { useWakeLock } from "../../hooks/useWakeLock"
import {
  useSessionAudio,
  type AudioCueProfile,
} from "../../hooks/useSessionAudio"
import { useSessionStore } from "../../store/useSessionStore"
import { hapticExhale, hapticTick } from "../../lib/haptics"
import { PhaseLabel } from "../PhaseLabel"
import { CycleProgress } from "../CycleProgress"
import { SessionControls } from "../SessionControls"
import { PreSessionCard, type DurationOption } from "../PreSessionCard"
import { SessionCompleteCard } from "../SessionCompleteCard"
import type { BreathingModeOption } from "../../data/breathingModes"
import { useStoreHydration, LeaveConfirmDialog } from "./SessionFrame"

type Screen = "pre" | "countdown" | "session" | "complete"

export interface SessionShellProps {
  activity: Activity
  pattern: BreathingPattern
  durationOptions: readonly DurationOption[]
  defaultCycles: number
  howItWorks: readonly string[]
  visualizer: (engine: BreathingEngineState) => ReactNode
  safetyNotice?: ReactNode
  backHref?: string
  audioProfile?: AudioCueProfile
  showStopAnytime?: boolean
  /** When set, first-time users get the smallest duration option recommended */
  firstSessionCycles?: number
  /** History slug used for first-session detection / save (defaults to activity.slug) */
  sessionSlug?: string
  title?: string
  description?: string
  modeOptions?: readonly BreathingModeOption[]
  mode?: string
  onModeChange?: (modeId: string) => void
  beginDisabled?: boolean
  beginLabel?: string
  footerNote?: string
  /** Between description and duration — e.g. hand-placement walkthrough */
  teachingStep?: ReactNode
  /** Under the visualizer during an active session */
  sessionCoach?: ReactNode | ((engine: BreathingEngineState) => ReactNode)
  /** Extra session chrome (pace controls) — never idle-dimmed */
  sessionChrome?: ReactNode | ((engine: BreathingEngineState) => ReactNode)
  /** Hide the default PhaseLabel above the visualizer */
  hidePhaseLabel?: boolean
  /**
   * 'guided' — pre-session → countdown → session (default).
   * 'instant' — mounts directly into a running session.
   */
  startMode?: "guided" | "instant"
  /** Slide-up settings content for instant activities */
  settingsSheet?: ReactNode
}

function phaseResumeHint(kind: PhaseKind): string {
  if (kind === "exhale") return "You were mid-exhale."
  if (kind === "hold") return "You were mid-hold."
  return "You were mid-inhale."
}

export function PacedSession({
  activity,
  pattern,
  durationOptions,
  defaultCycles,
  howItWorks,
  visualizer,
  safetyNotice = null,
  backHref = "/patient/library",
  audioProfile = "box",
  showStopAnytime = false,
  firstSessionCycles,
  sessionSlug,
  title,
  description,
  modeOptions,
  mode,
  onModeChange,
  beginDisabled = false,
  beginLabel,
  footerNote,
  teachingStep = null,
  sessionCoach = null,
  sessionChrome = null,
  hidePhaseLabel = false,
  startMode = "guided",
  settingsSheet = null,
}: SessionShellProps) {
  const router = useRouter()
  const hydrated = useStoreHydration()
  const prefs = useSessionStore((s) => s.prefs)
  const setPref = useSessionStore((s) => s.setPref)
  const addSession = useSessionStore((s) => s.addSession)
  const hasCompleted = useSessionStore((s) => s.hasCompletedActivity)
  const setSessionActive = useSessionStore((s) => s.setSessionActive)
  const historySlug = sessionSlug ?? activity.slug
  const isFirstSession =
    !!firstSessionCycles && !hasCompleted(historySlug)

  const resolvedDefault = isFirstSession
    ? firstSessionCycles
    : defaultCycles

  const optionsWithChip = useMemo(
    () =>
      durationOptions.map((o) => ({
        ...o,
        recommend: isFirstSession && o.cycles === firstSessionCycles,
      })),
    [durationOptions, firstSessionCycles, isFirstSession]
  )

  const [screen, setScreen] = useState<Screen>(
    startMode === "instant" ? "session" : "pre"
  )
  const [cycles, setCycles] = useState(resolvedDefault)
  const [countdown, setCountdown] = useState(3)
  const [chromeDimmed, setChromeDimmed] = useState(false)
  const [confirmEnd, setConfirmEnd] = useState(false)
  const [liveAnnounce, setLiveAnnounce] = useState("")
  const [result, setResult] = useState<{
    cyclesCompleted: number
    durationMs: number
    completedFully: boolean
    endedEarly: boolean
  } | null>(null)

  const startedAtIsoRef = useRef("")
  const savedRef = useRef(false)
  const moodRef = useRef<1 | 2 | 3 | 4 | 5 | undefined>(undefined)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownRafRef = useRef<number | null>(null)
  const reducedMotion = usePrefersReducedMotion()
  const audio = useSessionAudio(prefs.sound, {
    profile: audioProfile,
    exhaleGuide: prefs.exhaleGuide,
    bellyGuideTone: prefs.bellyGuideTone ?? false,
  })

  useEffect(() => {
    if (!hydrated) return
    setCycles(resolvedDefault)
  }, [hydrated, resolvedDefault])

  useEffect(() => {
    if (!durationOptions.some((o) => o.cycles === cycles)) {
      setCycles(resolvedDefault)
    }
  }, [durationOptions, cycles, resolvedDefault])

  const onPhaseChange = useCallback(
    (phaseId: string, _cycle: number, detail?: { spec: { kind: PhaseKind; label: string; seconds: number } }) => {
      void phaseId
      const spec = detail?.spec
      if (!spec) return
      if (audioProfile === "belly") {
        if (spec.kind === "inhale") {
          setLiveAnnounce(
            `Breathe in, ${spec.seconds} seconds, let your belly rise`
          )
        } else if (spec.kind === "exhale") {
          setLiveAnnounce(`Breathe out, ${spec.seconds} seconds`)
        } else {
          setLiveAnnounce(`${spec.label}, ${spec.seconds} seconds`)
        }
        audio.cuePhaseKind(spec.kind)
        hapticTick(prefs.haptics, 10)
        return
      }
      setLiveAnnounce(`${spec.label}, ${spec.seconds} seconds`)
      audio.cuePhaseKind(spec.kind)
      if (spec.kind === "exhale" && audioProfile === "478") {
        hapticExhale(prefs.haptics)
      } else {
        hapticTick(prefs.haptics)
      }
    },
    [audio, audioProfile, prefs.haptics]
  )

  const persistSession = useCallback(
    (opts: {
      durationMs: number
      cyclesCompleted: number
      cyclesPlanned: number
      completed: boolean
      endedEarly?: boolean
      mood?: 1 | 2 | 3 | 4 | 5
    }) => {
      if (savedRef.current) return
      savedRef.current = true
      addSession({
        activitySlug: historySlug,
        startedAt: startedAtIsoRef.current || new Date().toISOString(),
        durationMs: opts.durationMs,
        cyclesCompleted: opts.cyclesCompleted,
        cyclesPlanned: opts.cyclesPlanned,
        completed: opts.completed,
        endedEarly: opts.endedEarly,
        mood: opts.mood ?? moodRef.current,
      })
    },
    [addSession, historySlug]
  )

  const engine = useBreathingEngine({
    pattern,
    totalCycles: cycles,
    onPhaseChange,
    onComplete: () => {
      setResult({
        cyclesCompleted: cycles,
        durationMs: cycles * pattern.cycleSeconds * 1000,
        completedFully: true,
        endedEarly: false,
      })
      setScreen("complete")
      void audio.suspend()
    },
  })

  useWakeLock(screen === "session" && engine.status === "running")

  useEffect(() => {
    if (screen === "session" || screen === "countdown") {
      setSessionActive(true)
    } else {
      setSessionActive(false)
    }
    return () => setSessionActive(false)
  }, [screen, setSessionActive])

  // Instant mode: start engine as soon as hydrated
  useEffect(() => {
    if (startMode !== "instant" || !hydrated) return
    if (screen !== "session") return
    if (engine.status !== "idle") return
    startedAtIsoRef.current = new Date().toISOString()
    savedRef.current = false
    void audio.unlock()
    engine.start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startMode, hydrated, screen])

  useEffect(() => {
    if (screen !== "countdown") return
    let cancelled = false
    const start = performance.now()
    const tick = (now: number) => {
      if (cancelled) return
      const elapsed = now - start
      const next = Math.max(0, 3 - Math.floor(elapsed / 1000))
      setCountdown((c) => (c !== next ? next : c))
      if (elapsed >= 3000) {
        startedAtIsoRef.current = new Date().toISOString()
        savedRef.current = false
        setScreen("session")
        engine.start()
        return
      }
      countdownRafRef.current = requestAnimationFrame(tick)
    }
    countdownRafRef.current = requestAnimationFrame(tick)
    return () => {
      cancelled = true
      if (countdownRafRef.current !== null) {
        cancelAnimationFrame(countdownRafRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen])

  const skipCountdown = useCallback(() => {
    if (countdownRafRef.current !== null) {
      cancelAnimationFrame(countdownRafRef.current)
    }
    startedAtIsoRef.current = new Date().toISOString()
    savedRef.current = false
    setScreen("session")
    engine.start()
  }, [engine])

  const bumpChrome = useCallback(() => {
    setChromeDimmed(false)
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    if (reducedMotion) return
    idleTimerRef.current = setTimeout(() => setChromeDimmed(true), 5000)
  }, [reducedMotion])

  useEffect(() => {
    if (screen !== "session") return
    bumpChrome()
    const onMove = () => bumpChrome()
    window.addEventListener("pointermove", onMove)
    window.addEventListener("keydown", onMove)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("keydown", onMove)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [screen, bumpChrome])

  const finishSession = useCallback(
    (opts: { endedEarly: boolean; completed: boolean }) => {
      const { cyclesCompleted, elapsedMs } = engine.end()
      setResult({
        cyclesCompleted,
        durationMs: elapsedMs,
        completedFully: opts.completed && !opts.endedEarly,
        endedEarly: opts.endedEarly,
      })
      setScreen("complete")
      setConfirmEnd(false)
      void audio.suspend()
    },
    [audio, engine]
  )

  const finishEarly = useCallback(() => {
    finishSession({ endedEarly: false, completed: false })
  }, [finishSession])

  const stopAnytime = useCallback(() => {
    finishSession({ endedEarly: true, completed: true })
  }, [finishSession])

  useEffect(() => {
    if (screen !== "session") return
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        const tag = (e.target as HTMLElement)?.tagName
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON") return
        e.preventDefault()
        if (engine.status === "running") {
          engine.pause()
          void audio.suspend()
        } else if (engine.status === "paused") {
          engine.resume()
          void audio.resumeAudio()
        }
      }
      if (e.key === "Escape") {
        e.preventDefault()
        setConfirmEnd(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [screen, engine, audio])

  useEffect(() => {
    if (screen !== "session") return
    if (startMode === "instant") return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [screen, startMode])

  const isNarrowLandscape = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => undefined
      const mq = window.matchMedia(
        "(orientation: landscape) and (max-height: 500px)"
      )
      mq.addEventListener("change", onStoreChange)
      return () => mq.removeEventListener("change", onStoreChange)
    },
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(orientation: landscape) and (max-height: 500px)")
        .matches,
    () => false
  )

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

  if (screen === "pre") {
    return (
      <div className="min-h-[100dvh] bg-canvas">
        <PreSessionCard
          activity={activity}
          title={title}
          description={description}
          cycles={cycles}
          sound={prefs.sound}
          haptics={prefs.haptics}
          backHref={backHref}
          durationOptions={optionsWithChip}
          howItWorks={howItWorks}
          safetyNotice={safetyNotice}
          modeOptions={modeOptions}
          mode={mode}
          onModeChange={onModeChange}
          beginDisabled={beginDisabled}
          beginLabel={beginLabel}
          footerNote={footerNote}
          teachingStep={teachingStep}
          onCyclesChange={setCycles}
          onSoundChange={(v) => setPref("sound", v)}
          onHapticsChange={(v) => setPref("haptics", v)}
          onBegin={async () => {
            await audio.unlock()
            setCountdown(3)
            setScreen("countdown")
          }}
        />
      </div>
    )
  }

  if (screen === "countdown") {
    return (
      <button
        type="button"
        className="flex min-h-[100dvh] w-full flex-col items-center justify-center bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        onClick={skipCountdown}
        aria-label="Skip countdown"
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={countdown}
            className="text-7xl font-semibold tabular-nums text-ink"
            initial={{ scale: 1.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {countdown === 0 ? "" : countdown}
          </motion.span>
        </AnimatePresence>
        <p className="mt-6 text-sm text-ink-subtle">Tap to skip</p>
      </button>
    )
  }

  if (screen === "complete" && result) {
    return (
      <div className="min-h-[100dvh] bg-canvas">
        <SessionCompleteCard
          plannedCycles={cycles}
          cyclesCompleted={result.cyclesCompleted}
          durationMs={result.durationMs}
          completedFully={result.completedFully}
          endedEarly={result.endedEarly}
          onSaveMood={(m) => {
            moodRef.current = m
          }}
          onDone={() => {
            persistSession({
              durationMs: result.durationMs,
              cyclesCompleted: result.cyclesCompleted,
              cyclesPlanned: cycles,
              completed: result.endedEarly ? true : result.completedFully,
              endedEarly: result.endedEarly,
              mood: moodRef.current,
            })
            router.push(backHref)
          }}
          onAgain={() => {
            persistSession({
              durationMs: result.durationMs,
              cyclesCompleted: result.cyclesCompleted,
              cyclesPlanned: cycles,
              completed: result.endedEarly ? true : result.completedFully,
              endedEarly: result.endedEarly,
              mood: moodRef.current,
            })
            savedRef.current = false
            moodRef.current = undefined
            setResult(null)
            if (startMode === "instant") {
              setScreen("session")
              startedAtIsoRef.current = new Date().toISOString()
              engine.restart()
            } else {
              setScreen("pre")
            }
          }}
        />
        {settingsSheet}
      </div>
    )
  }

  const dimChrome = chromeDimmed && !reducedMotion

  return (
    <div
      className="relative min-h-[100dvh] bg-canvas"
      role="timer"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="sr-only">{liveAnnounce}</span>

      {engine.awaitingResume && (
        <div className="absolute inset-x-0 top-4 z-20 mx-auto flex max-w-sm justify-center px-4">
          <div className="rounded-3xl border border-hairline bg-surface px-5 py-4 text-center shadow-[0_1px_3px_rgba(20,33,61,0.06),0_8px_24px_-12px_rgba(20,33,61,0.10)]">
            <p className="text-[15px] leading-relaxed text-ink-muted">
              {phaseResumeHint(engine.phaseSpec.kind)} Ready when you are.
            </p>
            <button
              type="button"
              className="mt-3 inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
              onClick={() => {
                engine.resume()
                void audio.resumeAudio()
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      <div
        className={`mx-auto flex min-h-[100dvh] max-w-3xl flex-col px-4 py-6 ${
          isNarrowLandscape
            ? "items-center justify-center gap-6 landscape:flex-row landscape:items-center"
            : "items-center justify-between gap-4"
        }`}
      >
        <div
          className={`w-full transition-opacity duration-500 ${
            dimChrome ? "opacity-40" : "opacity-100"
          }`}
        >
          {!hidePhaseLabel ? (
            <PhaseLabel
              label={engine.phaseSpec.label}
              hint={engine.phaseSpec.hint}
              remaining={engine.phaseRemaining}
            />
          ) : null}
        </div>

        <div className="flex w-full flex-col items-center gap-3">
          {visualizer(engine)}
          {typeof sessionCoach === "function"
            ? sessionCoach(engine)
            : sessionCoach}
        </div>

        {typeof sessionChrome === "function"
          ? sessionChrome(engine)
          : sessionChrome}

        <div className="flex w-full flex-col gap-6">
          <div
            className={`transition-opacity duration-500 ${
              dimChrome ? "opacity-40" : "opacity-100"
            }`}
          >
            <CycleProgress cycle={engine.cycle} totalCycles={cycles} />
          </div>
          <SessionControls
            status={engine.status}
            sound={prefs.sound}
            haptics={prefs.haptics}
            dimmed={dimChrome}
            stopAnytime={
              showStopAnytime ? (
                <button
                  type="button"
                  className="min-h-11 text-sm text-ink-subtle underline-offset-2 hover:text-ink-muted hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
                  aria-label="End session early"
                  onClick={stopAnytime}
                >
                  Feeling lightheaded? Stop anytime
                </button>
              ) : null
            }
            onTogglePause={() => {
              if (engine.status === "running") {
                engine.pause()
                void audio.suspend()
              } else if (engine.status === "paused") {
                engine.resume()
                void audio.resumeAudio()
              }
            }}
            onRestart={() => {
              savedRef.current = false
              startedAtIsoRef.current = new Date().toISOString()
              engine.restart()
            }}
            onEnd={() => setConfirmEnd(true)}
            onToggleSound={() => setPref("sound", !prefs.sound)}
            onToggleHaptics={() => setPref("haptics", !prefs.haptics)}
          />
        </div>
      </div>

      <LeaveConfirmDialog
        open={confirmEnd}
        onKeepGoing={() => setConfirmEnd(false)}
        onLeave={finishEarly}
      />
    </div>
  )
}


/** @deprecated Prefer PacedSession — kept so existing imports stay stable. */
export const SessionShell = PacedSession
export type { SessionShellProps as PacedSessionProps }
