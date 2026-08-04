import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { render, screen, cleanup, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import {
  SteppedSession,
  __testBuildStepsCompleted,
} from "../components/session/SteppedSession"
import type { Activity, StepSpec } from "../types"
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
    return ReactMod.createElement("div", clean, children)
  }
  const makeMv = (init: number) => {
    let v = init
    const listeners = new Set<(n: number) => void>()
    return {
      get: () => v,
      set: (n: number) => {
        v = n
        listeners.forEach((l) => l(n))
      },
      on: (_e: string, cb: (n: number) => void) => {
        listeners.add(cb)
        return () => listeners.delete(cb)
      },
      onChange: (cb: (n: number) => void) => {
        listeners.add(cb)
        return () => listeners.delete(cb)
      },
    }
  }
  return {
    motion: {
      div: passthrough,
      button: passthrough,
      span: passthrough,
      p: passthrough,
      circle: (props: Record<string, unknown>) =>
        ReactMod.createElement("circle", props),
    },
    AnimatePresence: ({ children }: React.PropsWithChildren) => children,
    useMotionValue: (init: number) => makeMv(init),
    useTransform: (
      source: { get: () => number },
      fn: ((n: number) => number) | number[]
    ) => {
      const mv = makeMv(0)
      const compute = () =>
        typeof fn === "function" ? fn(source.get()) : source.get()
      mv.set(compute())
      return mv
    },
  }
})

const activity: Activity = {
  id: "test-stepped",
  title: "Test Stepped",
  slug: "test-stepped",
  category: "grounding",
  durationLabel: "1 min",
  description: "Test",
  longDescription: "Test long",
  icon: "senses",
  kind: "grounding",
}

const STEPS: StepSpec[] = [
  {
    id: "a",
    count: 2,
    sense: "see",
    prompt: "Two things?",
    hint: "Hint",
    fallbackPrompt: "Fallback A",
  },
  {
    id: "b",
    count: 1,
    sense: "feel",
    prompt: "One thing?",
    hint: "Hint",
    fallbackPrompt: "Fallback B",
  },
]

describe("SteppedSession", () => {
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
      },
      sessionActive: false,
      _hasHydrated: true,
    })
    vi.spyOn(useSessionStore.persist, "rehydrate").mockResolvedValue(
      undefined as never
    )
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: () => ({
        matches: false,
        media: "",
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

  it("advances only on explicit Next; never auto-advances after last slot fills", async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(
      <SteppedSession
        activity={activity}
        steps={STEPS}
        onComplete={onComplete}
        renderStep={(ctx) => (
          <div>
            <p>{ctx.step.prompt}</p>
            <button type="button" onClick={ctx.fillNext}>
              Fill
            </button>
            {ctx.canAdvance ? (
              <button type="button" onClick={ctx.goNext}>
                Next
              </button>
            ) : null}
          </div>
        )}
      />
    )

    expect(screen.getByText("Two things?")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Fill" }))
    await user.click(screen.getByRole("button", { name: "Fill" }))
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument()
    expect(screen.getByText("Two things?")).toBeInTheDocument()
    expect(onComplete).not.toHaveBeenCalled()

    await user.click(screen.getByRole("button", { name: "Next" }))
    // look-again may appear for fast fill on step 0
    const imGood = screen.queryByRole("button", { name: /I'm good/i })
    if (imGood) await user.click(imGood)
    expect(screen.getByText("One thing?")).toBeInTheDocument()
  })

  it("no time/countdown pattern renders during the session", () => {
    render(
      <SteppedSession
        activity={activity}
        steps={STEPS}
        onComplete={vi.fn()}
        renderStep={(ctx) => <p>{ctx.step.prompt}</p>}
      />
    )
    expect(document.body.textContent).not.toMatch(
      /\b\d+\s*(sec|min|seconds|minutes)\b/i
    )
    expect(screen.queryByLabelText(/countdown/i)).not.toBeInTheDocument()
  })

  it("skipping a step records stepsCompleted correctly", async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(
      <SteppedSession
        activity={activity}
        steps={STEPS}
        sessionSlug="test-stepped"
        onComplete={onComplete}
        renderStep={(ctx) => (
          <div>
            <p>{ctx.step.prompt}</p>
            <button type="button" onClick={ctx.skip}>
              Skip this one
            </button>
            <button type="button" onClick={ctx.fillNext}>
              Fill
            </button>
            {ctx.canAdvance ? (
              <button type="button" onClick={ctx.goNext}>
                Next
              </button>
            ) : null}
          </div>
        )}
      />
    )

    await user.click(screen.getByRole("button", { name: "Skip this one" }))
    await act(async () => {
      await Promise.resolve()
    })
    expect(screen.getByText("One thing?")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Fill" }))
    await user.click(screen.getByRole("button", { name: "Next" }))

    expect(onComplete).toHaveBeenCalled()
    const results = onComplete.mock.calls[0][0]
    expect(__testBuildStepsCompleted(results, STEPS)).toBe(2)
    expect(useSessionStore.getState().history[0]?.stepsCompleted).toBe(2)
    expect(useSessionStore.getState().history[0]?.kind).toBe("stepped")
  })

  it("suggestedSeconds renders the ring; Next enabled at t=0", async () => {
    const { AdvisoryRing } = await import("../components/AdvisoryRing")
    render(
      <SteppedSession
        activity={activity}
        steps={[
          {
            id: "dwell",
            count: 0,
            prompt: "Dwell here",
            hint: "",
            fallbackPrompt: "",
            suggestedSeconds: 20,
          },
        ]}
        onComplete={vi.fn()}
        renderStep={(ctx) => (
          <div>
            <p>{ctx.step.prompt}</p>
            {ctx.advisory ? (
              <AdvisoryRing
                progressMv={ctx.advisory.progressMv}
                complete={ctx.advisory.complete}
              />
            ) : null}
            <button type="button" onClick={ctx.goNext}>
              Next
            </button>
          </div>
        )}
      />
    )
    expect(screen.getByTestId("advisory-ring")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled()
  })

  it("ring completion fires onAdvisoryComplete once and does not advance", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const onAdvisory = vi.fn()
    const onComplete = vi.fn()
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

    render(
      <SteppedSession
        activity={activity}
        steps={[
          {
            id: "dwell",
            count: 0,
            prompt: "Stay",
            hint: "",
            fallbackPrompt: "",
            suggestedSeconds: 2,
          },
          {
            id: "two",
            count: 0,
            prompt: "Second",
            hint: "",
            fallbackPrompt: "",
          },
        ]}
        onComplete={onComplete}
        onAdvisoryComplete={onAdvisory}
        renderStep={(ctx) => (
          <div>
            <p>{ctx.step.prompt}</p>
            <span data-testid="adv-complete">
              {String(!!ctx.advisory?.complete)}
            </span>
          </div>
        )}
      />
    )

    await act(async () => {
      now = 500
      rafCb?.(now)
    })
    await act(async () => {
      now = 2100
      rafCb?.(now)
    })

    expect(onAdvisory).toHaveBeenCalledTimes(1)
    expect(onAdvisory).toHaveBeenCalledWith("dwell")
    expect(screen.getByText("Stay")).toBeInTheDocument()
    expect(onComplete).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it("pause at 8s then resume later leaves ~12s remaining on a 20s ring", async () => {
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

    let remaining = 0
    render(
      <SteppedSession
        activity={activity}
        steps={[
          {
            id: "dwell",
            count: 0,
            prompt: "Stay",
            hint: "",
            fallbackPrompt: "",
            suggestedSeconds: 20,
          },
        ]}
        onComplete={vi.fn()}
        renderStep={(ctx) => {
          remaining = ctx.advisory?.remainingMs ?? 0
          return (
            <div>
              <button
                type="button"
                onClick={
                  ctx.sessionPaused ? ctx.resumeSession : ctx.pauseSession
                }
              >
                {ctx.sessionPaused ? "Resume" : "Pause"}
              </button>
              <span data-testid="rem">{Math.round(remaining)}</span>
            </div>
          )
        }}
      />
    )

    await act(async () => {
      now = 8000
      rafCb?.(now)
    })
    expect(Number(screen.getByTestId("rem").textContent)).toBeCloseTo(
      12000,
      -2
    )

    await act(async () => {
      screen.getByRole("button", { name: "Pause" }).click()
    })

    await act(async () => {
      now = 30000
      // paused — no tick
    })

    await act(async () => {
      screen.getByRole("button", { name: "Resume" }).click()
    })

    await act(async () => {
      now = 30001
      rafCb?.(now)
    })

    expect(Number(screen.getByTestId("rem").textContent)).toBeCloseTo(
      12000,
      -2
    )
    vi.useRealTimers()
  })

  it("step without suggestedSeconds renders no ring", async () => {
    const { AdvisoryRing } = await import("../components/AdvisoryRing")
    render(
      <SteppedSession
        activity={activity}
        steps={STEPS}
        onComplete={vi.fn()}
        renderStep={(ctx) => (
          <div>
            <p>{ctx.step.prompt}</p>
            {ctx.advisory ? (
              <AdvisoryRing
                progressMv={ctx.advisory.progressMv}
                complete={ctx.advisory.complete}
              />
            ) : (
              <span data-testid="no-ring">none</span>
            )}
          </div>
        )}
      />
    )
    expect(screen.getByTestId("no-ring")).toBeInTheDocument()
    expect(screen.queryByTestId("advisory-ring")).not.toBeInTheDocument()
  })
})
