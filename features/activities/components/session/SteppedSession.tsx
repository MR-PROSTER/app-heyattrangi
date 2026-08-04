"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import type { MotionValue } from "framer-motion"
import type { Activity, StepResult, StepSpec } from "../../types"
import { useSessionStore } from "../../store/useSessionStore"
import { useAdvisoryTimer } from "../../hooks/useAdvisoryTimer"
import {
  LeaveConfirmDialog,
  SessionFrame,
  SessionHydrationGate,
  useIdleChromeDim,
  useSessionLifecycle,
  useSessionNavigation,
  useStoreHydration,
} from "./SessionFrame"

export interface AdvisoryContext {
  progressMv: MotionValue<number>
  progress: number
  complete: boolean
  remainingMs: number
  paused: boolean
}

export interface StepContext {
  step: StepSpec
  stepIndex: number
  totalSteps: number
  filled: number
  entries: string[]
  skipped: boolean
  substituted: boolean
  fillNext: () => void
  setEntryText: (index: number, text: string) => void
  undoLast: () => void
  skip: () => void
  substitute: () => void
  useOriginal: () => void
  goNext: () => void
  canAdvance: boolean
  showLookAgain: boolean
  dismissLookAgain: () => void
  lookAgain: () => void
  /** Present when step.suggestedSeconds is set */
  advisory: AdvisoryContext | null
  sessionPaused: boolean
  pauseSession: () => void
  resumeSession: () => void
  announce: (message: string) => void
}

export interface SteppedSessionProps {
  activity: Activity
  steps: readonly StepSpec[]
  renderStep: (ctx: StepContext) => ReactNode
  onComplete: (result: StepResult[]) => void
  backHref?: string
  sessionSlug?: string
  /** Pre-session content; when null, starts on first step */
  preSession?: ReactNode
  onBegin?: () => void
  /** Persist key for in-progress draft in sessionStorage */
  draftKey?: string
  /** Fired once when the advisory ring completes (chime hook) */
  onAdvisoryComplete?: (stepId: string) => void
}

interface StepState {
  filled: number
  entries: string[]
  skipped: boolean
  substituted: boolean
  startedAt: number
}

function emptyStepState(): StepState {
  return {
    filled: 0,
    entries: [],
    skipped: false,
    substituted: false,
    startedAt: Date.now(),
  }
}

export function SteppedSession({
  activity,
  steps,
  renderStep,
  onComplete,
  backHref = "/patient/library",
  sessionSlug,
  preSession = null,
  onBegin,
  draftKey = `stepped-draft-${activity.slug}`,
  onAdvisoryComplete,
}: SteppedSessionProps) {
  const hydrated = useStoreHydration()
  const addSession = useSessionStore((s) => s.addSession)
  const { goBack } = useSessionNavigation(backHref)
  const historySlug = sessionSlug ?? activity.slug

  const [phase, setPhase] = useState<"pre" | "session" | "complete">(
    preSession ? "pre" : "session"
  )
  const [stepIndex, setStepIndex] = useState(0)
  const [states, setStates] = useState<StepState[]>(() =>
    steps.map(() => emptyStepState())
  )
  const [confirmLeave, setConfirmLeave] = useState(false)
  const [lookAgainShown, setLookAgainShown] = useState(false)
  const [showLookAgain, setShowLookAgain] = useState(false)
  const [liveAnnounce, setLiveAnnounce] = useState("")
  const [sessionPaused, setSessionPaused] = useState(false)
  const startedAtIsoRef = useRef(new Date().toISOString())
  const savedRef = useRef(false)
  const statesRef = useRef(states)
  statesRef.current = states
  const stepIndexRef = useRef(stepIndex)
  stepIndexRef.current = stepIndex
  const onAdvisoryCompleteRef = useRef(onAdvisoryComplete)
  onAdvisoryCompleteRef.current = onAdvisoryComplete

  const active = phase === "session"
  useSessionLifecycle({ active, wakeLock: active })
  useIdleChromeDim(active)

  const step = steps[stepIndex]
  const state = states[stepIndex] ?? emptyStepState()

  const handleAdvisoryComplete = useCallback(() => {
    if (step) onAdvisoryCompleteRef.current?.(step.id)
  }, [step])

  const advisoryTimer = useAdvisoryTimer(step?.suggestedSeconds, {
    running: active && !sessionPaused,
    resetKey: step?.id,
    onComplete: handleAdvisoryComplete,
  })

  // Don't restore draft into a fresh mount if we only just created empty state —
  // require startedAt and a non-zero step or filled slot
  useEffect(() => {
    if (!hydrated || typeof sessionStorage === "undefined") return
    try {
      const raw = sessionStorage.getItem(draftKey)
      if (!raw) return
      const draft = JSON.parse(raw) as {
        stepIndex?: number
        states?: StepState[]
        startedAt?: string
      }
      if (
        typeof draft.stepIndex === "number" &&
        Array.isArray(draft.states) &&
        draft.states.length === steps.length &&
        (draft.stepIndex > 0 ||
          draft.states.some((s) => s.filled > 0 || s.skipped))
      ) {
        setStepIndex(
          Math.min(Math.max(0, draft.stepIndex), steps.length - 1)
        )
        setStates(draft.states)
        if (draft.startedAt) startedAtIsoRef.current = draft.startedAt
        setPhase("session")
      }
    } catch {
      // ignore corrupt draft
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, draftKey])

  const clearDraft = useCallback(() => {
    try {
      sessionStorage.removeItem(draftKey)
    } catch {
      // ignore
    }
  }, [draftKey])

  const persistDraft = useCallback(() => {
    if (phase !== "session") return
    try {
      sessionStorage.setItem(
        draftKey,
        JSON.stringify({
          stepIndex: stepIndexRef.current,
          states: statesRef.current,
          startedAt: startedAtIsoRef.current,
        })
      )
    } catch {
      // ignore
    }
  }, [draftKey, phase])

  useEffect(() => {
    if (phase !== "session") return
    persistDraft()
  }, [phase, stepIndex, states, persistDraft])

  const updateCurrent = useCallback(
    (patch: Partial<StepState>) => {
      setStates((prev) =>
        prev.map((s, i) => (i === stepIndex ? { ...s, ...patch } : s))
      )
    },
    [stepIndex]
  )

  const fillNext = useCallback(() => {
    setStates((prev) => {
      const cur = prev[stepIndex]
      if (!cur || !step || cur.filled >= step.count) return prev
      return prev.map((s, i) =>
        i === stepIndex
          ? {
              ...s,
              filled: s.filled + 1,
              entries: [...s.entries, ""],
              skipped: false,
            }
          : s
      )
    })
  }, [step, stepIndex])

  const setEntryText = useCallback(
    (index: number, text: string) => {
      setStates((prev) => {
        const cur = prev[stepIndex]
        if (!cur) return prev
        const entries = [...cur.entries]
        entries[index] = text.slice(0, 120)
        return prev.map((s, i) =>
          i === stepIndex ? { ...s, entries } : s
        )
      })
    },
    [stepIndex]
  )

  const undoLast = useCallback(() => {
    setStates((prev) => {
      const cur = prev[stepIndex]
      if (!cur || cur.filled === 0) return prev
      const entries = cur.entries.slice(0, -1)
      return prev.map((s, i) =>
        i === stepIndex
          ? { ...s, filled: s.filled - 1, entries, skipped: false }
          : s
      )
    })
  }, [stepIndex])

  const buildResults = useCallback((): StepResult[] => {
    return steps.map((sp, i) => {
      const st = statesRef.current[i]
      return {
        stepId: sp.id,
        sense: sp.sense,
        filled: st?.skipped ? 0 : st?.filled ?? 0,
        skipped: !!st?.skipped,
        substituted: !!st?.substituted,
        entries: (st?.entries ?? []).filter(Boolean),
      }
    })
  }, [steps])

  const persistPartial = useCallback(
    (completed: boolean, results: StepResult[]) => {
      if (savedRef.current) return
      savedRef.current = true
      const stepsCompleted = results.filter((r) => {
        const spec = steps.find((s) => s.id === r.stepId)
        if (!spec) return false
        if (r.skipped) return true
        if (spec.count === 0) return r.filled >= 1
        return r.filled >= spec.count
      }).length
      addSession({
        activitySlug: historySlug,
        startedAt: startedAtIsoRef.current,
        durationMs: Date.now() - new Date(startedAtIsoRef.current).getTime(),
        cyclesCompleted: 0,
        cyclesPlanned: 0,
        completed,
        endedEarly: !completed,
        kind: "stepped",
        stepsCompleted,
      })
    },
    [addSession, historySlug, steps]
  )

  const finish = useCallback(() => {
    const results = buildResults()
    clearDraft()
    persistPartial(true, results)
    setPhase("complete")
    onComplete(results)
  }, [buildResults, clearDraft, onComplete, persistPartial])

  const markDwellDone = useCallback((idx: number) => {
    const next = statesRef.current.map((s, i) => {
      if (i !== idx) return s
      const spec = steps[idx]
      if (spec && spec.count === 0 && !s.skipped && s.filled === 0) {
        return { ...s, filled: 1 }
      }
      return s
    })
    statesRef.current = next
    setStates(next)
  }, [steps])

  const goNext = useCallback(() => {
    const idx = stepIndexRef.current
    const cur = statesRef.current[idx]
    const spec = steps[idx]
    if (!cur || !spec) return

    // Look-again only for gather steps (count > 0)
    if (
      !cur.skipped &&
      spec.count > 0 &&
      cur.filled >= spec.count &&
      !lookAgainShown &&
      idx < steps.length - 2
    ) {
      const elapsed = Date.now() - cur.startedAt
      const minMs = spec.count * 1200
      if (elapsed < minMs) {
        setShowLookAgain(true)
        setLookAgainShown(true)
        return
      }
    }

    markDwellDone(idx)
    setSessionPaused(false)

    if (idx >= steps.length - 1) {
      // Ensure dwell mark lands before buildResults
      queueMicrotask(() => finish())
      return
    }
    setShowLookAgain(false)
    setStepIndex((i) => i + 1)
    setStates((prev) =>
      prev.map((s, i) =>
        i === idx + 1 ? { ...s, startedAt: Date.now() } : s
      )
    )
  }, [steps, lookAgainShown, finish, markDwellDone])

  const skip = useCallback(() => {
    const idx = stepIndexRef.current
    setStates((prev) =>
      prev.map((s, i) =>
        i === idx
          ? { ...s, skipped: true, filled: 0, entries: [] }
          : s
      )
    )
    setShowLookAgain(false)
    setSessionPaused(false)
    if (idx >= steps.length - 1) {
      queueMicrotask(() => finish())
    } else {
      setStepIndex(idx + 1)
    }
  }, [steps.length, finish])

  const substitute = useCallback(() => {
    updateCurrent({ substituted: true })
  }, [updateCurrent])

  const useOriginal = useCallback(() => {
    updateCurrent({ substituted: false })
  }, [updateCurrent])

  const canAdvance =
    !!step &&
    (step.count === 0 || state.skipped || state.filled >= step.count)

  const advisory: AdvisoryContext | null = useMemo(() => {
    if (step?.suggestedSeconds == null) return null
    return {
      progressMv: advisoryTimer.progressMv,
      progress: advisoryTimer.progress,
      complete: advisoryTimer.complete,
      remainingMs: advisoryTimer.remainingMs,
      paused: advisoryTimer.paused || sessionPaused,
    }
  }, [
    step?.suggestedSeconds,
    advisoryTimer.progressMv,
    advisoryTimer.progress,
    advisoryTimer.complete,
    advisoryTimer.remainingMs,
    advisoryTimer.paused,
    sessionPaused,
  ])

  const ctx: StepContext = useMemo(
    () => ({
      step: step!,
      stepIndex,
      totalSteps: steps.length,
      filled: state.filled,
      entries: state.entries,
      skipped: state.skipped,
      substituted: state.substituted,
      fillNext,
      setEntryText,
      undoLast,
      skip,
      substitute,
      useOriginal,
      goNext,
      canAdvance,
      showLookAgain,
      dismissLookAgain: () => {
        setShowLookAgain(false)
        markDwellDone(stepIndex)
        if (stepIndex >= steps.length - 1) finish()
        else {
          setStepIndex((i) => i + 1)
        }
      },
      lookAgain: () => {
        setShowLookAgain(false)
        updateCurrent({
          filled: 0,
          entries: [],
          startedAt: Date.now(),
        })
      },
      advisory,
      sessionPaused,
      pauseSession: () => setSessionPaused(true),
      resumeSession: () => setSessionPaused(false),
      announce: (message: string) => setLiveAnnounce(message),
    }),
    [
      step,
      stepIndex,
      steps.length,
      state,
      fillNext,
      setEntryText,
      undoLast,
      skip,
      substitute,
      useOriginal,
      goNext,
      canAdvance,
      showLookAgain,
      finish,
      updateCurrent,
      advisory,
      sessionPaused,
      markDwellDone,
    ]
  )

  // Route leave confirm
  useEffect(() => {
    if (phase !== "session") return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [phase])

  useEffect(() => {
    if (phase !== "session") return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        setConfirmLeave(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [phase])

  return (
    <SessionHydrationGate hydrated={hydrated}>
      {phase === "pre" && preSession ? (
        <div className="min-h-[100dvh] bg-canvas">
          {preSession}
          <div className="mx-auto max-w-lg px-5 pb-10">
            <button
              type="button"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-brand px-8 text-base font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
              onClick={() => {
                onBegin?.()
                startedAtIsoRef.current = new Date().toISOString()
                savedRef.current = false
                setSessionPaused(false)
                setPhase("session")
                setStates(steps.map(() => emptyStepState()))
                setStepIndex(0)
              }}
            >
              Begin
            </button>
          </div>
        </div>
      ) : null}

      {phase === "session" && step ? (
        <SessionFrame liveAnnounce={liveAnnounce} ariaLive="polite">
          {renderStep(ctx)}
          <LeaveConfirmDialog
            open={confirmLeave}
            onKeepGoing={() => setConfirmLeave(false)}
            onLeave={() => {
              const results = buildResults()
              clearDraft()
              persistPartial(false, results)
              goBack()
            }}
          />
        </SessionFrame>
      ) : null}

      {phase === "complete" ? null : null}
    </SessionHydrationGate>
  )
}

/** Expose leave-save for tests */
export function __testBuildStepsCompleted(
  results: StepResult[],
  steps: readonly StepSpec[]
): number {
  return results.filter((r) => {
    const spec = steps.find((s) => s.id === r.stepId)
    if (!spec) return false
    if (r.skipped) return true
    if (spec.count === 0) return r.filled >= 1
    return r.filled >= spec.count
  }).length
}
