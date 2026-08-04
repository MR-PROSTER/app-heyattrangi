import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useBreathingEngine } from "../hooks/usePacedTimeline"
import { BOX_PATTERN, PHASES } from "../types"
import {
  PATTERN_478,
  PATTERN_BELLY,
  PATTERN_SIGH,
  patternFromBellyPace,
} from "../data/patterns"

describe("useBreathingEngine", () => {
  let now = 0
  let rafCbs: FrameRequestCallback[] = []
  let rafId = 1

  beforeEach(() => {
    now = 0
    rafCbs = []
    rafId = 1
    vi.stubGlobal("performance", {
      now: () => now,
    })
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      rafCbs.push(cb)
      return rafId++
    })
    vi.stubGlobal("cancelAnimationFrame", (id: number) => {
      void id
      rafCbs = []
    })
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "visible",
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function flushFrames(targetMs: number) {
    let guard = 0
    while (now < targetMs && guard < 50_000) {
      guard += 1
      const remaining = targetMs - now
      const step = remaining > 200 ? 250 : 16
      now = Math.min(targetMs, now + step)
      const cbs = [...rafCbs]
      rafCbs = []
      for (const cb of cbs) cb(now)
      if (cbs.length === 0) break
    }
  }

  it("completes exactly 8 cycles in 128000ms (±16ms)", () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() =>
      useBreathingEngine({
        pattern: BOX_PATTERN,
        totalCycles: 8,
        onComplete,
      })
    )

    act(() => {
      result.current.start()
    })

    act(() => {
      flushFrames(128_000)
    })

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(result.current.status).toBe("complete")
    expect(result.current.cyclesCompleted).toBe(8)
    expect(result.current.elapsedMs).toBeGreaterThanOrEqual(128_000 - 16)
    expect(result.current.elapsedMs).toBeLessThanOrEqual(128_000 + 16)
  })

  it("fires onPhaseChange exactly 32 times in order, never twice for one phase", () => {
    const phases: string[] = []
    const { result } = renderHook(() =>
      useBreathingEngine({
        pattern: BOX_PATTERN,
        totalCycles: 8,
        onPhaseChange: (phase, cycle) => {
          phases.push(`${cycle}:${phase}`)
        },
      })
    )

    act(() => {
      result.current.start()
    })

    act(() => {
      flushFrames(128_000)
    })

    expect(phases).toHaveLength(32)
    const expected: string[] = []
    for (let c = 1; c <= 8; c++) {
      for (const p of PHASES) expected.push(`${c}:${p}`)
    }
    expect(phases).toEqual(expected)
    expect(new Set(phases).size).toBe(32)
  })

  it("pause is lossless across a long gap", () => {
    const { result } = renderHook(() =>
      useBreathingEngine({
        pattern: BOX_PATTERN,
        totalCycles: 8,
      })
    )

    act(() => {
      result.current.start()
    })

    act(() => {
      flushFrames(5000)
    })

    const phaseBefore = result.current.phase
    const remainingBefore = result.current.phaseRemaining
    const progressBefore = result.current.phaseProgress

    act(() => {
      result.current.pause()
    })

    now = 20_000

    act(() => {
      result.current.resume()
    })

    act(() => {
      // one frame after resume
      flushFrames(20_016)
    })

    expect(result.current.phase).toBe(phaseBefore)
    expect(result.current.phaseRemaining).toBe(remainingBefore)
    expect(Math.abs(result.current.phaseProgress - progressBefore)).toBeLessThan(
      0.05
    )
  })

  it("end() mid-session reports correct partial cyclesCompleted", () => {
    const { result } = renderHook(() =>
      useBreathingEngine({
        pattern: BOX_PATTERN,
        totalCycles: 8,
      })
    )

    act(() => {
      result.current.start()
    })

    // 2.5 cycles = 40_000ms
    act(() => {
      flushFrames(40_000)
    })

    let ended: { cyclesCompleted: number; elapsedMs: number } = {
      cyclesCompleted: -1,
      elapsedMs: 0,
    }
    act(() => {
      ended = result.current.end()
    })

    expect(ended.cyclesCompleted).toBe(2)
    expect(ended.elapsedMs).toBeGreaterThanOrEqual(40_000 - 16)
    expect(result.current.status).toBe("complete")
  })

  it("cleanup cancels the rAF handle", () => {
    const cancelSpy = vi.fn()
    vi.stubGlobal("cancelAnimationFrame", cancelSpy)

    const { result, unmount } = renderHook(() =>
      useBreathingEngine({
        pattern: BOX_PATTERN,
        totalCycles: 8,
      })
    )

    act(() => {
      result.current.start()
    })

    unmount()
    expect(cancelSpy).toHaveBeenCalled()
  })
})

describe("useBreathingEngine — 4-7-8 / N-phase", () => {
  let now = 0
  let rafCbs: FrameRequestCallback[] = []
  let rafId = 1

  beforeEach(() => {
    now = 0
    rafCbs = []
    rafId = 1
    vi.stubGlobal("performance", { now: () => now })
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      rafCbs.push(cb)
      return rafId++
    })
    vi.stubGlobal("cancelAnimationFrame", () => {
      rafCbs = []
    })
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "visible",
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function flushFrames(targetMs: number) {
    let guard = 0
    while (now < targetMs && guard < 50_000) {
      guard += 1
      const remaining = targetMs - now
      const step = remaining > 200 ? 250 : 16
      now = Math.min(targetMs, now + step)
      const cbs = [...rafCbs]
      rafCbs = []
      for (const cb of cbs) cb(now)
      if (cbs.length === 0) break
    }
  }

  it("3-phase pattern completes 9 cycles in 171000ms (±16ms)", () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() =>
      useBreathingEngine({
        pattern: PATTERN_478,
        totalCycles: 9,
        onComplete,
      })
    )
    act(() => {
      result.current.start()
    })
    act(() => {
      flushFrames(171_000)
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(result.current.status).toBe("complete")
    expect(result.current.elapsedMs).toBeGreaterThanOrEqual(171_000 - 16)
    expect(result.current.elapsedMs).toBeLessThanOrEqual(171_000 + 16)
  })

  it("onPhaseChange fires exactly 27 times in inhale → hold → exhale order", () => {
    const kinds: string[] = []
    const { result } = renderHook(() =>
      useBreathingEngine({
        pattern: PATTERN_478,
        totalCycles: 9,
        onPhaseChange: (_id, _c, detail) => {
          if (detail) kinds.push(detail.spec.kind)
        },
      })
    )
    act(() => {
      result.current.start()
    })
    act(() => {
      flushFrames(171_000)
    })
    expect(kinds).toHaveLength(27)
    for (let i = 0; i < 27; i += 3) {
      expect(kinds.slice(i, i + 3)).toEqual(["inhale", "hold", "exhale"])
    }
  })

  it("cycleProgress at t=4000ms equals 4/19 (±0.001)", () => {
    const { result } = renderHook(() =>
      useBreathingEngine({
        pattern: PATTERN_478,
        totalCycles: 9,
      })
    )
    act(() => {
      result.current.start()
    })
    act(() => {
      flushFrames(4000)
    })
    expect(result.current.cycleProgress).toBeCloseTo(4 / 19, 3)
  })

  it("pause mid-hold then resume restores phase index and remaining", () => {
    const { result } = renderHook(() =>
      useBreathingEngine({
        pattern: PATTERN_478,
        totalCycles: 9,
      })
    )
    act(() => {
      result.current.start()
    })
    act(() => {
      flushFrames(8000)
    })
    const indexBefore = result.current.phaseIndex
    const remainingBefore = result.current.phaseRemaining
    expect(indexBefore).toBe(1)
    act(() => {
      result.current.pause()
    })
    now = 30_000
    act(() => {
      result.current.resume()
    })
    act(() => {
      flushFrames(30_016)
    })
    expect(result.current.phaseIndex).toBe(indexBefore)
    expect(result.current.phaseRemaining).toBe(remainingBefore)
  })

  it("Box pattern emits distinct phaseIndex 1 and 3 for the two holds", () => {
    const indices: number[] = []
    const { result } = renderHook(() =>
      useBreathingEngine({
        pattern: BOX_PATTERN,
        totalCycles: 1,
        onPhaseChange: (_id, _c, detail) => {
          if (detail) indices.push(detail.index)
        },
      })
    )
    act(() => {
      result.current.start()
    })
    act(() => {
      flushFrames(16_000)
    })
    expect(indices).toEqual([0, 1, 2, 3])
    expect(indices).toContain(1)
    expect(indices).toContain(3)
  })
})

describe("useBreathingEngine — Physiological Sigh / sub-second", () => {
  let now = 0
  let rafCbs: FrameRequestCallback[] = []
  let rafId = 1

  beforeEach(() => {
    now = 0
    rafCbs = []
    rafId = 1
    vi.stubGlobal("performance", { now: () => now })
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      rafCbs.push(cb)
      return rafId++
    })
    vi.stubGlobal("cancelAnimationFrame", () => {
      rafCbs = []
    })
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "visible",
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function flushFrames(targetMs: number, stepMs = 16) {
    let guard = 0
    while (now < targetMs && guard < 50_000) {
      guard += 1
      now = Math.min(targetMs, now + stepMs)
      const cbs = [...rafCbs]
      rafCbs = []
      for (const cb of cbs) cb(now)
      if (cbs.length === 0) break
    }
  }

  it("3-phase asymmetric pattern completes 5 cycles in exactly 40000ms (±16ms)", () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() =>
      useBreathingEngine({
        pattern: PATTERN_SIGH,
        totalCycles: 5,
        onComplete,
      })
    )
    act(() => {
      result.current.start()
    })
    act(() => {
      flushFrames(40_000)
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(result.current.cyclesCompleted).toBe(5)
    expect(result.current.elapsedMs).toBeGreaterThanOrEqual(40_000 - 16)
    expect(result.current.elapsedMs).toBeLessThanOrEqual(40_000 + 16)
  })

  it("onPhaseChange fires 15 times; consecutive inhales emit phaseIndex 0 then 1", () => {
    const events: { id: string; index: number }[] = []
    const { result } = renderHook(() =>
      useBreathingEngine({
        pattern: PATTERN_SIGH,
        totalCycles: 5,
        onPhaseChange: (id, _c, detail) => {
          if (detail) events.push({ id, index: detail.index })
        },
      })
    )
    act(() => {
      result.current.start()
    })
    act(() => {
      flushFrames(40_000)
    })
    expect(events).toHaveLength(15)
    expect(events[0]).toEqual({ id: "inhale", index: 0 })
    expect(events[1]).toEqual({ id: "inhale-2", index: 1 })
    expect(events[2]).toEqual({ id: "exhale", index: 2 })
  })

  it("1200ms frame gap spanning top-up still emits all crossed phases in order", () => {
    const events: string[] = []
    const { result } = renderHook(() =>
      useBreathingEngine({
        pattern: PATTERN_SIGH,
        totalCycles: 5,
        onPhaseChange: (id) => {
          events.push(id)
        },
      })
    )
    act(() => {
      result.current.start()
    })
    // Advance to mid first inhale
    act(() => {
      flushFrames(1500)
    })
    expect(events).toEqual(["inhale"])
    // Jump 1200ms — crosses top-up start (2000) into top-up
    act(() => {
      flushFrames(2700, 1200)
    })
    expect(events).toContain("inhale-2")
    expect(events.indexOf("inhale-2")).toBeGreaterThan(events.indexOf("inhale"))
  })

  it("cueLeadMs: 60 fires the cue 60ms before the boundary, never twice", () => {
    const events: { id: string; at: number }[] = []
    const { result } = renderHook(() =>
      useBreathingEngine({
        pattern: PATTERN_SIGH,
        totalCycles: 2,
        cueLeadMs: 60,
        onPhaseChange: (id) => {
          events.push({ id, at: now })
        },
      })
    )
    act(() => {
      result.current.start()
    })
    act(() => {
      flushFrames(2500, 10)
    })
    const topUp = events.find((e) => e.id === "inhale-2")
    expect(topUp).toBeTruthy()
    expect(topUp!.at).toBeGreaterThanOrEqual(1940)
    expect(topUp!.at).toBeLessThan(2000)
    // One emit per cycle — never double within a cycle
    expect(events.filter((e) => e.id === "inhale-2")).toHaveLength(1)
  })

  it("renderPolicy phase: ≤3 React renders per cycle", () => {
    let renders = 0
    const { result } = renderHook(() => {
      renders += 1
      return useBreathingEngine({
        pattern: PATTERN_SIGH,
        totalCycles: 2,
        renderPolicy: "phase",
      })
    })
    const baseline = renders
    act(() => {
      result.current.start()
    })
    const afterStart = renders
    act(() => {
      flushFrames(8000)
    })
    // One cycle = 8s; start snap + ≤3 phase updates
    const delta = renders - afterStart
    expect(delta).toBeLessThanOrEqual(3)
    expect(renders - baseline).toBeLessThanOrEqual(5)
  })
})

describe("useBreathingEngine — Belly / 2-phase", () => {
  let now = 0
  let rafCbs: FrameRequestCallback[] = []
  let rafId = 1

  beforeEach(() => {
    now = 0
    rafCbs = []
    rafId = 1
    vi.stubGlobal("performance", { now: () => now })
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      rafCbs.push(cb)
      return rafId++
    })
    vi.stubGlobal("cancelAnimationFrame", () => {
      rafCbs = []
    })
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "visible",
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function flushFrames(targetMs: number) {
    let guard = 0
    while (now < targetMs && guard < 50_000) {
      guard += 1
      const remaining = targetMs - now
      const step = remaining > 200 ? 250 : 16
      now = Math.min(targetMs, now + step)
      const cbs = [...rafCbs]
      rafCbs = []
      for (const cb of cbs) cb(now)
      if (cbs.length === 0) break
    }
  }

  it("2-phase pattern completes 18 cycles in exactly 180000ms (±16ms)", () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() =>
      useBreathingEngine({
        pattern: PATTERN_BELLY,
        totalCycles: 18,
        onComplete,
      })
    )
    act(() => {
      result.current.start()
    })
    act(() => {
      flushFrames(180_000)
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(result.current.status).toBe("complete")
    expect(result.current.cyclesCompleted).toBe(18)
    expect(result.current.elapsedMs).toBeGreaterThanOrEqual(180_000 - 16)
    expect(result.current.elapsedMs).toBeLessThanOrEqual(180_000 + 16)
  })

  it("onPhaseChange fires exactly 36 times, strict inhale → exhale alternation", () => {
    const kinds: string[] = []
    const { result } = renderHook(() =>
      useBreathingEngine({
        pattern: PATTERN_BELLY,
        totalCycles: 18,
        onPhaseChange: (_id, _c, detail) => {
          if (detail) kinds.push(detail.spec.kind)
        },
      })
    )
    act(() => {
      result.current.start()
    })
    act(() => {
      flushFrames(180_000)
    })
    expect(kinds).toHaveLength(36)
    for (let i = 0; i < 36; i += 2) {
      expect(kinds.slice(i, i + 2)).toEqual(["inhale", "exhale"])
    }
  })

  it("cycleProgress at t=4000ms into a cycle equals 0.4 (±0.001)", () => {
    const { result } = renderHook(() =>
      useBreathingEngine({
        pattern: PATTERN_BELLY,
        totalCycles: 18,
      })
    )
    act(() => {
      result.current.start()
    })
    act(() => {
      flushFrames(4000)
    })
    expect(result.current.cycleProgress).toBeCloseTo(0.4, 3)
  })

  it("pause mid-inhale at t=2000 → phaseProgress 0.5 preserved across resume at t=25000", () => {
    const { result } = renderHook(() =>
      useBreathingEngine({
        pattern: PATTERN_BELLY,
        totalCycles: 18,
      })
    )
    act(() => {
      result.current.start()
    })
    act(() => {
      flushFrames(2000)
    })
    act(() => {
      result.current.pause()
    })
    expect(result.current.phaseSpec.kind).toBe("inhale")
    expect(result.current.phaseProgress).toBeCloseTo(0.5, 2)
    const progressBefore = result.current.phaseProgress
    now = 25_000
    act(() => {
      result.current.resume()
    })
    act(() => {
      flushFrames(25_016)
    })
    expect(result.current.phaseProgress).toBeCloseTo(progressBefore, 3)
  })

  it("switching pattern variant applies at the cycle boundary, never mid-phase", () => {
    const gentle = patternFromBellyPace("gentle")
    const { result } = renderHook(() =>
      useBreathingEngine({
        pattern: PATTERN_BELLY,
        totalCycles: 18,
      })
    )
    act(() => {
      result.current.start()
    })
    act(() => {
      flushFrames(2000)
    })
    expect(result.current.phaseSpec.seconds).toBe(4)
    act(() => {
      result.current.requestPatternChange(gentle)
    })
    expect(result.current.patternChangePending).toBe(true)
    act(() => {
      flushFrames(5000)
    })
    // Still mid first cycle (exhale of standard) — pattern not applied yet
    expect(result.current.phaseSpec.kind).toBe("exhale")
    expect(result.current.phaseSpec.seconds).toBe(6)
    act(() => {
      flushFrames(10_000)
    })
    // New cycle with gentle 3s inhale
    expect(result.current.patternChangePending).toBe(false)
    expect(result.current.phaseSpec.kind).toBe("inhale")
    expect(result.current.phaseSpec.seconds).toBe(3)
  })
})
