"use client"

import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import type { Activity } from "../types"
import {
  bellyDurationOptions,
  patternFromBellyPace,
  PATTERN_BELLY,
} from "../data/patterns"
import type { BreathingModeOption } from "../data/breathingModes"
import type { BellyPaceId } from "../store/useSessionStore"
import { useSessionStore } from "../store/useSessionStore"
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion"
import type { BreathingEngineState } from "../hooks/usePacedTimeline"
import { SessionShell } from "./SessionShell"
import { BellyBreathingFigure } from "./BellyBreathingFigure"
import {
  BELLY_COACH_LINES,
  BellyTeachingStep,
} from "./BellyTeachingStep"

const BELLY_HOW_IT_WORKS = [
  "Rest one hand on your chest and one on your belly.",
  "Breathe so the bottom hand rises and falls.",
  "Keep the top hand as still as you can.",
  "There is no depth to hit — just a few calm breaths.",
] as const

const PACE_ORDER: BellyPaceId[] = ["gentle", "standard", "deep"]

interface BellyBreathingSessionProps {
  activity: Activity
  backHref?: string
  modeOptions?: readonly BreathingModeOption[]
  mode?: string
  onModeChange?: (modeId: string) => void
}

function PacePicker({
  pace,
  onPaceChange,
}: {
  pace: BellyPaceId
  onPaceChange: (id: BellyPaceId) => void
}) {
  const variants = PATTERN_BELLY.paceVariants ?? []
  return (
    <fieldset className="mb-4">
      <legend className="mb-3 text-sm font-semibold text-ink">Pace</legend>
      <div
        className="flex flex-col gap-2"
        role="radiogroup"
        aria-label="Breathing pace"
      >
        {variants.map((v) => {
          const id = v.id as BellyPaceId
          const selected = pace === id
          const descId = `pace-desc-${v.id}`
          return (
            <div key={v.id}>
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                aria-describedby={descId}
                className={`flex min-h-11 w-full items-center justify-between rounded-2xl border px-4 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${
                  selected
                    ? "border-accent bg-accent-soft text-ink"
                    : "border-hairline bg-surface text-ink-muted hover:text-ink"
                }`}
                onClick={() => onPaceChange(id)}
              >
                <span>{v.label}</span>
                {id === "standard" ? (
                  <span className="text-[11px] font-normal text-accent">
                    Default
                  </span>
                ) : null}
              </button>
              <p id={descId} className="mt-1 px-1 text-[13px] text-ink-subtle">
                {v.description}
              </p>
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}

function SessionCoachLine({
  cycle,
  completedCount,
}: {
  cycle: number
  completedCount: number
}) {
  if (completedCount >= 5) return null
  const index =
    Math.floor(Math.max(0, cycle - 1) / 4) % BELLY_COACH_LINES.length
  const line = BELLY_COACH_LINES[index]
  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={line}
        className="max-w-xs text-center text-[13px] leading-relaxed text-ink-subtle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        data-testid="session-coach"
      >
        {line}
      </motion.p>
    </AnimatePresence>
  )
}

function PaceChrome({
  pace,
  onSlower,
  onFaster,
  toast,
}: {
  pace: BellyPaceId
  onSlower: () => void
  onFaster: () => void
  toast: string | null
}) {
  const idx = PACE_ORDER.indexOf(pace)
  const canSlower = idx > 0
  const canFaster = idx < PACE_ORDER.length - 1

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="min-h-11 rounded-full border border-hairline bg-surface px-4 text-sm text-ink-muted disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          aria-label="Slow the pace"
          disabled={!canSlower}
          onClick={onSlower}
        >
          Slower
        </button>
        <button
          type="button"
          className="min-h-11 rounded-full border border-hairline bg-surface px-4 text-sm text-ink-muted disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          aria-label="Speed up the pace"
          disabled={!canFaster}
          onClick={onFaster}
        >
          Faster
        </button>
      </div>
      <div
        aria-live="polite"
        className="min-h-5 text-center text-[13px] text-ink-subtle"
      >
        {toast}
      </div>
    </div>
  )
}

export function BellyBreathingSession({
  activity,
  backHref = "/patient/library",
  modeOptions,
  mode = "belly",
  onModeChange,
}: BellyBreathingSessionProps) {
  const prefs = useSessionStore((s) => s.prefs)
  const setPref = useSessionStore((s) => s.setPref)
  const hasCompleted = useSessionStore((s) => s.hasCompletedActivity)
  const history = useSessionStore((s) => s.history)
  const reducedMotion = usePrefersReducedMotion()

  const pace: BellyPaceId = prefs.bellyPace ?? "standard"
  const [teachExpanded, setTeachExpanded] = useState(false)
  const [walkthroughDone, setWalkthroughDone] = useState(false)
  const [paceToast, setPaceToast] = useState<string | null>(null)

  const pattern = useMemo(() => patternFromBellyPace(pace), [pace])
  const durationOptions = useMemo(
    () => bellyDurationOptions(pattern.cycleSeconds),
    [pattern.cycleSeconds]
  )
  const defaultCycles =
    durationOptions.find((d) => d.label === "3 min")?.cycles ?? 18

  const completedBelly = hasCompleted("belly")
  const bellySessionCount = history.filter(
    (s) =>
      s.completed &&
      (s.activitySlug === "belly" || s.activitySlug === "belly-breathing")
  ).length

  const inhaleSec = pattern.phases[0]?.seconds ?? 4
  const exhaleSec = pattern.phases[1]?.seconds ?? 6

  const showCollapsed = completedBelly && !teachExpanded
  const showWalkthrough =
    (!completedBelly && !walkthroughDone) || teachExpanded

  const teachingStep = (
    <div>
      <PacePicker
        pace={pace}
        onPaceChange={(id) => setPref("bellyPace", id)}
      />
      {showCollapsed ? (
        <BellyTeachingStep
          collapsed
          onExpand={() => setTeachExpanded(true)}
          onComplete={() => undefined}
          reducedMotion={reducedMotion}
          inhaleSec={inhaleSec}
          exhaleSec={exhaleSec}
        />
      ) : showWalkthrough ? (
        <BellyTeachingStep
          collapsed={false}
          onExpand={() => undefined}
          onComplete={() => {
            setPref("bellyTeachingSeen", true)
            setWalkthroughDone(true)
            setTeachExpanded(false)
          }}
          reducedMotion={reducedMotion}
          inhaleSec={inhaleSec}
          exhaleSec={exhaleSec}
        />
      ) : (
        <p className="mb-6 text-[15px] leading-relaxed text-ink-muted">
          Hand on belly, hand on chest — breathe so only the bottom hand moves.
        </p>
      )}
    </div>
  )

  const applyPace = (engine: BreathingEngineState, next: BellyPaceId) => {
    setPref("bellyPace", next)
    engine.requestPatternChange(patternFromBellyPace(next))
    setPaceToast("Switching at the end of this breath.")
    window.setTimeout(() => setPaceToast(null), 1500)
  }

  return (
    <SessionShell
      activity={activity}
      title="Belly Breathing"
      description="Simple diaphragmatic breaths — a gentle first practice."
      pattern={pattern}
      durationOptions={durationOptions}
      defaultCycles={defaultCycles}
      howItWorks={BELLY_HOW_IT_WORKS}
      backHref={backHref}
      audioProfile="belly"
      sessionSlug="belly"
      modeOptions={modeOptions}
      mode={mode}
      onModeChange={onModeChange}
      teachingStep={teachingStep}
      hidePhaseLabel
      visualizer={(engine) => <BellyBreathingFigure engine={engine} />}
      sessionCoach={(engine) => (
        <SessionCoachLine
          cycle={engine.cycle}
          completedCount={bellySessionCount}
        />
      )}
      sessionChrome={(engine) => (
        <PaceChrome
          pace={pace}
          toast={paceToast}
          onSlower={() => {
            const idx = PACE_ORDER.indexOf(pace)
            if (idx <= 0) return
            applyPace(engine, PACE_ORDER[idx - 1])
          }}
          onFaster={() => {
            const idx = PACE_ORDER.indexOf(pace)
            if (idx >= PACE_ORDER.length - 1) return
            applyPace(engine, PACE_ORDER[idx + 1])
          }}
        />
      )}
    />
  )
}
