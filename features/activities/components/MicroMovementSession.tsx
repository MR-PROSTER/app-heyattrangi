"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import type { Activity, MovementLevel, MovementStep, StepResult } from "../types"
import {
  buildMicroMovementSteps,
  regionLabel,
} from "../data/microMovements"
import { useSessionStore } from "../store/useSessionStore"
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion"
import { useMicroMovementAudio } from "../hooks/useMicroMovementAudio"
import { hapticChime, hapticTick } from "../lib/haptics"
import {
  SteppedSession,
  type StepContext,
} from "./session/SteppedSession"
import { MovementFigure } from "./MovementFigure"
import { MotionSketch } from "./MotionSketch"

const SLUG = "micro-movement"
const AUTO_ADVANCE_AFTER_CHIME_MS = 4000

interface MicroMovementSessionProps {
  activity: Activity
  backHref?: string
}

function promptForLevel(step: MovementStep, level: MovementLevel): string {
  if (level === "gentler") return step.gentler
  if (level === "imagined") return step.imagined
  return step.prompt
}

function nextLevel(level: MovementLevel): MovementLevel {
  if (level === "standard") return "gentler"
  if (level === "gentler") return "imagined"
  return "standard"
}

function ProgressBars({
  total,
  current,
}: {
  total: number
  current: number
}) {
  return (
    <div
      className="mx-auto flex w-full max-w-xs gap-1.5"
      role="img"
      aria-label={`Step ${current + 1} of ${total}`}
      data-testid="micro-progress"
    >
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full ${
            i <= current ? "bg-accent" : "bg-hairline"
          }`}
        />
      ))}
    </div>
  )
}

function MicroStepView({
  ctx,
  step,
  level,
  showTryFull,
  onCycleEasier,
  onTryFull,
  eyesClosed,
  chimeDone,
}: {
  ctx: StepContext
  step: MovementStep
  level: MovementLevel
  showTryFull: boolean
  onCycleEasier: () => void
  onTryFull: () => void
  eyesClosed: boolean
  chimeDone: boolean
}) {
  const reducedMotion = usePrefersReducedMotion()
  const prompt = promptForLevel(step, level)
  const isWhole = step.bodyRegion === "whole"

  return (
    <div className="relative flex min-h-[100dvh] flex-col px-5 pb-10 pt-6">
      {!reducedMotion ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div
            className="absolute left-1/2 top-0 h-[70vmax] w-[70vmax] -translate-x-1/2"
            style={{
              background:
                "radial-gradient(circle, color-mix(in srgb, var(--color-accent) 6%, transparent), transparent 70%)",
              animation: "micro-drift 28s ease-in-out infinite",
            }}
          />
        </div>
      ) : null}

      {eyesClosed ? (
        <div
          aria-hidden
          data-testid="eyes-closed-overlay"
          className="pointer-events-none absolute inset-0 z-10 bg-ink/85"
        />
      ) : null}

      <div className="relative z-20 mx-auto flex w-full max-w-lg flex-1 flex-col">
        <div className="mb-6 flex items-center justify-between gap-3">
          <ProgressBars total={ctx.totalSteps} current={ctx.stepIndex} />
          <button
            type="button"
            className="min-h-11 shrink-0 px-2 text-sm text-ink-muted underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            onClick={
              ctx.sessionPaused ? ctx.resumeSession : ctx.pauseSession
            }
          >
            {ctx.sessionPaused ? "Resume" : "Pause"}
          </button>
        </div>

        <div
          className={`flex flex-1 flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center ${
            eyesClosed ? "opacity-40" : ""
          }`}
        >
          <MovementFigure region={step.bodyRegion} />
          <MotionSketch
            region={step.bodyRegion}
            showSketch={!isWhole}
            progressMv={ctx.advisory?.progressMv ?? null}
            advisoryComplete={!!ctx.advisory?.complete}
          />
        </div>

        <div className={`relative z-20 mt-8 ${eyesClosed ? "sr-only" : ""}`}>
          <p className="text-center text-xs font-medium uppercase tracking-wide text-ink-subtle">
            {regionLabel(step.bodyRegion)}
          </p>
          <AnimatePresence mode="wait">
            <motion.p
              key={`${step.id}-${level}-${prompt}`}
              className="mt-3 text-center text-xl font-medium leading-snug text-ink sm:text-2xl"
              initial={
                reducedMotion ? false : { opacity: 0, y: 10 }
              }
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.4 }}
            >
              {prompt}
            </motion.p>
          </AnimatePresence>

          {step.bodyRegion !== "whole" ? (
            <div className="mt-4 flex flex-col items-center gap-2">
              <button
                type="button"
                className="min-h-11 px-3 text-sm text-ink-muted underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                aria-label="Show an easier version of this movement"
                onClick={onCycleEasier}
              >
                Make this easier
              </button>
              {showTryFull ? (
                <button
                  type="button"
                  className="min-h-11 px-3 text-sm text-accent underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  onClick={onTryFull}
                >
                  Try the full version
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="relative z-20 mt-auto flex flex-col gap-3 pt-10">
          {chimeDone && !eyesClosed ? (
            <p className="text-center text-sm text-ink-subtle">
              When you&apos;re ready
            </p>
          ) : null}
          <button
            type="button"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-brand px-8 text-base font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
            onClick={ctx.goNext}
            data-testid="micro-next"
          >
            Next
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 w-full items-center justify-center text-sm text-ink-subtle underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onClick={ctx.skip}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  )
}

export function MicroMovementSession({
  activity,
  backHref = "/patient/library",
}: MicroMovementSessionProps) {
  const prefs = useSessionStore((s) => s.prefs)
  const setPref = useSessionStore((s) => s.setPref)
  const setMovementLevel = useSessionStore((s) => s.setMovementLevel)

  const [discreetMode, setDiscreetMode] = useState(
    () => prefs.discreetMode ?? false
  )
  const [eyesClosedMode, setEyesClosedMode] = useState(
    () => prefs.eyesClosedMode ?? false
  )
  const [autoAdvance, setAutoAdvance] = useState(
    () => prefs.autoAdvance ?? false
  )
  const [eyesClosedActive, setEyesClosedActive] = useState(false)
  const [audioFallbackNote, setAudioFallbackNote] = useState<string | null>(
    null
  )
  const [results, setResults] = useState<StepResult[] | null>(null)
  const [sessionKey, setSessionKey] = useState(0)
  const [chimeStepId, setChimeStepId] = useState<string | null>(null)

  const activeSteps = useMemo(
    () => buildMicroMovementSteps(discreetMode),
    [discreetMode]
  )

  const gainScale = eyesClosedActive ? 1 : 0.3 / 0.45
  const soundOn =
    eyesClosedActive || (prefs.sound ?? true)
  const audio = useMicroMovementAudio(soundOn, gainScale)

  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  )
  const autoAdvanceRemainingRef = useRef(0)
  const autoAdvanceStartedAtRef = useRef<number | null>(null)
  const autoAdvancePausedRef = useRef(false)
  const goNextRef = useRef<(() => void) | null>(null)

  const clearAutoAdvance = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current)
      autoAdvanceTimerRef.current = null
    }
    autoAdvanceStartedAtRef.current = null
    autoAdvanceRemainingRef.current = 0
    autoAdvancePausedRef.current = false
  }, [])

  const scheduleAutoAdvance = useCallback(
    (delayMs: number) => {
      clearAutoAdvance()
      if (!eyesClosedActive || !autoAdvance) return
      autoAdvanceRemainingRef.current = delayMs
      autoAdvanceStartedAtRef.current = performance.now()
      autoAdvanceTimerRef.current = setTimeout(() => {
        autoAdvanceTimerRef.current = null
        autoAdvanceRemainingRef.current = 0
        autoAdvanceStartedAtRef.current = null
        goNextRef.current?.()
      }, delayMs)
    },
    [autoAdvance, clearAutoAdvance, eyesClosedActive]
  )

  const handleAdvisoryComplete = useCallback(
    (stepId: string) => {
      setChimeStepId(stepId)
      audio.cueAdvisoryComplete()
      hapticChime(prefs.haptics)
      if (eyesClosedActive && autoAdvance) {
        scheduleAutoAdvance(AUTO_ADVANCE_AFTER_CHIME_MS)
      }
    },
    [
      audio,
      autoAdvance,
      eyesClosedActive,
      prefs.haptics,
      scheduleAutoAdvance,
    ]
  )

  useEffect(() => () => clearAutoAdvance(), [clearAutoAdvance])

  const onBegin = useCallback(async () => {
    setPref("discreetMode", discreetMode)
    setPref("eyesClosedMode", eyesClosedMode)
    setPref("autoAdvance", autoAdvance)
    setAudioFallbackNote(null)
    setChimeStepId(null)
    clearAutoAdvance()

    if (eyesClosedMode) {
      const unlocked = await audio.unlock()
      if (!unlocked) {
        setEyesClosedActive(false)
        setAudioFallbackNote(
          "Sound couldn’t start, so we’re keeping the screen visible."
        )
        return
      }
      setEyesClosedActive(true)
    } else {
      setEyesClosedActive(false)
      if (prefs.sound) await audio.unlock()
    }
  }, [
    audio,
    autoAdvance,
    clearAutoAdvance,
    discreetMode,
    eyesClosedMode,
    prefs.sound,
    setPref,
  ])

  const preSession = (
    <div className="mx-auto max-w-lg px-5 pt-10">
      <Link
        href={backHref}
        className="mb-6 inline-flex min-h-11 items-center text-sm text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Explore
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight text-ink">
        {activity.title}
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
        {activity.longDescription}
      </p>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
        Nothing here should hurt. If something does, skip it — that&apos;s the
        right call, not a failure.
      </p>

      <div className="mt-8 space-y-5">
        <div>
          <label className="flex min-h-11 cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 accent-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-accent"
              checked={discreetMode}
              onChange={(e) => setDiscreetMode(e.target.checked)}
              aria-describedby="discreet-help"
            />
            <span>
              <span className="block text-[15px] font-medium text-ink">
                I&apos;m around other people
              </span>
              <span
                id="discreet-help"
                className="mt-0.5 block text-sm text-ink-subtle"
              >
                Keeps everything invisible to anyone nearby.
              </span>
            </span>
          </label>
          <p className="mt-2 pl-8 text-sm text-ink-muted" data-testid="discreet-state">
            Discreet mode: {discreetMode ? "on" : "off"}
            {discreetMode
              ? " — 9 quiet movements, no neck tilt."
              : " — full 8-step sequence."}
          </p>
        </div>

        <div>
          <label className="flex min-h-11 cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 accent-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-accent"
              checked={eyesClosedMode}
              onChange={(e) => {
                setEyesClosedMode(e.target.checked)
                if (!e.target.checked) setAutoAdvance(false)
              }}
              aria-describedby="eyes-help"
            />
            <span>
              <span className="block text-[15px] font-medium text-ink">
                Eyes closed
              </span>
              <span
                id="eyes-help"
                className="mt-0.5 block text-sm text-ink-subtle"
              >
                Dims the screen and leads with sound. Works better this way
                for many people.
              </span>
            </span>
          </label>
        </div>

        {eyesClosedMode ? (
          <label className="flex min-h-11 cursor-pointer items-start gap-3 pl-1">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 accent-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-accent"
              checked={autoAdvance}
              onChange={(e) => setAutoAdvance(e.target.checked)}
              aria-describedby="auto-help"
            />
            <span>
              <span className="block text-[15px] font-medium text-ink">
                Advance on its own
              </span>
              <span
                id="auto-help"
                className="mt-0.5 block text-sm text-ink-subtle"
              >
                After the chime, waits 4 seconds then moves to the next step.
                Off by default.
              </span>
            </span>
          </label>
        ) : null}
      </div>
    </div>
  )

  if (results) {
    const allSkipped = results.every((r) => r.skipped)
    const allImagined = activeSteps.every((s) => {
      if (s.bodyRegion === "whole") return true
      const lvl = prefs.movementLevel?.[s.bodyRegion]
      return lvl === "imagined"
    })

    return (
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col items-center justify-center px-5 py-10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">
          {allSkipped
            ? "Not today, then. That's fine."
            : allImagined
              ? "You stayed with your body — that counts."
              : "You moved through it."}
        </h1>
        {!allSkipped ? (
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-ink-muted">
            Notice how you feel now compared to a few minutes ago.
          </p>
        ) : null}
        <div className="mt-10 flex w-full max-w-sm flex-col gap-3">
          <Link
            href={backHref}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-8 text-base font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Done
          </Link>
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-hairline bg-surface text-sm font-medium text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onClick={() => {
              setResults(null)
              setSessionKey((k) => k + 1)
              setEyesClosedActive(false)
              setChimeStepId(null)
            }}
          >
            Go again
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes micro-drift {
          0%, 100% { transform: translate(-50%, -8%) scale(1); }
          50% { transform: translate(-46%, -4%) scale(1.04); }
        }
      `}</style>
      {audioFallbackNote ? (
        <p
          className="bg-accent-soft px-5 py-2 text-center text-sm text-ink"
          role="status"
        >
          {audioFallbackNote}
        </p>
      ) : null}
      <SteppedSession
        key={`${sessionKey}-${activeSteps.map((s) => s.id).join("-")}`}
        activity={activity}
        steps={activeSteps}
        sessionSlug={SLUG}
        backHref={backHref}
        preSession={preSession}
        onBegin={() => {
          void onBegin()
        }}
        onAdvisoryComplete={handleAdvisoryComplete}
        onComplete={(r) => {
          clearAutoAdvance()
          void audio.cueSessionEnd()
          setEyesClosedActive(false)
          setResults(r)
        }}
        renderStep={(ctx) => {
          goNextRef.current = ctx.goNext

          const step = activeSteps[ctx.stepIndex] as MovementStep
          const stored =
            prefs.movementLevel?.[step.bodyRegion] ?? "standard"
          const level: MovementLevel =
            stored === "skip" ? "standard" : stored
          const showTryFull =
            stored === "gentler" || stored === "imagined"

          return (
            <MicroStepInner
              ctx={ctx}
              step={step}
              level={level}
              showTryFull={showTryFull}
              eyesClosed={eyesClosedActive}
              chimeDone={chimeStepId === step.id}
              autoAdvance={autoAdvance}
              autoAdvanceRemainingRef={autoAdvanceRemainingRef}
              autoAdvanceStartedAtRef={autoAdvanceStartedAtRef}
              autoAdvancePausedRef={autoAdvancePausedRef}
              autoAdvanceTimerRef={autoAdvanceTimerRef}
              goNextRef={goNextRef}
              onCycleEasier={() => {
                const next = nextLevel(level)
                setMovementLevel(step.bodyRegion, next)
                ctx.announce(
                  `Step ${ctx.stepIndex + 1} of ${ctx.totalSteps}. ${regionLabel(step.bodyRegion)}. ${promptForLevel(step, next)}`
                )
              }}
              onTryFull={() => {
                setMovementLevel(step.bodyRegion, "standard")
                ctx.announce(
                  `Step ${ctx.stepIndex + 1} of ${ctx.totalSteps}. ${regionLabel(step.bodyRegion)}. ${step.prompt}`
                )
              }}
              onStepEnter={() => {
                setChimeStepId(null)
                clearAutoAdvance()
                audio.cueStepStart()
                hapticTick(prefs.haptics, 12)
                ctx.announce(
                  `Step ${ctx.stepIndex + 1} of ${ctx.totalSteps}. ${regionLabel(step.bodyRegion)}. ${promptForLevel(step, level)}`
                )
              }}
            />
          )
        }}
      />
    </>
  )
}

function MicroStepInner({
  ctx,
  step,
  level,
  showTryFull,
  eyesClosed,
  chimeDone,
  autoAdvance,
  autoAdvanceRemainingRef,
  autoAdvanceStartedAtRef,
  autoAdvancePausedRef,
  autoAdvanceTimerRef,
  goNextRef,
  onCycleEasier,
  onTryFull,
  onStepEnter,
}: {
  ctx: StepContext
  step: MovementStep
  level: MovementLevel
  showTryFull: boolean
  eyesClosed: boolean
  chimeDone: boolean
  autoAdvance: boolean
  autoAdvanceRemainingRef: MutableRefObject<number>
  autoAdvanceStartedAtRef: MutableRefObject<number | null>
  autoAdvancePausedRef: MutableRefObject<boolean>
  autoAdvanceTimerRef: MutableRefObject<ReturnType<
    typeof setTimeout
  > | null>
  goNextRef: MutableRefObject<(() => void) | null>
  onCycleEasier: () => void
  onTryFull: () => void
  onStepEnter: () => void
}) {
  const enteredRef = useRef<string | null>(null)
  useEffect(() => {
    if (enteredRef.current === step.id) return
    enteredRef.current = step.id
    onStepEnter()
  }, [step.id, onStepEnter])

  // Pause/resume auto-advance with session pause — full remaining interval after resume
  useEffect(() => {
    if (!eyesClosed || !autoAdvance) return
    if (ctx.sessionPaused) {
      if (autoAdvanceTimerRef.current && autoAdvanceStartedAtRef.current !== null) {
        const elapsed = performance.now() - autoAdvanceStartedAtRef.current
        autoAdvanceRemainingRef.current = Math.max(
          0,
          autoAdvanceRemainingRef.current - elapsed
        )
        clearTimeout(autoAdvanceTimerRef.current)
        autoAdvanceTimerRef.current = null
        autoAdvanceStartedAtRef.current = null
        autoAdvancePausedRef.current = true
      }
      return
    }
    if (
      autoAdvancePausedRef.current &&
      autoAdvanceRemainingRef.current > 0 &&
      !autoAdvanceTimerRef.current
    ) {
      autoAdvancePausedRef.current = false
      const rem = autoAdvanceRemainingRef.current
      autoAdvanceStartedAtRef.current = performance.now()
      autoAdvanceTimerRef.current = setTimeout(() => {
        autoAdvanceTimerRef.current = null
        autoAdvanceRemainingRef.current = 0
        autoAdvanceStartedAtRef.current = null
        goNextRef.current?.()
      }, rem)
    }
  }, [
    ctx.sessionPaused,
    eyesClosed,
    autoAdvance,
    autoAdvanceRemainingRef,
    autoAdvanceStartedAtRef,
    autoAdvancePausedRef,
    autoAdvanceTimerRef,
    goNextRef,
  ])

  return (
    <MicroStepView
      ctx={ctx}
      step={step}
      level={level}
      showTryFull={showTryFull}
      onCycleEasier={onCycleEasier}
      onTryFull={onTryFull}
      eyesClosed={eyesClosed}
      chimeDone={chimeDone}
    />
  )
}
