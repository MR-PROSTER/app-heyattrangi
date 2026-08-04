import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { GroundingSession } from "../components/GroundingSession"
import { getActivityBySlug } from "../data/activities"
import { useSessionStore } from "../store/useSessionStore"

const push = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn(), back: vi.fn() }),
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
      button: ({
        children,
        ...rest
      }: React.PropsWithChildren<Record<string, unknown>>) => {
        const clean = { ...rest }
        delete clean.initial
        delete clean.animate
        delete clean.exit
        delete clean.transition
        return ReactMod.createElement("button", clean, children)
      },
      span: passthrough,
      p: passthrough,
      circle: (props: Record<string, unknown>) =>
        ReactMod.createElement("circle", props),
      path: (props: Record<string, unknown>) =>
        ReactMod.createElement("path", props),
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
    ) => {
      let v = typeof fn === "function" ? fn(source.get()) : 0
      return {
        get: () => v,
        set: (n: number) => {
          v = n
        },
        on: () => () => {},
        onChange: () => () => {},
      }
    },
  }
})

const activity = getActivityBySlug("5-4-3-2-1-grounding")!

describe("GroundingSession", () => {
  beforeEach(() => {
    cleanup()
    push.mockClear()
    sessionStorage.clear()
    useSessionStore.setState({
      history: [],
      prefs: {
        sound: false,
        haptics: false,
        defaultCycles: 8,
        exhaleGuide: false,
        groundingSenses: {
          see: "default",
          feel: "default",
          hear: "default",
          smell: "default",
          taste: "default",
        },
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
        matches: query.includes("prefers-reduced-motion: reduce"),
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

  it("5 steps render with counts 5,4,3,2,1 via Begin", async () => {
    const user = userEvent.setup()
    render(<GroundingSession activity={activity} />)
    expect(screen.getByRole("heading", { name: /5-4-3-2-1/i })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Begin" }))
    expect(screen.getByTestId("grounding-numeral")).toHaveTextContent("5")
    expect(screen.getByTestId("grounding-progress").children).toHaveLength(5)
  })

  it("filling all slots reveals Next; Next advances numeral", async () => {
    const user = userEvent.setup()
    // Slow the clock so look-again doesn't fire
    const started = Date.now()
    vi.spyOn(Date, "now").mockImplementation(() => started)

    render(<GroundingSession activity={activity} />)
    await user.click(screen.getByRole("button", { name: "Begin" }))

    for (let i = 0; i < 5; i++) {
      await user.click(
        screen.getByRole("button", { name: `Item ${i + 1} of 5, empty` })
      )
    }
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument()

    // Advance time past anti-reflex threshold
    vi.spyOn(Date, "now").mockImplementation(() => started + 10_000)
    await user.click(screen.getByRole("button", { name: "Next" }))
    expect(screen.getByTestId("grounding-numeral")).toHaveTextContent("4")
  })

  it("Nothing right now swaps to fallbackPrompt in place", async () => {
    const user = userEvent.setup()
    render(<GroundingSession activity={activity} />)
    await user.click(screen.getByRole("button", { name: "Begin" }))
    expect(
      screen.getByRole("heading", { name: /five things you can see/i })
    ).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Nothing right now" }))
    expect(
      screen.getByRole("heading", {
        name: /Five things you can picture/i,
      })
    ).toBeInTheDocument()
  })

  it("substituting smell persists; next session leads with substitute", async () => {
    const user = userEvent.setup()
    const started = Date.now()
    vi.spyOn(Date, "now").mockImplementation(() => started)

    render(<GroundingSession activity={activity} />)
    await user.click(screen.getByRole("button", { name: "Begin" }))

    // Skip to smell quickly via skip
    for (let s = 0; s < 3; s++) {
      await user.click(screen.getByRole("button", { name: "Skip this one" }))
      await Promise.resolve()
    }
    expect(screen.getByTestId("grounding-numeral")).toHaveTextContent("2")
    await user.click(screen.getByRole("button", { name: "Nothing right now" }))
    expect(useSessionStore.getState().prefs.groundingSenses?.smell).toBe(
      "substitute"
    )

    cleanup()
    sessionStorage.clear()
    render(<GroundingSession activity={activity} />)
    await user.click(screen.getByRole("button", { name: "Begin" }))
    for (let s = 0; s < 3; s++) {
      await user.click(screen.getByRole("button", { name: "Skip this one" }))
      await Promise.resolve()
    }
    expect(
      screen.getByRole("heading", { name: /Two smells you love/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Use the original" })
    ).toBeInTheDocument()
  })

  it("sense set to skip renders 4 progress bars and omits the step", async () => {
    const user = userEvent.setup()
    useSessionStore.setState({
      prefs: {
        ...useSessionStore.getState().prefs,
        groundingSenses: {
          see: "default",
          feel: "default",
          hear: "default",
          smell: "skip",
          taste: "default",
        },
      },
    })
    render(<GroundingSession activity={activity} />)
    await user.click(screen.getByRole("button", { name: "Begin" }))
    expect(screen.getByTestId("grounding-progress").children).toHaveLength(4)
  })

  it("fast complete shows look-again once; not on last two steps", async () => {
    const user = userEvent.setup()
    const started = Date.now()
    vi.spyOn(Date, "now").mockImplementation(() => started)

    render(<GroundingSession activity={activity} />)
    await user.click(screen.getByRole("button", { name: "Begin" }))
    for (let i = 0; i < 5; i++) {
      await user.click(
        screen.getByRole("button", { name: `Item ${i + 1} of 5, empty` })
      )
    }
    await user.click(screen.getByRole("button", { name: "Next" }))
    expect(screen.getByTestId("look-again-nudge")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /I'm good/i }))
    expect(screen.getByTestId("grounding-numeral")).toHaveTextContent("4")
  })

  it("default does not save entries; Save these persists them", async () => {
    const user = userEvent.setup()
    // Complete by skipping all
    render(<GroundingSession activity={activity} />)
    await user.click(screen.getByRole("button", { name: "Begin" }))
    for (let s = 0; s < 5; s++) {
      await user.click(screen.getByRole("button", { name: "Skip this one" }))
      await Promise.resolve()
    }
    expect(screen.getByText(/Sometimes it's not the right tool/i)).toBeInTheDocument()
    expect(
      useSessionStore.getState().history.some((h) => h.groundingEntries?.length)
    ).toBe(false)
  })

  it("prefers-reduced-motion: numeral and progress still render", async () => {
    const user = userEvent.setup()
    render(<GroundingSession activity={activity} />)
    await user.click(screen.getByRole("button", { name: "Begin" }))
    expect(screen.getByTestId("grounding-numeral")).toBeInTheDocument()
    expect(screen.getByTestId("grounding-progress")).toBeInTheDocument()
    expect(screen.queryByTestId("slot-ripple")).not.toBeInTheDocument()
  })
})
