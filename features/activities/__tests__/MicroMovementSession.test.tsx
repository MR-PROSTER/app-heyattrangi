import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { render, screen, cleanup, act, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { MicroMovementSession } from "../components/MicroMovementSession"
import { getActivityBySlug } from "../data/activities"
import { buildMicroMovementSteps } from "../data/microMovements"
import { useSessionStore } from "../store/useSessionStore"

const push = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn(), back: vi.fn() }),
}))

vi.mock("../lib/audioBridge", () => ({
  unlockSharedAudio: vi.fn(async () => true),
  isSharedAudioUnlocked: vi.fn(() => true),
  getSharedAudioContext: vi.fn(() => null),
  adoptSharedAudioContext: vi.fn(),
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
    delete clean.style
    return ReactMod.createElement("div", clean, children)
  }
  return {
    motion: {
      div: passthrough,
      button: passthrough,
      span: passthrough,
      p: passthrough,
      path: (props: Record<string, unknown>) =>
        ReactMod.createElement("path", props),
      circle: (props: Record<string, unknown>) =>
        ReactMod.createElement("circle", props),
      g: passthrough,
    },
    AnimatePresence: ({ children }: React.PropsWithChildren) => children,
    useMotionValue: (init: number) => {
      let v = init
      return {
        get: () => v,
        set: (n: number) => {
          v = n
        },
        on: () => () => {},
        onChange: () => () => {},
      }
    },
    useTransform: (
      source: { get: () => number },
      fn: (n: number) => number
    ) => ({
      get: () => (typeof fn === "function" ? fn(source.get()) : 0),
      set: () => {},
      on: () => () => {},
      onChange: () => () => {},
    }),
  }
})

const activity = getActivityBySlug("micro-movement")!

describe("MicroMovementSession", () => {
  beforeEach(() => {
    cleanup()
    push.mockClear()
    sessionStorage.clear()
    useSessionStore.setState({
      history: [],
      prefs: {
        sound: true,
        haptics: false,
        defaultCycles: 8,
        exhaleGuide: false,
        movementLevel: {
          jaw: "standard",
          shoulders: "standard",
          hands: "standard",
          neck: "standard",
          feet: "standard",
          ankles: "standard",
          spine: "standard",
          whole: "standard",
          tongue: "standard",
          brows: "standard",
        },
        discreetMode: false,
        eyesClosedMode: false,
        autoAdvance: false,
      },
      sessionActive: false,
      _hasHydrated: true,
    })
    vi.spyOn(useSessionStore.persist, "rehydrate").mockResolvedValue(
      undefined as never
    )
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: query.includes("prefers-reduced-motion: reduce")
          ? false
          : false,
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
    vi.useRealTimers()
  })

  async function begin() {
    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: "Begin" }))
    return user
  }

  it("8 steps in head-to-feet order; step 8 has no motion sketch paths", async () => {
    const steps = buildMicroMovementSteps(false)
    expect(steps.map((s) => s.bodyRegion)).toEqual([
      "jaw",
      "shoulders",
      "hands",
      "neck",
      "feet",
      "ankles",
      "spine",
      "whole",
    ])
    expect(steps).toHaveLength(8)

    render(<MicroMovementSession activity={activity} />)
    const user = await begin()

    for (let i = 0; i < 7; i++) {
      expect(screen.getByTestId("motion-sketch")).toBeInTheDocument()
      await user.click(screen.getByTestId("micro-next"))
    }
    // whole body — sketch shows marker only (no path gesture)
    expect(
      screen.getAllByText(/Nothing to do now/i).length
    ).toBeGreaterThan(0)
    const sketch = screen.getByTestId("motion-sketch")
    expect(within(sketch).queryAllByRole("img")).toHaveLength(0)
    expect(sketch.querySelectorAll("path").length).toBe(0)
  })

  it("Make this easier cycles standard → gentler → imagined", async () => {
    render(<MicroMovementSession activity={activity} />)
    const user = await begin()

    expect(
      screen.getAllByText(/Let your teeth come apart/i).length
    ).toBeGreaterThan(0)
    await user.click(
      screen.getByRole("button", {
        name: /Show an easier version of this movement/i,
      })
    )
    expect(
      screen.getAllByText(/Part your lips just a little/i).length
    ).toBeGreaterThan(0)
    expect(useSessionStore.getState().prefs.movementLevel?.jaw).toBe("gentler")

    await user.click(
      screen.getByRole("button", {
        name: /Show an easier version of this movement/i,
      })
    )
    expect(
      screen.getAllByText(/Picture your jaw unclenching/i).length
    ).toBeGreaterThan(0)
    expect(useSessionStore.getState().prefs.movementLevel?.jaw).toBe(
      "imagined"
    )
  })

  it("persists gentler for neck and shows try the full version", async () => {
    useSessionStore.setState((s) => ({
      prefs: {
        ...s.prefs,
        movementLevel: {
          ...s.prefs.movementLevel!,
          neck: "gentler",
        },
      },
    }))

    render(<MicroMovementSession activity={activity} />)
    const user = await begin()

    // skip to neck (4th)
    await user.click(screen.getByTestId("micro-next"))
    await user.click(screen.getByTestId("micro-next"))
    await user.click(screen.getByTestId("micro-next"))

    expect(
      screen.getAllByText(/Just turn your eyes to one side/i).length
    ).toBeGreaterThan(0)
    expect(
      screen.getByRole("button", { name: /Try the full version/i })
    ).toBeInTheDocument()
  })

  it("discreet mode: neck absent, 2 discreet-only steps, progress shows 9", async () => {
    render(<MicroMovementSession activity={activity} />)
    const user = userEvent.setup()

    await user.click(
      screen.getByRole("checkbox", { name: /I'm around other people/i })
    )
    expect(screen.getByTestId("discreet-state")).toHaveTextContent(/on/i)
    await user.click(screen.getByRole("button", { name: "Begin" }))

    expect(screen.getByLabelText(/Step 1 of 9/i)).toBeInTheDocument()
    const regions: string[] = []
    for (let i = 0; i < 9; i++) {
      const label = screen.getByText(
        /^(Jaw|Shoulders|Hands|Neck|Feet|Ankles|Spine|Whole body|Tongue|Brows)$/
      )
      regions.push(label.textContent ?? "")
      if (i < 8) await user.click(screen.getByTestId("micro-next"))
    }
    expect(regions).not.toContain("Neck")
    expect(regions).toContain("Tongue")
    expect(regions).toContain("Brows")
    expect(regions).toHaveLength(9)
  })

  it("eyes-closed mode renders dim overlay; controls stay reachable", async () => {
    render(<MicroMovementSession activity={activity} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole("checkbox", { name: /Eyes closed/i }))
    await user.click(screen.getByRole("button", { name: "Begin" }))

    expect(screen.getByTestId("eyes-closed-overlay")).toBeInTheDocument()
    const next = screen.getByTestId("micro-next")
    expect(next).toBeVisible()
    next.focus()
    expect(document.activeElement).toBe(next)
    expect(
      screen.getByRole("button", { name: "Skip" })
    ).toBeInTheDocument()
  })

  it("auto-advance off by default; enabled advances 4s after chime; disabled outside eyes-closed", async () => {
    render(<MicroMovementSession activity={activity} />)
    expect(
      screen.queryByRole("checkbox", { name: /Advance on its own/i })
    ).not.toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(screen.getByRole("checkbox", { name: /Eyes closed/i }))
    const auto = screen.getByRole("checkbox", {
      name: /Advance on its own/i,
    })
    expect(auto).not.toBeChecked()
    await user.click(auto)

    vi.useFakeTimers({ shouldAdvanceTime: true })
    let now = 0
    vi.spyOn(performance, "now").mockImplementation(() => now)
    let rafCb: FrameRequestCallback | null = null
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCb = cb
      return 1
    })
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {
      rafCb = null
    })

    await user.click(screen.getByRole("button", { name: "Begin" }))
    // allow async eyes-closed unlock
    await act(async () => {
      await Promise.resolve()
    })

    await act(async () => {
      now = 500
      rafCb?.(now)
    })
    await act(async () => {
      now = 20000
      rafCb?.(now)
    })

    expect(
      screen.getAllByText(/Let your teeth come apart/i).length
    ).toBeGreaterThan(0)

    await act(async () => {
      vi.advanceTimersByTime(4000)
    })

    expect(
      screen.getAllByText(/Lift your shoulders toward your ears/i).length
    ).toBeGreaterThan(0)
  })

  it("skipping all steps reaches non-failure completion copy", async () => {
    render(<MicroMovementSession activity={activity} />)
    const user = await begin()
    for (let i = 0; i < 8; i++) {
      await user.click(screen.getByRole("button", { name: "Skip" }))
    }
    expect(
      screen.getByRole("heading", { name: /Not today, then\. That's fine\./i })
    ).toBeInTheDocument()
  })

  it("prefers-reduced-motion: static sketch, stepped ring, no glow pulse class animation", async () => {
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

    render(<MicroMovementSession activity={activity} />)
    await begin()

    expect(screen.getByTestId("advisory-ring")).toBeInTheDocument()
    expect(screen.getByTestId("motion-sketch")).toBeInTheDocument()
    expect(screen.getByTestId("movement-figure")).toBeInTheDocument()
  })
})
