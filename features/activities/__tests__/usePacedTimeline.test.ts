import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import {
  usePacedTimeline,
  __testDeriveFromTimeline,
} from "../hooks/usePacedTimeline"
import { buildBodyScanTimeline } from "../data/bodyScan"
import type { Timeline } from "../types"

function makeTimeline(secondsEach: number, count = 12): Timeline {
  return {
    id: "test-scan",
    loops: false,
    segments: Array.from({ length: count }, (_, i) => ({
      id: `r${i}`,
      seconds: secondsEach,
      label: `Region ${i + 1}`,
    })),
  }
}

describe("usePacedTimeline — loops:false", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it("loops:false with 12 × 25s completes in exactly 300000ms (±16ms) once", () => {
    const onComplete = vi.fn()
    const timeline = makeTimeline(25, 12)
    const { result } = renderHook(() =>
      usePacedTimeline({ timeline, onComplete, renderPolicy: "phase" })
    )

    let now = 0
    vi.spyOn(performance, "now").mockImplementation(() => now)
    let rafCb: FrameRequestCallback | null = null
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCb = cb
      return 1
    })

    act(() => {
      result.current.start()
    })

    act(() => {
      now = 300000
      rafCb?.(now)
    })

    expect(result.current.status).toBe("complete")
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(result.current.elapsedMs).toBeGreaterThanOrEqual(300000 - 16)
  })

  it("segment transitions fire exactly 12 times, in order, once each", () => {
    const ids: string[] = []
    const timeline = makeTimeline(25, 12)
    const { result } = renderHook(() =>
      usePacedTimeline({
        timeline,
        renderPolicy: "phase",
        onSegmentChange: (id) => ids.push(id),
      })
    )

    let now = 0
    vi.spyOn(performance, "now").mockImplementation(() => now)
    let rafCb: FrameRequestCallback | null = null
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCb = cb
      return 1
    })

    act(() => {
      result.current.start()
    })
    expect(ids).toEqual(["r0"])

    for (let i = 1; i < 12; i++) {
      act(() => {
        now = i * 25000 + 10
        rafCb?.(now)
      })
    }
    expect(ids).toEqual([
      "r0",
      "r1",
      "r2",
      "r3",
      "r4",
      "r5",
      "r6",
      "r7",
      "r8",
      "r9",
      "r10",
      "r11",
    ])
  })

  it("skipping 3 regions redistributes to 9 × ~33.3s, total still 300000ms (±1000ms)", () => {
    const tl = buildBodyScanTimeline(300, ["chest", "belly", "hips-seat"])
    expect(tl.segments).toHaveLength(9)
    const sum = tl.segments.reduce((a, s) => a + s.seconds, 0)
    expect(sum).toBeCloseTo(300, 5)
    tl.segments.forEach((s) => {
      expect(s.seconds).toBeCloseTo(300 / 9, 5)
    })

    const derived = __testDeriveFromTimeline(300000, tl, 1)
    expect(derived.complete).toBe(true)
    const mid = __testDeriveFromTimeline(150000, tl, 1)
    expect(mid.complete).toBe(false)
  })

  it("pause at t=140000 mid-region 6, resume at t=200000 → same segment, exact remaining", () => {
    const timeline = makeTimeline(25, 12)
    const { result } = renderHook(() =>
      usePacedTimeline({ timeline, renderPolicy: "phase" })
    )

    let now = 0
    vi.spyOn(performance, "now").mockImplementation(() => now)
    let rafCb: FrameRequestCallback | null = null
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCb = cb
      return 1
    })

    act(() => {
      result.current.start()
    })

    // Region 6 is index 5: starts at 125000, mid at 140000 → 10000 into 25000
    act(() => {
      now = 140000
      rafCb?.(now)
    })
    expect(result.current.segmentIndex).toBe(5)
    const progressAtPause = result.current.segmentProgress
    expect(progressAtPause).toBeCloseTo(15000 / 25000, 3)

    act(() => {
      result.current.pause()
    })
    const remBefore = 25000 - 15000

    act(() => {
      now = 200000
    })

    act(() => {
      result.current.resume()
    })

    act(() => {
      now = 200001
      rafCb?.(now)
    })

    expect(result.current.segmentIndex).toBe(5)
    expect(result.current.segmentProgress).toBeCloseTo(progressAtPause, 2)
    const remMs = (1 - result.current.segmentProgress) * 25000
    expect(remMs).toBeCloseTo(remBefore, -1)
  })

  it("long segments: segmentProgress accurate to ±0.001 at t=12500 into a 25s segment", () => {
    const timeline = makeTimeline(25, 12)
    const d = __testDeriveFromTimeline(12500, timeline, 1)
    expect(d.phaseIndex).toBe(0)
    expect(d.phaseProgress).toBeCloseTo(0.5, 3)
  })
})
