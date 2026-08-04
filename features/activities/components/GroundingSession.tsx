"use client"

import {
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import type { Activity, Sense, StepResult } from "../types"
import { GROUNDING_STEPS } from "../data/groundingSteps"
import { useSessionStore } from "../store/useSessionStore"
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion"
import {
  SteppedSession,
  type StepContext,
} from "./session/SteppedSession"

const SLUG = "5-4-3-2-1-grounding"

interface GroundingSessionProps {
  activity: Activity
  backHref?: string
}

function ProgressBars({
  total,
  current,
}: {
  total: number
  current: number
}) {
  return (
    <div
      className="mx-auto flex w-full max-w-xs gap-1.5"
      role="img"
      aria-label={`Step ${current + 1} of ${total}`}
      data-testid="grounding-progress"
    >
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full ${
            i <= current ? "bg-accent" : "bg-hairline"
          }`}
        />
      ))}
    </div>
  )
}

function SlotButton({
  index,
  total,
  filled,
  isNext,
  text,
  reducedMotion,
  onFill,
  onUndo,
  onTextChange,
}: {
  index: number
  total: number
  filled: boolean
  isNext: boolean
  text: string
  reducedMotion: boolean
  onFill: () => void
  onUndo: () => void
  onTextChange: (v: string) => void
}) {
  const [rippling, setRippling] = useState(false)
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleActivate = () => {
    if (filled) return
    if (!reducedMotion) {
      setRippling(true)
      window.setTimeout(() => setRippling(false), 500)
    }
    onFill()
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        className={`relative grid h-14 w-14 place-items-center overflow-hidden rounded-2xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${
          filled
            ? "border-accent bg-accent-soft"
            : "border-hairline bg-surface"
        }`}
        style={
          !filled && isNext && !reducedMotion
            ? { animation: "grounding-pulse 3s ease-in-out infinite" }
            : undefined
        }
        aria-label={
          filled
            ? `Item ${index + 1} of ${total}, filled`
            : `Item ${index + 1} of ${total}, empty`
        }
        onClick={handleActivate}
        onContextMenu={(e) => {
          e.preventDefault()
          if (filled) onUndo()
        }}
        onPointerDown={() => {
          if (!filled) return
          longPressRef.current = setTimeout(() => onUndo(), 550)
        }}
        onPointerUp={() => {
          if (longPressRef.current) clearTimeout(longPressRef.current)
        }}
        onPointerLeave={() => {
          if (longPressRef.current) clearTimeout(longPressRef.current)
        }}
        onKeyDown={(e: ReactKeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            handleActivate()
          }
          if (e.key === "Backspace" && filled) {
            e.preventDefault()
            onUndo()
          }
        }}
      >
        {filled ? (
          text.trim() ? (
            <span className="line-clamp-2 px-1 text-center text-[11px] leading-tight text-ink">
              {text}
            </span>
          ) : (
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
          )
        ) : null}
        {rippling && !reducedMotion ? (
          <span
            data-testid="slot-ripple"
            className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-accent opacity-50"
            style={{ animation: "grounding-ripple 0.5s ease-out forwards" }}
          />
        ) : null}
      </button>
      {filled ? (
        <input
          type="text"
          value={text}
          maxLength={120}
          aria-label="What did you notice? Optional"
          placeholder="Optional"
          className="w-14 rounded-md border-0 bg-transparent text-center text-[11px] text-ink-muted placeholder:text-ink-subtle focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          onChange={(e) => onTextChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      ) : null}
      {filled && text.length > 100 ? (
        <span className="text-[10px] text-ink-subtle">{text.length}/120</span>
      ) : null}
    </div>
  )
}

function GroundingStepView({
  ctx,
  onPersistSense,
  sensePref,
}: {
  ctx: StepContext
  onPersistSense: (sense: Sense, mode: "substitute" | "default") => void
  sensePref: "default" | "substitute" | "skip"
}) {
  const reducedMotion = usePrefersReducedMotion()
  const { step, filled, entries, substituted, canAdvance } = ctx
  const usingFallback = substituted || sensePref === "substitute"
  const prompt = usingFallback ? step.fallbackPrompt : step.prompt
  const numeral = step.count

  return (
    <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col px-5 py-8">
      {!reducedMotion ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div
            className="absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-[0.06]"
            style={{
              background:
                "radial-gradient(circle, var(--color-accent-breath), transparent 70%)",
              animation: "grounding-drift 20s ease-in-out infinite",
            }}
          />
        </div>
      ) : null}

      <ProgressBars total={ctx.totalSteps} current={ctx.stepIndex} />

      <div className="relative flex flex-1 flex-col items-center justify-center gap-8">
        <AnimatePresence mode="wait">
          <motion.span
            key={numeral}
            className="pointer-events-none absolute text-7xl font-light text-accent/15"
            initial={
              reducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -12 }
            }
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: reducedMotion ? 0.15 : 0.45 }}
            aria-hidden
            data-testid="grounding-numeral"
          >
            {numeral}
          </motion.span>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={prompt}
            className="relative z-10 max-w-[34ch] text-center"
            initial={
              reducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 12 }
            }
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: reducedMotion ? 0.15 : 0.45,
              delay: reducedMotion ? 0 : 0.2,
              ease: "easeOut",
            }}
          >
            <h2 className="text-2xl font-medium leading-snug text-ink md:text-3xl">
              {prompt}
            </h2>
            {!usingFallback ? (
              <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
                {step.hint}
              </p>
            ) : null}
          </motion.div>
        </AnimatePresence>

        <div
          role="group"
          aria-label={prompt}
          className="relative z-10 flex flex-wrap justify-center gap-3"
        >
          {Array.from({ length: step.count }, (_, i) => (
            <SlotButton
              key={`${step.id}-${i}`}
              index={i}
              total={step.count}
              filled={i < filled}
              isNext={i === filled}
              text={entries[i] ?? ""}
              reducedMotion={reducedMotion}
              onFill={() => {
                if (i === filled) ctx.fillNext()
              }}
              onUndo={() => {
                if (i === filled - 1) ctx.undoLast()
              }}
              onTextChange={(v) => ctx.setEntryText(i, v)}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center gap-3">
          {filled > 0 ? (
            <button
              type="button"
              className="min-h-11 text-sm text-ink-subtle underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              onClick={ctx.undoLast}
            >
              Undo
            </button>
          ) : null}

          <button
            type="button"
            className="min-h-11 text-sm text-ink-subtle underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onClick={() => {
              if (!step.sense) return
              ctx.substitute()
              onPersistSense(step.sense, "substitute")
            }}
          >
            Nothing right now
          </button>

          {usingFallback && sensePref === "substitute" ? (
            <button
              type="button"
              className="min-h-11 text-sm text-accent underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              onClick={() => {
                if (!step.sense) return
                ctx.useOriginal()
                onPersistSense(step.sense, "default")
              }}
            >
              Use the original
            </button>
          ) : null}

          <button
            type="button"
            className="min-h-11 text-sm text-ink-subtle underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onClick={ctx.skip}
          >
            Skip this one
          </button>

          {ctx.showLookAgain ? (
            <div
              className="mt-2 max-w-sm rounded-2xl border border-hairline bg-surface px-4 py-3 text-center"
              data-testid="look-again-nudge"
            >
              <p className="text-[15px] text-ink-muted">
                That was quick. Want to look around once more?
              </p>
              <div className="mt-3 flex justify-center gap-3">
                <button
                  type="button"
                  className="min-h-11 rounded-full px-4 text-sm text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  onClick={ctx.dismissLookAgain}
                >
                  I&apos;m good
                </button>
                <button
                  type="button"
                  className="min-h-11 rounded-full bg-accent-soft px-4 text-sm font-medium text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  onClick={ctx.lookAgain}
                >
                  Let me look again
                </button>
              </div>
            </div>
          ) : null}

          <AnimatePresence>
            {canAdvance && !ctx.showLookAgain ? (
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-2 inline-flex min-h-12 min-w-[160px] items-center justify-center rounded-full bg-brand px-8 text-base font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
                onClick={ctx.goNext}
              >
                Next
              </motion.button>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export function GroundingSession({
  activity,
  backHref = "/patient/library",
}: GroundingSessionProps) {
  const prefs = useSessionStore((s) => s.prefs)
  const setGroundingSense = useSessionStore((s) => s.setGroundingSense)
  const attachGroundingEntriesToLatest = useSessionStore(
    (s) => s.attachGroundingEntriesToLatest
  )
  const deleteAllGroundingEntries = useSessionStore(
    (s) => s.deleteAllGroundingEntries
  )
  const [results, setResults] = useState<StepResult[] | null>(null)
  const [saveChoice, setSaveChoice] = useState<"pending" | "saved" | "discarded">(
    "pending"
  )

  const sensePrefs = useMemo(
    () =>
      prefs.groundingSenses ?? {
        see: "default" as const,
        feel: "default" as const,
        hear: "default" as const,
        smell: "default" as const,
        taste: "default" as const,
      },
    [prefs.groundingSenses]
  )

  const activeSteps = useMemo(
    () =>
      GROUNDING_STEPS.filter(
        (s) => s.sense && sensePrefs[s.sense] !== "skip"
      ),
    [sensePrefs]
  )

  const preSession = (
    <div className="mx-auto max-w-lg px-5 pt-10">
      <Link
        href={backHref}
        className="mb-6 inline-flex min-h-11 items-center text-sm text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Explore
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight text-ink">
        {activity.title}
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
        {activity.longDescription}
      </p>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
        Some of these won&apos;t apply to you, and that&apos;s fine — you can
        swap or skip any of them.
      </p>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-subtle">
        Anything you type stays on this device.
      </p>
    </div>
  )

  if (results) {
    const allSkipped = results.every((r) => r.skipped)
    const totalFilled = results.reduce((a, r) => a + r.filled, 0)
    const anyFilled = totalFilled > 0

    return (
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col items-center justify-center px-5 py-10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">
          {allSkipped
            ? "Sometimes it's not the right tool. That's useful to know too."
            : totalFilled >= 15
              ? "You found fifteen things."
              : "You did what you could with this one."}
        </h1>
        {!allSkipped ? (
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-ink-muted">
            Notice how you feel now compared to a few minutes ago.
          </p>
        ) : null}

        {anyFilled && saveChoice === "pending" ? (
          <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
            <p className="text-sm text-ink-subtle">
              Keep what you wrote on this device?
            </p>
            <button
              type="button"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-hairline bg-surface text-sm font-medium text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              onClick={() => {
                const entries = results.flatMap((r) =>
                  r.entries
                    .filter(Boolean)
                    .filter(() => !!r.sense)
                    .map((text) => ({ sense: r.sense!, text }))
                )
                attachGroundingEntriesToLatest(entries)
                setSaveChoice("saved")
              }}
            >
              Save these
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center text-sm text-ink-subtle underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              onClick={() => setSaveChoice("discarded")}
            >
              Don&apos;t save
            </button>
          </div>
        ) : null}

        {saveChoice === "saved" ? (
          <button
            type="button"
            className="mt-4 min-h-11 text-sm text-ink-subtle underline-offset-2 hover:underline"
            onClick={() => deleteAllGroundingEntries()}
          >
            Delete all grounding entries
          </button>
        ) : null}

        <div className="mt-10 flex w-full max-w-sm flex-col gap-3">
          <Link
            href={backHref}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-8 text-base font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Done
          </Link>
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-hairline bg-surface text-sm font-medium text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onClick={() => {
              setResults(null)
              setSaveChoice("pending")
            }}
          >
            Go again
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes grounding-pulse {
          0%, 100% { border-color: color-mix(in srgb, var(--color-hairline) 100%, transparent); opacity: 0.4; }
          50% { border-color: var(--color-accent); opacity: 0.8; }
        }
        @keyframes grounding-ripple {
          from { transform: scale(1); opacity: 0.5; }
          to { transform: scale(1.45); opacity: 0; }
        }
        @keyframes grounding-drift {
          0%, 100% { transform: translate(-50%, -10%) scale(1); }
          50% { transform: translate(-45%, -5%) scale(1.05); }
        }
      `}</style>
      <SteppedSession
        key={activeSteps.map((s) => s.id).join("-")}
        activity={activity}
        steps={activeSteps}
        sessionSlug={SLUG}
        backHref={backHref}
        preSession={preSession}
        onComplete={(r) => setResults(r)}
        renderStep={(ctx) => (
          <GroundingStepView
            ctx={ctx}
            sensePref={
              ctx.step.sense
                ? sensePrefs[ctx.step.sense]
                : "default"
            }
            onPersistSense={(sense, mode) => setGroundingSense(sense, mode)}
          />
        )}
      />
    </>
  )
}
