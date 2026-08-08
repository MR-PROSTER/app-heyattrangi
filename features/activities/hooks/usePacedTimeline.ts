"use client"

/* rAF timing engine: callback + clock refs are synced intentionally outside React render. */
/* eslint-disable react-hooks/refs */

import { useCallback, useEffect, useRef, useState } from "react"
import { useMotionValue, type MotionValue } from "framer-motion"
import type {
  BreathingPattern,
  EngineStatus,
  Phase,
  PhaseSpec,
  Timeline,
  TimelineSegment,
} from "../types"

export interface PhaseChangeEvent {
  index: number
  spec: PhaseSpec
  cycle: number
}

export interface BreathingEngineOptions {
  pattern: BreathingPattern
  totalCycles: number
  /**
   * Fired once per phase transition. First arg is the stable phase id
   * (Box: inhale | hold-in | exhale | hold-out) so existing listeners keep working.
   * Third arg carries index + full spec for N-phase consumers.
   */
  onPhaseChange?: (
    phaseId: string,
    cycle: number,
    detail?: PhaseChangeEvent
  ) => void
  onComplete?: () => void
  /**
   * Fire onPhaseChange this many ms before the phase boundary (audio/haptic latency).
   * Default 0 — existing activities unchanged.
   */
  cueLeadMs?: number
  /**
   * 'countdown' — React re-render ~1×/sec for numeral (default).
   * 'phase' — React re-render only on phase/cycle/status (≤3×/cycle for sigh).
   */
  renderPolicy?: "countdown" | "phase"
  /**
   * 'pause' — auto-pause on hide (default; Box/478/Belly).
   * 'restart-cycle' — on return, rewind to start of current cycle.
   */
  visibilityMode?: "pause" | "restart-cycle"
  /** Fired when visibilityMode restarts the current cycle */
  onCycleRestarted?: () => void
}

export interface BreathingEngineState {
  status: EngineStatus
  /** Stable phase id (legacy Phase for box) */
  phase: Phase | string
  phaseIndex: number
  phaseSpec: PhaseSpec
  cycle: number
  phaseProgress: number
  phaseRemaining: number
  /** 0→1 across the whole cycle, weighted by real phase durations */
  cycleProgress: number
  elapsedMs: number
  cycleProgressMv: MotionValue<number>
  phaseProgressMv: MotionValue<number>
  awaitingResume: boolean
  cyclesCompleted: number
  start: () => void
  pause: () => void
  resume: () => void
  restart: () => void
  end: () => { cyclesCompleted: number; elapsedMs: number }
  /**
   * Queue a pattern change for the next cycle boundary (never mid-phase).
   * If idle/complete, applies immediately.
   */
  requestPatternChange: (next: BreathingPattern) => void
  /** True while a pace/pattern change is waiting for the cycle boundary */
  patternChangePending: boolean
}

export type PacedTimelineOptions =
  | (Omit<BreathingEngineOptions, "pattern" | "totalCycles"> & {
      timeline: Timeline
      totalCycles?: number
      pattern?: undefined
      onSegmentChange?: (
        segmentId: string,
        cycle: number,
        detail?: PhaseChangeEvent
      ) => void
    })
  | (BreathingEngineOptions & {
      timeline?: undefined
      onSegmentChange?: (
        segmentId: string,
        cycle: number,
        detail?: PhaseChangeEvent
      ) => void
    })

export interface PacedTimelineState extends BreathingEngineState {
  /** Alias of phaseIndex */
  segmentIndex: number
  /** Alias of phaseProgress */
  segmentProgress: number
  /** Alias of phaseProgressMv */
  segmentProgressMv: MotionValue<number>
  /** Current timeline segment */
  segment: TimelineSegment
}

interface Snapshot {
  status: EngineStatus
  phase: Phase | string
  phaseIndex: number
  phaseSpec: PhaseSpec
  cycle: number
  phaseProgress: number
  phaseRemaining: number
  cycleProgress: number
  elapsedMs: number
  awaitingResume: boolean
  cyclesCompleted: number
}

interface SegmentBoundary {
  elapsed: number
  cycle: number
  phaseIndex: number
  spec: PhaseSpec
}

function isPhaseSpec(meta: unknown): meta is PhaseSpec {
  return (
    typeof meta === "object" &&
    meta !== null &&
    "kind" in meta &&
    "seconds" in meta &&
    "label" in meta &&
    "id" in meta
  )
}

export function patternToTimeline(pattern: BreathingPattern): Timeline {
  return {
    id: pattern.id,
    loops: true,
    segments: pattern.phases.map((p) => ({
      id: p.id,
      seconds: p.seconds,
      label: p.label,
      hint: p.hint,
      meta: p,
    })),
  }
}

export function segmentToPhaseSpec(seg: TimelineSegment): PhaseSpec {
  if (isPhaseSpec(seg.meta)) return seg.meta
  return {
    id: seg.id,
    kind: "hold",
    seconds: seg.seconds,
    label: seg.label,
    hint: seg.hint,
  }
}

const EMPTY_PHASE: PhaseSpec = {
  id: "empty",
  kind: "hold",
  seconds: 0,
  label: "",
}

function resolveTimelineAndCycles(options: PacedTimelineOptions): {
  timeline: Timeline
  totalCycles: number
} {
  if (options.pattern) {
    return {
      timeline: patternToTimeline(options.pattern),
      totalCycles: options.totalCycles,
    }
  }
  const timeline = options.timeline
  if (!timeline.loops) {
    return { timeline, totalCycles: 1 }
  }
  // 0 = unlimited (never auto-completes)
  return { timeline, totalCycles: options.totalCycles ?? 1 }
}

function buildSegmentBoundaries(
  timeline: Timeline,
  totalCycles: number,
  /** Inclusive window for unlimited mode — avoid allocating infinite boundaries */
  range?: { fromMs: number; toMs: number }
): SegmentBoundary[] {
  const unlimited = timeline.loops && totalCycles <= 0
  const cycleMs = cycleMsOf(timeline)
  if (cycleMs <= 0) return []

  let startCycle = 1
  let endCycle = timeline.loops ? Math.max(1, totalCycles) : 1
  if (unlimited) {
    const from = range?.fromMs ?? 0
    const to = range?.toMs ?? from + cycleMs * 2
    startCycle = Math.max(1, Math.floor(from / cycleMs) + 1)
    endCycle = Math.max(startCycle, Math.floor(to / cycleMs) + 2)
  }

  const out: SegmentBoundary[] = []
  for (let c = startCycle; c <= endCycle; c++) {
    let t = (c - 1) * cycleMs
    for (let i = 0; i < timeline.segments.length; i++) {
      const seg = timeline.segments[i]
      out.push({
        elapsed: t,
        cycle: c,
        phaseIndex: i,
        spec: segmentToPhaseSpec(seg),
      })
      t += seg.seconds * 1000
    }
  }
  return out
}

function deriveFromTimeline(
  elapsedMs: number,
  timeline: Timeline,
  totalCycles: number
): {
  phase: Phase | string
  phaseIndex: number
  phaseSpec: PhaseSpec
  cycle: number
  phaseProgress: number
  phaseRemaining: number
  cycleProgress: number
  complete: boolean
  cyclesCompleted: number
} {
  const segments = timeline.segments
  if (segments.length === 0) {
    return {
      phase: "empty",
      phaseIndex: 0,
      phaseSpec: EMPTY_PHASE,
      cycle: 1,
      phaseProgress: 1,
      phaseRemaining: 0,
      cycleProgress: 1,
      complete: true,
      cyclesCompleted: 0,
    }
  }
  const durations = segments.map((s) => s.seconds * 1000)
  const cycleMs = durations.reduce((a, b) => a + b, 0)
  const unlimited = timeline.loops && totalCycles <= 0
  const cycles = unlimited
    ? Number.POSITIVE_INFINITY
    : timeline.loops
      ? totalCycles
      : 1
  const lastSeg = segments[segments.length - 1]
  const last = segmentToPhaseSpec(lastSeg)

  if (!unlimited && Number.isFinite(cycles) && elapsedMs >= cycleMs * cycles) {
    const finiteCycles = cycles as number
    return {
      phase: last.id,
      phaseIndex: segments.length - 1,
      phaseSpec: last,
      cycle: finiteCycles,
      phaseProgress: 1,
      phaseRemaining: 0,
      cycleProgress: 1,
      complete: true,
      cyclesCompleted: finiteCycles,
    }
  }

  const safeElapsed = Math.max(0, elapsedMs)
  const cycleIndex = Math.floor(safeElapsed / cycleMs)
  const withinCycle = safeElapsed - cycleIndex * cycleMs
  let acc = 0
  let phaseIndex = 0
  for (let i = 0; i < durations.length; i++) {
    if (withinCycle < acc + durations[i]) {
      phaseIndex = i
      break
    }
    acc += durations[i]
    if (i === durations.length - 1) phaseIndex = i
  }

  const phaseElapsed = withinCycle - acc
  const phaseDur = durations[phaseIndex]
  const phaseProgress = phaseDur > 0 ? Math.min(1, phaseElapsed / phaseDur) : 1
  const remainingMs = Math.max(0, phaseDur - phaseElapsed)
  const phaseRemaining = Math.max(0, Math.ceil(remainingMs / 1000))
  const spec = segmentToPhaseSpec(segments[phaseIndex])

  return {
    phase: spec.id,
    phaseIndex,
    phaseSpec: spec,
    cycle: cycleIndex + 1,
    phaseProgress,
    phaseRemaining,
    cycleProgress: cycleMs > 0 ? withinCycle / cycleMs : 0,
    complete: false,
    cyclesCompleted: cycleIndex,
  }
}

function deriveFromElapsed(
  elapsedMs: number,
  pattern: BreathingPattern,
  totalCycles: number
) {
  return deriveFromTimeline(
    elapsedMs,
    patternToTimeline(pattern),
    totalCycles
  )
}

function initialSnap(timeline: Timeline): Snapshot {
  const firstSeg = timeline.segments[0]
  const first = firstSeg ? segmentToPhaseSpec(firstSeg) : EMPTY_PHASE
  return {
    status: "idle",
    phase: first.id,
    phaseIndex: 0,
    phaseSpec: first,
    cycle: 1,
    phaseProgress: 0,
    phaseRemaining: Math.ceil(first.seconds),
    cycleProgress: 0,
    elapsedMs: 0,
    awaitingResume: false,
    cyclesCompleted: 0,
  }
}

function emitKeyFor(cycle: number, phaseIndex: number): string {
  return `${cycle}:${phaseIndex}`
}

function cycleMsOf(timeline: Timeline): number {
  return timeline.segments.reduce((a, s) => a + s.seconds * 1000, 0)
}

export function usePacedTimeline(
  options: PacedTimelineOptions
): PacedTimelineState {
  const resolved = resolveTimelineAndCycles(options)
  const {
    onPhaseChange,
    onComplete,
    cueLeadMs = 0,
    renderPolicy = "countdown",
    visibilityMode = "pause",
    onCycleRestarted,
    onSegmentChange,
  } = options

  const [snap, setSnap] = useState<Snapshot>(() =>
    initialSnap(resolved.timeline)
  )

  const cycleProgressMv = useMotionValue(0)
  const phaseProgressMv = useMotionValue(0)

  const statusRef = useRef<EngineStatus>("idle")
  const startedAtRef = useRef(0)
  const pauseAccumulatedRef = useRef(0)
  const pauseStartedRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastEmittedKeyRef = useRef<string | null>(null)
  const lastDisplaySecRef = useRef<number | null>(null)
  const lastPhaseIndexRef = useRef<number | null>(null)
  const lastCycleRef = useRef<number | null>(null)
  const lastStatusRef = useRef<EngineStatus>("idle")
  const lastAwaitingRef = useRef(false)
  const lastElapsedRef = useRef(0)
  const completedFiredRef = useRef(false)
  const autoPausedRef = useRef(false)
  const hiddenRestartRef = useRef(false)
  const onPhaseChangeRef = useRef(onPhaseChange)
  const onSegmentChangeRef = useRef(onSegmentChange)
  const onCompleteRef = useRef(onComplete)
  const onCycleRestartedRef = useRef(onCycleRestarted)
  const timelineRef = useRef(resolved.timeline)
  const totalCyclesRef = useRef(resolved.totalCycles)
  const cueLeadRef = useRef(cueLeadMs)
  const renderPolicyRef = useRef(renderPolicy)
  const visibilityModeRef = useRef(visibilityMode)
  const pendingTimelineRef = useRef<Timeline | null>(null)
  const [patternChangePending, setPatternChangePending] = useState(false)

  onPhaseChangeRef.current = onPhaseChange
  onSegmentChangeRef.current = onSegmentChange
  onCompleteRef.current = onComplete
  onCycleRestartedRef.current = onCycleRestarted
  totalCyclesRef.current = resolved.totalCycles
  cueLeadRef.current = cueLeadMs
  renderPolicyRef.current = renderPolicy
  visibilityModeRef.current = visibilityMode

  const pattern = options.pattern
  const timeline = options.timeline

  // Sync timeline from props only while idle — mid-session uses requestPatternChange
  useEffect(() => {
    if (statusRef.current === "idle" || statusRef.current === "complete") {
      if (pattern) {
        timelineRef.current = patternToTimeline(pattern)
      } else if (timeline) {
        timelineRef.current = timeline
      }
      pendingTimelineRef.current = null
      setPatternChangePending(false)
    }
  }, [pattern, timeline])

  const getElapsed = useCallback((now: number) => {
    if (statusRef.current === "idle") return 0
    const pauseExtra =
      pauseStartedRef.current !== null ? now - pauseStartedRef.current : 0
    return Math.max(
      0,
      now - startedAtRef.current - pauseAccumulatedRef.current - pauseExtra
    )
  }, [])

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const firePhase = useCallback(
    (cycle: number, phaseIndex: number, spec: PhaseSpec) => {
      const key = emitKeyFor(cycle, phaseIndex)
      if (lastEmittedKeyRef.current === key) return
      lastEmittedKeyRef.current = key
      const detail: PhaseChangeEvent = {
        index: phaseIndex,
        spec,
        cycle,
      }
      onPhaseChangeRef.current?.(spec.id, cycle, detail)
      onSegmentChangeRef.current?.(spec.id, cycle, detail)
    },
    []
  )

  const emitCatchUp = useCallback(
    (prevElapsed: number, nextElapsed: number, status: EngineStatus) => {
      if (status !== "running" && status !== "paused") return
      const boundaries = buildSegmentBoundaries(
        timelineRef.current,
        totalCyclesRef.current,
        { fromMs: prevElapsed, toMs: nextElapsed }
      )
      for (const b of boundaries) {
        if (b.elapsed > prevElapsed && b.elapsed <= nextElapsed) {
          firePhase(b.cycle, b.phaseIndex, b.spec)
        }
      }
    },
    [firePhase]
  )

  const emitCueLead = useCallback(
    (elapsedMs: number, status: EngineStatus) => {
      const lead = cueLeadRef.current
      if (lead <= 0 || (status !== "running" && status !== "paused")) return
      const boundaries = buildSegmentBoundaries(
        timelineRef.current,
        totalCyclesRef.current,
        { fromMs: Math.max(0, elapsedMs - lead - 50), toMs: elapsedMs + lead + 50 }
      )
      for (const b of boundaries) {
        if (b.elapsed === 0) continue
        const cueAt = b.elapsed - lead
        if (elapsedMs >= cueAt && elapsedMs < b.elapsed) {
          firePhase(b.cycle, b.phaseIndex, b.spec)
          break
        }
      }
    },
    [firePhase]
  )

  const applyDerived = useCallback(
    (elapsedMs: number, status: EngineStatus, awaitingResume: boolean) => {
      // Apply queued pattern at cycle boundary (start of a new cycle)
      if (pendingTimelineRef.current) {
        const before = deriveFromTimeline(
          elapsedMs,
          timelineRef.current,
          totalCyclesRef.current
        )
        const oldCycleMs = cycleMsOf(timelineRef.current)
        const withinCycle = elapsedMs % oldCycleMs
        const atBoundary =
          before.phaseIndex === 0 &&
          before.phaseProgress < 0.02 &&
          before.cyclesCompleted > 0
        const justFinishedCycle =
          withinCycle < 16 && before.cyclesCompleted > 0 && !before.complete

        if (atBoundary || justFinishedCycle) {
          const completed = before.cyclesCompleted
          const next = pendingTimelineRef.current
          pendingTimelineRef.current = null
          setPatternChangePending(false)
          timelineRef.current = next
          const newCycleMs = cycleMsOf(next)
          const targetElapsed = completed * newCycleMs
          const now = performance.now()
          const pauseExtra =
            pauseStartedRef.current !== null
              ? now - pauseStartedRef.current
              : 0
          startedAtRef.current =
            now - pauseAccumulatedRef.current - pauseExtra - targetElapsed
          elapsedMs = targetElapsed
        }
      }

      const prevElapsed = lastElapsedRef.current
      emitCatchUp(prevElapsed, elapsedMs, status)
      emitCueLead(elapsedMs, status)
      lastElapsedRef.current = elapsedMs

      const derived = deriveFromTimeline(
        elapsedMs,
        timelineRef.current,
        totalCyclesRef.current
      )

      cycleProgressMv.set(derived.cycleProgress)
      phaseProgressMv.set(derived.phaseProgress)

      if (derived.complete && !completedFiredRef.current) {
        completedFiredRef.current = true
        statusRef.current = "complete"
        stopLoop()
        setSnap({
          status: "complete",
          phase: derived.phase,
          phaseIndex: derived.phaseIndex,
          phaseSpec: derived.phaseSpec,
          cycle: derived.cycle,
          phaseProgress: 1,
          phaseRemaining: 0,
          cycleProgress: 1,
          elapsedMs,
          awaitingResume: false,
          cyclesCompleted: derived.cyclesCompleted,
        })
        onCompleteRef.current?.()
        return
      }

      const displaySec = derived.phaseRemaining
      const policy = renderPolicyRef.current
      const shouldUpdateReact =
        lastStatusRef.current !== status ||
        lastPhaseIndexRef.current !== derived.phaseIndex ||
        lastCycleRef.current !== derived.cycle ||
        lastAwaitingRef.current !== awaitingResume ||
        (policy === "countdown" && lastDisplaySecRef.current !== displaySec)

      if (shouldUpdateReact) {
        lastDisplaySecRef.current = displaySec
        lastStatusRef.current = status
        lastPhaseIndexRef.current = derived.phaseIndex
        lastCycleRef.current = derived.cycle
        lastAwaitingRef.current = awaitingResume
        setSnap({
          status,
          phase: derived.phase,
          phaseIndex: derived.phaseIndex,
          phaseSpec: derived.phaseSpec,
          cycle: derived.cycle,
          phaseProgress: derived.phaseProgress,
          phaseRemaining: derived.phaseRemaining,
          cycleProgress: derived.cycleProgress,
          elapsedMs,
          awaitingResume,
          cyclesCompleted: derived.cyclesCompleted,
        })
      }
    },
    [
      cycleProgressMv,
      emitCatchUp,
      emitCueLead,
      phaseProgressMv,
      stopLoop,
    ]
  )

  const applyDerivedRef = useRef(applyDerived)
  applyDerivedRef.current = applyDerived

  const getElapsedRef = useRef(getElapsed)
  getElapsedRef.current = getElapsed

  const tickRef = useRef<() => void>(() => undefined)
  tickRef.current = () => {
    if (statusRef.current !== "running") return
    const now = performance.now()
    const elapsed = getElapsedRef.current(now)
    applyDerivedRef.current(elapsed, "running", false)
    if (statusRef.current === "running") {
      rafRef.current = requestAnimationFrame(() => tickRef.current())
    }
  }

  const startLoop = useCallback(() => {
    stopLoop()
    rafRef.current = requestAnimationFrame(() => tickRef.current())
  }, [stopLoop])

  const beginRunning = useCallback(() => {
    completedFiredRef.current = false
    lastEmittedKeyRef.current = null
    lastDisplaySecRef.current = null
    lastPhaseIndexRef.current = null
    lastElapsedRef.current = -1
    autoPausedRef.current = false
    hiddenRestartRef.current = false
    pauseAccumulatedRef.current = 0
    pauseStartedRef.current = null
    pendingTimelineRef.current = null
    setPatternChangePending(false)
    startedAtRef.current = performance.now()
    statusRef.current = "running"
    const first = deriveFromTimeline(
      0,
      timelineRef.current,
      totalCyclesRef.current
    )
    firePhase(first.cycle, first.phaseIndex, first.phaseSpec)
    lastElapsedRef.current = 0
    setSnap({
      status: "running",
      phase: first.phase,
      phaseIndex: first.phaseIndex,
      phaseSpec: first.phaseSpec,
      cycle: first.cycle,
      phaseProgress: 0,
      phaseRemaining: first.phaseRemaining,
      cycleProgress: 0,
      elapsedMs: 0,
      awaitingResume: false,
      cyclesCompleted: 0,
    })
    cycleProgressMv.set(0)
    phaseProgressMv.set(0)
    startLoop()
  }, [cycleProgressMv, firePhase, phaseProgressMv, startLoop])

  const requestPatternChange = useCallback((next: BreathingPattern) => {
    const nextTimeline = patternToTimeline(next)
    if (
      statusRef.current === "idle" ||
      statusRef.current === "complete"
    ) {
      timelineRef.current = nextTimeline
      pendingTimelineRef.current = null
      setPatternChangePending(false)
      setSnap(initialSnap(nextTimeline))
      return
    }
    pendingTimelineRef.current = nextTimeline
    setPatternChangePending(true)
  }, [])

  const start = useCallback(() => {
    if (statusRef.current === "running") return
    beginRunning()
  }, [beginRunning])

  const pause = useCallback(() => {
    if (statusRef.current !== "running") return
    pauseStartedRef.current = performance.now()
    statusRef.current = "paused"
    stopLoop()
    const elapsed = getElapsed(performance.now())
    const derived = deriveFromTimeline(
      elapsed,
      timelineRef.current,
      totalCyclesRef.current
    )
    setSnap({
      status: "paused",
      phase: derived.phase,
      phaseIndex: derived.phaseIndex,
      phaseSpec: derived.phaseSpec,
      cycle: derived.cycle,
      phaseProgress: derived.phaseProgress,
      phaseRemaining: derived.phaseRemaining,
      cycleProgress: derived.cycleProgress,
      elapsedMs: elapsed,
      awaitingResume: autoPausedRef.current,
      cyclesCompleted: derived.cyclesCompleted,
    })
  }, [getElapsed, stopLoop])

  const rewindToCycleStart = useCallback(() => {
    const elapsed = getElapsed(performance.now())
    const derived = deriveFromTimeline(
      elapsed,
      timelineRef.current,
      totalCyclesRef.current
    )
    const cycleMs = cycleMsOf(timelineRef.current)
    const completed = Math.max(0, derived.cycle - 1)
    const targetElapsed = completed * cycleMs
    const now = performance.now()
    pauseAccumulatedRef.current = 0
    pauseStartedRef.current = null
    startedAtRef.current = now - targetElapsed
    lastElapsedRef.current = targetElapsed - 1
    lastEmittedKeyRef.current = null
    statusRef.current = "running"
    autoPausedRef.current = false
    hiddenRestartRef.current = false
    const next = deriveFromTimeline(
      targetElapsed,
      timelineRef.current,
      totalCyclesRef.current
    )
    firePhase(next.cycle, next.phaseIndex, next.phaseSpec)
    lastElapsedRef.current = targetElapsed
    setSnap({
      status: "running",
      phase: next.phase,
      phaseIndex: next.phaseIndex,
      phaseSpec: next.phaseSpec,
      cycle: next.cycle,
      phaseProgress: 0,
      phaseRemaining: next.phaseRemaining,
      cycleProgress: 0,
      elapsedMs: targetElapsed,
      awaitingResume: false,
      cyclesCompleted: next.cyclesCompleted,
    })
    cycleProgressMv.set(0)
    phaseProgressMv.set(0)
    onCycleRestartedRef.current?.()
    startLoop()
  }, [cycleProgressMv, firePhase, getElapsed, phaseProgressMv, startLoop])

  const resume = useCallback(() => {
    if (statusRef.current !== "paused") return
    if (hiddenRestartRef.current && visibilityModeRef.current === "restart-cycle") {
      rewindToCycleStart()
      return
    }
    if (pauseStartedRef.current !== null) {
      pauseAccumulatedRef.current +=
        performance.now() - pauseStartedRef.current
      pauseStartedRef.current = null
    }
    autoPausedRef.current = false
    statusRef.current = "running"
    setSnap((s) => ({ ...s, status: "running", awaitingResume: false }))
    startLoop()
  }, [rewindToCycleStart, startLoop])

  const restart = useCallback(() => {
    stopLoop()
    beginRunning()
  }, [beginRunning, stopLoop])

  const end = useCallback(() => {
    stopLoop()
    const elapsed = getElapsed(performance.now())
    const derived = deriveFromTimeline(
      elapsed,
      timelineRef.current,
      totalCyclesRef.current
    )
    const cyclesCompleted = derived.complete
      ? totalCyclesRef.current
      : derived.cyclesCompleted
    statusRef.current = "complete"
    completedFiredRef.current = true
    lastStatusRef.current = "complete"
    setSnap({
      status: "complete",
      phase: derived.phase,
      phaseIndex: derived.phaseIndex,
      phaseSpec: derived.phaseSpec,
      cycle: Math.max(1, derived.cycle),
      phaseProgress: derived.phaseProgress,
      phaseRemaining: 0,
      cycleProgress: derived.cycleProgress,
      elapsedMs: elapsed,
      awaitingResume: false,
      cyclesCompleted,
    })
    return { cyclesCompleted, elapsedMs: elapsed }
  }, [getElapsed, stopLoop])

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        if (statusRef.current === "running") {
          if (visibilityModeRef.current === "restart-cycle") {
            hiddenRestartRef.current = true
            autoPausedRef.current = true
            pause()
          } else {
            autoPausedRef.current = true
            pause()
          }
        }
      } else if (
        document.visibilityState === "visible" &&
        hiddenRestartRef.current &&
        visibilityModeRef.current === "restart-cycle" &&
        statusRef.current === "paused"
      ) {
        rewindToCycleStart()
      }
    }
    document.addEventListener("visibilitychange", onVisibility)
    return () => document.removeEventListener("visibilitychange", onVisibility)
  }, [pause, rewindToCycleStart])

  useEffect(() => {
    return () => {
      stopLoop()
    }
  }, [stopLoop])

  const segment =
    timelineRef.current.segments[snap.phaseIndex] ??
    timelineRef.current.segments[0]

  return {
    status: snap.status,
    phase: snap.phase,
    phaseIndex: snap.phaseIndex,
    phaseSpec: snap.phaseSpec,
    segmentIndex: snap.phaseIndex,
    segmentProgress: snap.phaseProgress,
    segmentProgressMv: phaseProgressMv,
    segment,
    cycle: snap.cycle,
    phaseProgress: snap.phaseProgress,
    phaseRemaining: snap.phaseRemaining,
    cycleProgress: snap.cycleProgress,
    elapsedMs: snap.elapsedMs,
    cycleProgressMv,
    phaseProgressMv,
    awaitingResume: snap.awaitingResume,
    cyclesCompleted: snap.cyclesCompleted,
    patternChangePending,
    start,
    pause,
    resume,
    restart,
    end,
    requestPatternChange,
  }
}

/**
 * Thin wrapper preserving the exact BreathingEngineOptions / BreathingEngineState API.
 */
export function useBreathingEngine(
  options: BreathingEngineOptions
): BreathingEngineState {
  return usePacedTimeline(options)
}

/** Pure helper exported for unit tests without React */
export function __testDeriveFromElapsed(
  elapsedMs: number,
  pattern: BreathingPattern,
  totalCycles: number
) {
  return deriveFromElapsed(elapsedMs, pattern, totalCycles)
}

/** Pure helper for timeline-based unit tests without React */
export function __testDeriveFromTimeline(
  elapsedMs: number,
  timeline: Timeline,
  totalCycles: number
) {
  return deriveFromTimeline(elapsedMs, timeline, totalCycles)
}
