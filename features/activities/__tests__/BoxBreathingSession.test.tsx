import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { render, screen, act, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { BoxBreathingSession } from "../components/BoxBreathingSession"
import { getActivityBySlug } from "../data/activities"
import { useSessionStore } from "../store/useSessionStore"
import type { Phase } from "../types"

const push = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn(), back: vi.fn() }),
}))

vi.mock("../hooks/usePacedTimeline", () => ({
  useBreathingEngine: (opts: {
    onComplete?: () => void
    onPhaseChange?: (phase: Phase, cycle: number) => void
    totalCycles: number
  }) => {
    const [status, setStatus] = React.useState<
      "idle" | "running" | "paused" | "complete"
    >("idle")
    const mv = { get: () => 0, set: vi.fn(), on: () => () => undefined }

    React.useEffect(() => {
      ;(
        globalThis as unknown as { __boxBreathingComplete?: () => void }
      ).__boxBreathingComplete = () => {
        setStatus("complete")
        opts.onComplete?.()
      }
      // Intentionally only rebind when onComplete identity changes
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opts.onComplete])

    return {
      status,
      phase: "inhale" as Phase,
      phaseIndex: 0,
      phaseSpec: {
        id: "inhale",
        kind: "inhale" as const,
        seconds: 4,
        label: "Inhale",
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
        opts.onPhaseChange?.("inhale", 1)
      },
      pause: () => setStatus("paused"),
      resume: () => setStatus("running"),
      restart: () => setStatus("running"),
      end: () => {
        setStatus("complete")
        return { cyclesCompleted: 3, elapsedMs: 50_000 }
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

const activity = getActivityBySlug("box-breathing")!

describe("BoxBreathingSession", () => {
  beforeEach(() => {
    cleanup()
    push.mockClear()
    useSessionStore.setState({
      history: [],
      prefs: {
        sound: false,
        haptics: false,
        defaultCycles: 8,
        exhaleGuide: false,
      },
      _hasHydrated: true,
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

  it("renders pre-session and Begin starts the countdown", async () => {
    const user = userEvent.setup()
    render(<BoxBreathingSession activity={activity} />)

    expect(
      screen.getByRole("heading", { name: "Box Breathing" })
    ).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Begin" }))
    expect(screen.getByLabelText("Skip countdown")).toBeInTheDocument()
  })

  it("pause button toggles aria-label between Pause and Resume", async () => {
    const user = userEvent.setup()
    render(<BoxBreathingSession activity={activity} />)
    await user.click(screen.getByRole("button", { name: "Begin" }))
    await user.click(screen.getByLabelText("Skip countdown"))

    const pause = await screen.findByLabelText("Pause session")
    await user.click(pause)
    expect(await screen.findByLabelText("Resume session")).toBeInTheDocument()
  })

  it("completion screen appears and addSession is called once with completed true", async () => {
    const addSession = vi.fn()
    useSessionStore.setState({
      addSession: (r) => {
        addSession(r)
      },
    })

    const user = userEvent.setup()
    render(<BoxBreathingSession activity={activity} />)
    await user.click(screen.getByRole("button", { name: "Begin" }))
    await user.click(screen.getByLabelText("Skip countdown"))

    await screen.findByLabelText("Pause session")

    await act(async () => {
      ;(
        globalThis as unknown as { __boxBreathingComplete?: () => void }
      ).__boxBreathingComplete?.()
    })

    expect(
      await screen.findByRole("button", { name: "Done" })
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Done" }))
    expect(addSession).toHaveBeenCalledTimes(1)
    expect(addSession.mock.calls[0][0]).toMatchObject({
      completed: true,
      cyclesPlanned: 8,
      cyclesCompleted: 8,
    })
  })

  it("with prefers-reduced-motion: reduce, no ripple elements render", async () => {
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
    render(<BoxBreathingSession activity={activity} />)
    await user.click(screen.getByRole("button", { name: "Begin" }))
    await user.click(screen.getByLabelText("Skip countdown"))

    await screen.findByLabelText("Pause session")
    expect(screen.queryAllByTestId("breath-ripple")).toHaveLength(0)
  })

  it("keyboard-only flow reaches the Done button", async () => {
    const user = userEvent.setup()
    render(<BoxBreathingSession activity={activity} />)

    const begin = screen.getByRole("button", { name: "Begin" })
    begin.focus()
    await user.keyboard("{Enter}")
    await screen.findByLabelText("Skip countdown")
    screen.getByLabelText("Skip countdown").focus()
    await user.keyboard("{Enter}")

    const endBtn = await screen.findByLabelText("End session")
    endBtn.focus()
    await user.keyboard("{Enter}")
    const dialog = await screen.findByRole("dialog")
    await user.click(
      dialog.querySelector("button:last-child") as HTMLButtonElement
    )
    expect(
      await screen.findByRole("button", { name: "Done" })
    ).toBeInTheDocument()
  })
})
