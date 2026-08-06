"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { SubtleConfetti } from "./boxBreathing/SubtleConfetti"
import { formatDuration, formatMinutesApprox } from "../lib/formatDuration"

interface SessionCompleteCardProps {
  plannedCycles: number
  cyclesCompleted: number
  durationMs: number
  completedFully: boolean
  endedEarly?: boolean
  headlineOverride?: string
  encouragement?: string
  celebration?: boolean
  onDone: () => void
  onAgain: () => void
  onSaveMood?: (mood: 1 | 2 | 3 | 4 | 5 | undefined) => void
}

const MOODS: { value: 1 | 2 | 3 | 4 | 5; label: string }[] = [
  { value: 1, label: "Heavy" },
  { value: 2, label: "Low" },
  { value: 3, label: "Okay" },
  { value: 4, label: "Light" },
  { value: 5, label: "Steady" },
]

export function SessionCompleteCard({
  plannedCycles,
  cyclesCompleted,
  durationMs,
  completedFully,
  endedEarly,
  headlineOverride,
  encouragement,
  celebration = false,
  onDone,
  onAgain,
  onSaveMood,
}: SessionCompleteCardProps) {
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5 | undefined>()

  const headline =
    headlineOverride ??
    (endedEarly
      ? "Good call. Stopping when your body says so is the whole skill."
      : completedFully
        ? `That's ${formatMinutesApprox(durationMs)} for you.`
        : `You did ${cyclesCompleted} of ${plannedCycles} cycles. That counts.`)

  const avgPaceSec =
    cyclesCompleted > 0
      ? Math.round(durationMs / cyclesCompleted / 1000)
      : null

  return (
    <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col items-center justify-center px-5 py-10 text-center">
      {celebration ? <SubtleConfetti /> : null}
      <motion.div
        className="mb-6 grid h-16 w-16 place-items-center rounded-full bg-accent-soft text-accent"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 18 }}
        aria-hidden
      >
        <Check className="h-8 w-8" strokeWidth={2.5} />
      </motion.div>

      <h1 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">
        {headline}
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
        {formatDuration(durationMs)} · {cyclesCompleted}{" "}
        {cyclesCompleted === 1 ? "cycle" : "cycles"}
        {avgPaceSec != null ? ` · ~${avgPaceSec}s average pace` : null}
      </p>
      {encouragement ? (
        <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-ink-muted">
          {encouragement}
        </p>
      ) : null}

      <fieldset className="mt-10 w-full">
        <legend className="mb-4 text-sm font-semibold text-ink">
          How do you feel?{" "}
          <span className="font-normal text-ink-subtle">(optional)</span>
        </legend>
        <div className="flex flex-wrap justify-center gap-2">
          {MOODS.map((m) => {
            const selected = mood === m.value
            return (
              <button
                key={m.value}
                type="button"
                className={`min-h-11 min-w-11 rounded-full border px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${
                  selected
                    ? "border-accent bg-accent-soft text-ink"
                    : "border-hairline bg-surface text-ink-muted"
                }`}
                aria-pressed={selected}
                aria-label={m.label}
                onClick={() => setMood(selected ? undefined : m.value)}
              >
                {m.label}
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="mt-10 flex w-full max-w-sm flex-col gap-3">
        <button
          type="button"
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-brand px-8 text-base font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          onClick={() => {
            onSaveMood?.(mood)
            onDone()
          }}
        >
          Done
        </button>
        <button
          type="button"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-hairline bg-surface px-8 text-sm font-medium text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          onClick={() => {
            onSaveMood?.(mood)
            onAgain()
          }}
        >
          Go again
        </button>
      </div>
    </div>
  )
}
