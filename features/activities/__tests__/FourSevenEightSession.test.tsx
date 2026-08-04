import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { FourSevenEightSession } from "../components/FourSevenEightSession"
import { getActivityBySlug } from "../data/activities"
import { useSessionStore } from "../store/useSessionStore"

const push = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn(), back: vi.fn() }),
}))

vi.mock("../hooks/usePacedTimeline", () => ({
  useBreathingEngine: (opts: {
    onComplete?: () => void
    onPhaseChange?: (
      phase: string,
      cycle: number,
      detail?: { index: number; spec: { kind: string; label: string; seconds: number }; cycle: number }
    ) => void
  }) => {
    const [status, setStatus] = React.useState<
      "idle" | "running" | "paused" | "complete"
    >("idle")
    const mv = { get: () => 0, set: vi.fn(), on: () => () => undefined }

    React.useEffect(() => {
      ;(
        globalThis as unknown as { __478Complete?: () => void }
      ).__478Complete = () => {
        setStatus("complete")
        opts.onComplete?.()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opts.onComplete])

    return {
      status,
      phase: "inhale",
      phaseIndex: 0,
      phaseSpec: {
        id: "inhale",
        kind: "inhale" as const,
        seconds: 4,
        label: "Inhale",
        hint: "through your nose",
      },
      cycle: 1,
      phaseProgress: 0,
      phaseRemaining: 4,
      cycleProgress: 0,
      elapsedMs: 0,
      cycleProgressMv: mv,
      phaseProgressMv: mv,
      awaitingResume: false,
      cyclesCompleted: 0,
      start: () => {
        setStatus("running")
        opts.onPhaseChange?.("inhale", 1, {
          index: 0,
          cycle: 1,
          spec: {
            kind: "inhale",
            label: "Inhale",
            seconds: 4,
          },
        })
      },
      pause: () => setStatus("paused"),
      resume: () => setStatus("running"),
      restart: () => setStatus("running"),
      end: () => {
        setStatus("complete")
        return { cyclesCompleted: 2, elapsedMs: 40_000 }
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
    return ReactMod.createElement("div", clean, children)
  }
  return {
    motion: {
      div: passthrough,
      span: passthrough,
      p: passthrough,
      path: "path",
      circle: "circle",
    },
    AnimatePresence: ({ children }: React.PropsWithChildren) => children,
    useMotionValue: (v: number) => ({
      get: () => v,
      set: vi.fn(),
      on: () => () => undefined,
    }),
    useMotionValueEvent: () => undefined,
  }
})

const activity = getActivityBySlug("breathing-4-7-8")!

describe("FourSevenEightSession", () => {
  beforeEach(() => {
    cleanup()
    push.mockClear()
    useSessionStore.setState({
      history: [],
      prefs: {
        sound: false,
        haptics: false,
        defaultCycles: 9,
        exhaleGuide: false,
      },
      _hasHydrated: true,
      hasCompletedActivity: (slug) =>
        useSessionStore
          .getState()
          .history.some((s) => s.completed && s.activitySlug === slug),
    })
    vi.spyOn(useSessionStore.persist, "rehydrate").mockResolvedValue(
      undefined as never
    )
    const now = 0
    vi.stubGlobal("performance", { now: () => now })
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      const id = setTimeout(() => cb(now), 16)
      return id as unknown as number
    })
    vi.stubGlobal("cancelAnimationFrame", (id: number) => {
      clearTimeout(id as unknown as ReturnType<typeof setTimeout>)
    })
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
    vi.unstubAllGlobals()
  })

  it("empty history → 4 cycles preselected + recommendation chip present", async () => {
    render(<FourSevenEightSession activity={activity} />)
    const first = screen.getByRole("radio", { name: /4 cycles/i })
    expect(first).toHaveAttribute("aria-checked", "true")
    expect(
      screen.getByText("Recommended for your first time")
    ).toBeInTheDocument()
  })

  it("history with completed 478 record → 9 cycles preselected, no chip", async () => {
    useSessionStore.setState({
      history: [
        {
          id: "1",
          activitySlug: "breathing-4-7-8",
          startedAt: new Date().toISOString(),
          durationMs: 60_000,
          cyclesCompleted: 4,
          cyclesPlanned: 4,
          completed: true,
        },
      ],
    })
    render(<FourSevenEightSession activity={activity} />)
    expect(
      screen.getByRole("radio", { name: /9 cycles/i })
    ).toHaveAttribute("aria-checked", "true")
    expect(
      screen.queryByText("Recommended for your first time")
    ).not.toBeInTheDocument()
  })

  it("safety notice renders before the Begin button in DOM order", () => {
    const { container } = render(
      <FourSevenEightSession activity={activity} />
    )
    const notice = screen.getByRole("region", { name: /before you start/i })
    const begin = screen.getByRole("button", { name: "Begin" })
    const position = notice.compareDocumentPosition(begin)
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(container.querySelector("#fse-before-title")).toBeTruthy()
  })

  it("Stop anytime saves a record with endedEarly: true, completed: true", async () => {
    const addSession = vi.fn()
    useSessionStore.setState({
      addSession: (r) => {
        addSession(r)
      },
    })
    const user = userEvent.setup()
    render(<FourSevenEightSession activity={activity} />)
    await user.click(screen.getByRole("button", { name: "Begin" }))
    await user.click(screen.getByLabelText("Skip countdown"))
    await screen.findByLabelText("End session early")
    await user.click(screen.getByLabelText("End session early"))
    expect(
      await screen.findByRole("button", { name: "Done" })
    ).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Done" }))
    expect(addSession).toHaveBeenCalledTimes(1)
    expect(addSession.mock.calls[0][0]).toMatchObject({
      endedEarly: true,
      completed: true,
    })
  })

  it("prefers-reduced-motion: reduce → no wisp elements, arc duration labels still render", async () => {
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
    const user = userEvent.setup()
    render(<FourSevenEightSession activity={activity} />)
    await user.click(screen.getByRole("button", { name: "Begin" }))
    await user.click(screen.getByLabelText("Skip countdown"))
    await screen.findByLabelText("Pause session")
    expect(screen.queryAllByTestId("exhale-wisp")).toHaveLength(0)
    expect(screen.getAllByTestId("arc-duration-label").length).toBeGreaterThanOrEqual(
      3
    )
  })
})
