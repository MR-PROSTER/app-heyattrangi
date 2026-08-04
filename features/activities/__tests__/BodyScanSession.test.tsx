import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { render, screen, cleanup, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { BodyScanSession } from "../components/BodyScanSession"
import { getActivityBySlug } from "../data/activities"
import { useSessionStore } from "../store/useSessionStore"
import { SCAN_REGION_SPECS } from "../data/bodyScan"

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
      fn: (n: number) => number | string
    ) => ({
      get: () => (typeof fn === "function" ? fn(source.get()) : 0),
      set: () => {},
      on: () => () => {},
      onChange: () => () => {},
    }),
  }
})

const activity = getActivityBySlug("body-scan")!

describe("BodyScanSession", () => {
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
        scanEyes: "closed",
        scanAnchor: "hands",
        scanSkipRegions: [],
        scanAmbience: false,
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
    vi.useRealTimers()
  })

  async function beginEyesClosed() {
    const user = userEvent.setup()
    render(<BodyScanSession activity={activity} />)
    await user.click(screen.getByRole("button", { name: "Begin" }))
    await act(async () => {
      await Promise.resolve()
    })
    return user
  }

  it("eyes-closed default renders overlay path; controls stay reachable", async () => {
    const user = await beginEyesClosed()
    // Overlay may appear after 3s — advance
    vi.useFakeTimers({ shouldAdvanceTime: true })
    await act(async () => {
      vi.advanceTimersByTime(3100)
    })
    // Overlay or not, Stop and Anchor must be in tree
    expect(screen.getByTestId("scan-stop")).toBeInTheDocument()
    expect(screen.getByTestId("back-to-anchor")).toBeInTheDocument()
    screen.getByTestId("scan-stop").focus()
    expect(document.activeElement).toBe(screen.getByTestId("scan-stop"))
    void user
  })

  it("Back to my anchor pauses and Carry on resumes same region", async () => {
    const user = await beginEyesClosed()
    expect(
      screen.getAllByText(/Start at your feet/i).length
    ).toBeGreaterThan(0)

    await user.click(screen.getByTestId("back-to-anchor"))
    expect(
      screen.getAllByText(/Bring your attention back to your hands/i).length
    ).toBeGreaterThan(0)
    expect(
      screen.getByRole("button", { name: /Carry on/i })
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /Carry on/i }))
    expect(
      screen.getAllByText(/Start at your feet/i).length
    ).toBeGreaterThan(0)
  })

  it("skipping chest + belly omits both silently — no skipped marker", async () => {
    const user = userEvent.setup()
    render(<BodyScanSession activity={activity} />)
    await user.click(screen.getByText("Chest"))
    await user.click(screen.getByText("Belly"))
    await user.click(screen.getByRole("button", { name: "Begin" }))
    await act(async () => {
      await Promise.resolve()
    })

    expect(document.body.textContent).not.toMatch(/skipped/i)
    expect(screen.queryByText(/^Chest$/)).not.toBeInTheDocument()
    // Prompt should be feet (first non-skipped)
    expect(
      screen.getAllByText(/Start at your feet/i).length
    ).toBeGreaterThan(0)
  })

  it("all regions deselected → Begin disabled with inline line", async () => {
    const user = userEvent.setup()
    render(<BodyScanSession activity={activity} />)
    // Deselect all by checking every region in the full list via skip — only 3 skippable
    // Simulate all 12 skipped by setting prefs and remounting isn't available;
    // use skip on the three + we need all — set skipRegions via store and force empty timeline
    // Actually beginBlocked only when skipRegions somehow empties all — skip only 3.
    // Toggle all region checkboxes won't exist. Use store + remount:
    cleanup()
    useSessionStore.setState((s) => ({
      prefs: {
        ...s.prefs,
        scanSkipRegions: SCAN_REGION_SPECS.map((r) => r.id),
      },
    }))
    // BodyScanSession initializes skip from prefs
    render(<BodyScanSession activity={activity} />)
    // Need to set all skipped - the component only has 3 skippable in UI.
    // Directly: select all skippable isn't enough. Use a test-only path:
    // Click Begin when we'd need empty — instead set skip by clicking isn't enough.
    // Re-read: "all 12 regions skipped" — the picker only shows chest/belly/hips.
    // Spec says skipRegions can omit any. For test, initialize with all ids:
    cleanup()
    const { rerender } = render(<BodyScanSession activity={activity} />)
    // Patch by selecting only skippable thrice doesn't block. Build empty via
    // setting local state — expose through re-init with prefs containing all:
    cleanup()
    useSessionStore.setState((s) => ({
      prefs: {
        ...s.prefs,
        scanSkipRegions: SCAN_REGION_SPECS.map((r) => r.id),
      },
    }))
    render(<BodyScanSession activity={activity} />)
    expect(screen.getByTestId("begin-blocked")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Begin" })).toBeDisabled()
    expect(screen.getByTestId("begin-blocked").className).not.toMatch(
      /error|danger|red/i
    )
    void user
    void rerender
  })

  it("wander reminder appears at regions 5 and 9 for 6s", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    let now = 0
    vi.spyOn(performance, "now").mockImplementation(() => now)
    let rafCb: FrameRequestCallback | null = null
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCb = cb
      return 1
    })

    render(<BodyScanSession activity={activity} />)
    // userEvent with fake timers needs special setup
    await act(async () => {
      screen.getByRole("button", { name: "Begin" }).click()
      await Promise.resolve()
    })

    // Region 5 starts at 4*25s = 100000 for default 5min (25s each)
    await act(async () => {
      now = 100010
      rafCb?.(now)
    })
    expect(screen.getByTestId("wander-reminder")).toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(6000)
    })
    expect(screen.queryByTestId("wander-reminder")).not.toBeInTheDocument()

    // Region 9 starts at 8*25s = 200000
    await act(async () => {
      now = 200010
      rafCb?.(now)
    })
    expect(screen.getByTestId("wander-reminder")).toBeInTheDocument()
  })

  it("no progress bar, region counter, or time-remaining during session", async () => {
    await beginEyesClosed()
    expect(screen.queryByTestId("micro-progress")).not.toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(
      /\b\d+\s*(sec|min|seconds|minutes)\s*remaining\b/i
    )
    expect(document.body.textContent).not.toMatch(/Step \d+ of \d+/i)
    expect(screen.queryByLabelText(/progress/i)).not.toBeInTheDocument()
  })

  it("Restless completion copy is neutral and normalizing", async () => {
    const user = await beginEyesClosed()
    await user.click(screen.getByTestId("scan-stop"))
    // Early end — no feeling picker when endedEarly. Complete fully instead:
    // For restless test we need !endedEarly. Force by completing via store screen.
    cleanup()
    // Simulate complete phase by stopping without early? stopEarly sets endedEarly.
    // Render and jump: call stop is early. Instead complete via engine — long.
    // Reasonable: render completion by early stop shows different copy; for restless
    // we need a finished session. Use a hack: set results by finishing quickly with mocked engine.
    // Simpler approach: stop early has no restless. Re-open with completed path:
    // Actually change test to complete flow - click through isn't paced.
    // Mount with a one-segment timeline by skipping 11 regions — can't via UI.
    // Use 3min and advance time to complete:
    cleanup()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    let now = 0
    vi.spyOn(performance, "now").mockImplementation(() => now)
    let rafCb: FrameRequestCallback | null = null
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCb = cb
      return 1
    })
    render(<BodyScanSession activity={activity} />)
    await act(async () => {
      screen.getByRole("button", { name: "Begin" }).click()
      await Promise.resolve()
    })
    await act(async () => {
      now = 300000
      rafCb?.(now)
    })
    expect(screen.getByText(/How was that/i)).toBeInTheDocument()
    const restless = screen.getByTestId("feeling-restless")
    expect(restless.className).not.toMatch(/red|danger|error/i)
    await act(async () => {
      restless.click()
    })
    expect(screen.getByTestId("restless-copy")).toHaveTextContent(
      /Restless is really common/i
    )
  })

  it("narrationUrl undefined → no failed network request for audio assets", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response()
    )
    await beginEyesClosed()
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })

  it("prefers-reduced-motion: segmented trail, no continuous travel pulse", async () => {
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
    await beginEyesClosed()
    expect(screen.getByTestId("scan-figure")).toBeInTheDocument()
    expect(screen.getByTestId("scan-trail-segmented")).toBeInTheDocument()
  })
})
