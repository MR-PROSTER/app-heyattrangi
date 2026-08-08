"use client"

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { render, screen, cleanup, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { BellyBreathingSession } from "../components/BellyBreathingSession"
import { getActivityBySlug } from "../data/activities"
import { useSessionStore } from "../store/useSessionStore"
import { BELLY_COACH_LINES } from "../components/BellyTeachingStep"

const push = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn(), back: vi.fn() }),
}))

let mockCycle = 1
let mockStatus: "idle" | "running" | "paused" | "complete" = "idle"
let mockPatternChangePending = false
const requestPatternChange = vi.fn()

vi.mock("../hooks/usePacedTimeline", () => ({
  useBreathingEngine: (opts: {
    onComplete?: () => void
    onPhaseChange?: (
      phase: string,
      cycle: number,
      detail?: {
        index: number
        spec: { kind: string; label: string; seconds: number }
        cycle: number
      }
    ) => void
    totalCycles: number
    pattern: { cycleSeconds: number; phases: { seconds: number }[] }
  }) => {
    const [status, setStatus] = React.useState(mockStatus)
    const [cycle, setCycle] = React.useState(mockCycle)
    const mv = {
      get: () => 0,
      set: vi.fn(),
      on: () => () => undefined,
    }

    React.useEffect(() => {
      ;(
        globalThis as unknown as {
          __bellyComplete?: () => void
          __bellySetCycle?: (n: number) => void
        }
      ).__bellyComplete = () => {
        setStatus("complete")
        opts.onComplete?.()
      }
      ;(
        globalThis as unknown as { __bellySetCycle?: (n: number) => void }
      ).__bellySetCycle = (n: number) => {
        mockCycle = n
        setCycle(n)
      }
      // Match Box/478 mocks — bind once per onComplete identity
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opts.onComplete])

    return {
      status,
      phase: "inhale",
      phaseIndex: 0,
      phaseSpec: {
        id: "inhale",
        kind: "inhale" as const,
        seconds: opts.pattern.phases[0]?.seconds ?? 4,
        label: "Breathe in — let your belly rise",
      },
      cycle,
      phaseProgress: 0,
      phaseRemaining: opts.pattern.phases[0]?.seconds ?? 4,
      cycleProgress: 0,
      elapsedMs: 0,
      cycleProgressMv: mv,
      phaseProgressMv: mv,
      awaitingResume: false,
      cyclesCompleted: 0,
      patternChangePending: mockPatternChangePending,
      requestPatternChange,
      start: () => {
        setStatus("running")
        opts.onPhaseChange?.("inhale", 1, {
          index: 0,
          cycle: 1,
          spec: {
            kind: "inhale",
            label: "Breathe in — let your belly rise",
            seconds: opts.pattern.phases[0]?.seconds ?? 4,
          },
        })
      },
      pause: () => setStatus("paused"),
      resume: () => setStatus("running"),
      restart: () => setStatus("running"),
      end: () => {
        setStatus("complete")
        return { cyclesCompleted: 3, elapsedMs: 30_000 }
      },
    }
  },
}))

vi.mock("framer-motion", async () => {
  const ReactMod = await import("react")
  const passthrough = ({
    children,
    ...rest
  }: React.PropsWithChildren<Record<string, unknown>>) => {
    const clean = { ...rest }
    delete clean.initial
    delete clean.animate
    delete clean.exit
    delete clean.transition
    delete clean.onAnimationComplete
    delete clean.style
    return ReactMod.createElement("div", clean, children)
  }
  const svgPassthrough = ({
    children,
    ...rest
  }: React.PropsWithChildren<Record<string, unknown>>) => {
    const clean = { ...rest }
    delete clean.initial
    delete clean.animate
    delete clean.exit
    delete clean.transition
    delete clean.style
    return ReactMod.createElement("g", clean, children)
  }
  return {
    motion: {
      div: passthrough,
      span: passthrough,
      p: passthrough,
      g: svgPassthrough,
      rect: "rect",
      text: "text",
      path: "path",
      circle: "circle",
    },
    AnimatePresence: ({ children }: React.PropsWithChildren) => children,
    useMotionValue: (v: number) => ({
      get: () => v,
      set: vi.fn(),
      on: () => () => undefined,
    }),
    useTransform: () => 1,
    useMotionValueEvent: () => undefined,
  }
})

const activity = getActivityBySlug("belly-breathing")!

describe("BellyBreathingSession", () => {
  beforeEach(() => {
    cleanup()
    push.mockClear()
    mockCycle = 1
    mockStatus = "idle"
    mockPatternChangePending = false
    requestPatternChange.mockClear()
    useSessionStore.setState({
      history: [],
      prefs: {
        sound: false,
        haptics: false,
        defaultCycles: 8,
        exhaleGuide: false,
        bellyPace: "standard",
        bellyTeachingSeen: false,
        bellyGuideTone: false,
      },
      _hasHydrated: true,
    })
    vi.spyOn(useSessionStore.persist, "rehydrate").mockResolvedValue(
      undefined as never
    )
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it("no belly history → teaching step renders with all 3 steps, Begin after it", async () => {
    const user = userEvent.setup()
    render(<BellyBreathingSession activity={activity} />)

    expect(
      screen.getByRole("heading", { name: "Get comfortable" })
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Next" }))
    expect(
      screen.getByRole("heading", {
        name: "One hand on your chest, one on your belly",
      })
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Next" }))
    expect(
      screen.getByRole("heading", {
        name: "Breathe so only the bottom hand moves",
      })
    ).toBeInTheDocument()

    const begin = screen.getByRole("button", { name: "Begin" })
    const teach = screen.getByRole("heading", {
      name: "Breathe so only the bottom hand moves",
    })
    expect(
      begin.compareDocumentPosition(teach) &
        Node.DOCUMENT_POSITION_PRECEDING
    ).toBeTruthy()
  })

  it("completed belly record → collapsed one-liner, show me again re-expands", async () => {
    const user = userEvent.setup()
    useSessionStore.setState({
      history: [
        {
          id: "1",
          activitySlug: "belly",
          startedAt: new Date().toISOString(),
          durationMs: 180_000,
          cyclesCompleted: 18,
          cyclesPlanned: 18,
          completed: true,
        },
      ],
      prefs: {
        sound: false,
        haptics: false,
        defaultCycles: 8,
        exhaleGuide: false,
        bellyPace: "standard",
        bellyTeachingSeen: true,
        bellyGuideTone: false,
      },
      _hasHydrated: true,
    })

    render(<BellyBreathingSession activity={activity} />)
    expect(
      screen.getByText(/Hand on belly, hand on chest — you know the drill/i)
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("heading", { name: "Get comfortable" })
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Show me again" }))
    expect(
      screen.getByRole("heading", { name: "Get comfortable" })
    ).toBeInTheDocument()
  })

  it("Standard pace preselected; Gentle recomputes cycles so 3 min ≈ 26 cycles", async () => {
    const user = userEvent.setup()
    render(<BellyBreathingSession activity={activity} />)

    const standard = screen.getByRole("radio", { name: /Standard/i })
    expect(standard).toHaveAttribute("aria-checked", "true")

    await user.click(screen.getByRole("radio", { name: /Gentle/i }))
    expect(screen.getByText(/3 min · 26 breaths/i)).toBeInTheDocument()
  })

  it("sessionCoach rotates in fixed order every 4 cycles, absent with ≥5 sessions", async () => {
    const user = userEvent.setup()
    render(<BellyBreathingSession activity={activity} />)

    // Finish teaching quickly so Begin is reachable
    await user.click(screen.getByRole("button", { name: "Next" }))
    await user.click(screen.getByRole("button", { name: "Next" }))
    await user.click(screen.getByRole("button", { name: "Ready" }))
    await user.click(screen.getByRole("button", { name: "Begin" }))
    // Skip countdown
    await user.click(screen.getByLabelText("Skip countdown"))

    expect(screen.getByTestId("session-coach")).toHaveTextContent(
      BELLY_COACH_LINES[0]
    )

    actSetCycle(5)
    expect(screen.getByTestId("session-coach")).toHaveTextContent(
      BELLY_COACH_LINES[1]
    )

    cleanup()
    useSessionStore.setState({
      history: Array.from({ length: 5 }, (_, i) => ({
        id: String(i),
        activitySlug: "belly",
        startedAt: new Date().toISOString(),
        durationMs: 180_000,
        cyclesCompleted: 18,
        cyclesPlanned: 18,
        completed: true,
      })),
      prefs: {
        sound: false,
        haptics: false,
        defaultCycles: 8,
        exhaleGuide: false,
        bellyPace: "standard",
        bellyTeachingSeen: true,
        bellyGuideTone: false,
      },
      _hasHydrated: true,
    })

    render(<BellyBreathingSession activity={activity} />)
    await user.click(screen.getByRole("button", { name: "Begin" }))
    await user.click(screen.getByLabelText("Skip countdown"))
    expect(screen.queryByTestId("session-coach")).not.toBeInTheDocument()
  })

  it("hand labels still/rises fade after cycle 3, persist under reduced motion", async () => {
    const user = userEvent.setup()
    render(<BellyBreathingSession activity={activity} />)
    await user.click(screen.getByRole("button", { name: "Next" }))
    await user.click(screen.getByRole("button", { name: "Next" }))
    await user.click(screen.getByRole("button", { name: "Ready" }))
    await user.click(screen.getByRole("button", { name: "Begin" }))
    await user.click(screen.getByLabelText("Skip countdown"))

    expect(screen.getByTestId("hand-label-still")).toBeInTheDocument()
    expect(screen.getByTestId("hand-label-rises")).toBeInTheDocument()

    actSetCycle(4)
    expect(screen.queryByTestId("hand-label-still")).not.toBeInTheDocument()

    cleanup()
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: query.includes("prefers-reduced-motion: reduce"),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    })

    render(<BellyBreathingSession activity={activity} />)
    await user.click(screen.getByRole("button", { name: "Next" }))
    await user.click(screen.getByRole("button", { name: "Next" }))
    await user.click(screen.getByRole("button", { name: "Ready" }))
    await user.click(screen.getByRole("button", { name: "Begin" }))
    await user.click(screen.getByLabelText("Skip countdown"))
    actSetCycle(10)
    expect(screen.getByTestId("hand-label-still")).toBeInTheDocument()
    expect(screen.getByTestId("hand-label-rises")).toBeInTheDocument()
  })

  it("reduced motion → proportion bar renders", async () => {
    const user = userEvent.setup()
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: query.includes("prefers-reduced-motion: reduce"),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    })

    render(<BellyBreathingSession activity={activity} />)
    await user.click(screen.getByRole("button", { name: "Next" }))
    await user.click(screen.getByRole("button", { name: "Next" }))
    expect(screen.getByTestId("teach-proportion-bar")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Ready" }))
    await user.click(screen.getByRole("button", { name: "Begin" }))
    await user.click(screen.getByLabelText("Skip countdown"))
    expect(screen.getByTestId("belly-proportion-bar")).toBeInTheDocument()
  })
})

function actSetCycle(n: number) {
  act(() => {
    const setter = (
      globalThis as unknown as { __bellySetCycle?: (n: number) => void }
    ).__bellySetCycle
    setter?.(n)
  })
}
