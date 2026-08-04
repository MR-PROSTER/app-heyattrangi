"use client"

import { useState } from "react"
import { motion } from "framer-motion"

const STEPS = [
  {
    id: "comfortable",
    title: "Get comfortable",
    body: "Sit back or lie down. Let your shoulders drop.",
  },
  {
    id: "hands",
    title: "One hand on your chest, one on your belly",
    body: "Your hands are how you'll feel this working.",
  },
  {
    id: "only-belly",
    title: "Breathe so only the bottom hand moves",
    body: "The top hand staying still is the whole exercise. That's it.",
  },
] as const

interface BellyTeachingStepProps {
  onComplete: () => void
  collapsed: boolean
  onExpand: () => void
  reducedMotion?: boolean
  inhaleSec?: number
  exhaleSec?: number
}

export function BellyTeachingStep({
  onComplete,
  collapsed,
  onExpand,
  reducedMotion = false,
  inhaleSec = 4,
  exhaleSec = 6,
}: BellyTeachingStepProps) {
  const [step, setStep] = useState(0)

  if (collapsed) {
    return (
      <div className="mb-6 rounded-2xl border border-hairline bg-surface px-4 py-3">
        <p className="text-[15px] leading-relaxed text-ink-muted">
          Hand on belly, hand on chest — you know the drill.{" "}
          <button
            type="button"
            className="text-accent underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
            onClick={onExpand}
          >
            Show me again
          </button>
        </p>
      </div>
    )
  }

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <section
      aria-labelledby="belly-teach-title"
      className="mb-6 rounded-2xl border border-hairline bg-surface p-5 shadow-[0_1px_3px_rgba(20,33,61,0.06),0_8px_24px_-12px_rgba(20,33,61,0.10)]"
    >
      <p className="mb-3 text-xs font-medium text-ink-subtle">
        Step {step + 1} of {STEPS.length}
      </p>
      <h2
        id="belly-teach-title"
        className="text-lg font-semibold tracking-tight text-ink"
        aria-current="step"
      >
        {current.title}
      </h2>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
        {current.body}
      </p>

      {step === 1 ? (
        <div className="relative mx-auto mt-4 h-24 w-40" aria-hidden>
          <motion.div
            className="absolute left-1/2 top-4 h-5 w-9 -translate-x-1/2 rounded-lg bg-ink/20"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          />
          <motion.div
            className="absolute left-1/2 top-14 h-5 w-9 -translate-x-1/2 rounded-lg bg-accent/35"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          />
        </div>
      ) : null}

      {step === 2 ? (
        reducedMotion ? (
          <div className="mt-4" data-testid="teach-proportion-bar">
            <p className="mb-2 text-sm text-ink-muted">
              In for {inhaleSec}, out for {exhaleSec} — only the belly moves.
            </p>
            <div className="flex w-full max-w-[200px] gap-1">
              <div
                className="h-1.5 rounded-full bg-accent"
                style={{ flex: inhaleSec }}
              />
              <div
                className="h-1.5 rounded-full bg-hairline"
                style={{ flex: exhaleSec }}
              />
            </div>
          </div>
        ) : (
          <motion.div
            className="mx-auto mt-4 h-16 w-16 rounded-full bg-accent-soft"
            animate={{ scaleX: [1, 1.18, 1] }}
            transition={{
              duration: inhaleSec + exhaleSec,
              times: [0, inhaleSec / (inhaleSec + exhaleSec), 1],
              ease: ["easeOut", "easeInOut"],
              repeat: Infinity,
            }}
            aria-hidden
          />
        )
      ) : null}

      <button
        type="button"
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-accent-soft px-5 text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        onClick={() => {
          if (isLast) onComplete()
          else setStep((s) => s + 1)
        }}
      >
        {isLast ? "Ready" : "Next"}
      </button>
    </section>
  )
}

export const BELLY_COACH_LINES = [
  "Only the bottom hand moves.",
  "Let the out-breath take its time.",
  "Shoulders soft.",
  "Nothing to force — just let it happen.",
  "If your mind wandered, that's fine. Come back.",
] as const
