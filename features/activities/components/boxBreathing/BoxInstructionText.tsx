"use client"

import { AnimatePresence, motion } from "framer-motion"
import type { BreathingEngineState } from "../../hooks/usePacedTimeline"
import type { Phase } from "../../types"

const COPY: Record<Phase, string> = {
  inhale: "Breathe In",
  "hold-in": "Hold",
  exhale: "Exhale Slowly",
  "hold-out": "Hold",
}

interface BoxInstructionTextProps {
  engine: BreathingEngineState
}

/** Large phase instruction + countdown below the breathing square. */
export function BoxInstructionText({ engine }: BoxInstructionTextProps) {
  const phase = engine.phase as Phase
  const label = COPY[phase] ?? engine.phaseSpec.label

  return (
    <div
      className="flex w-full max-w-sm flex-col items-center gap-2 text-center"
      aria-live="polite"
      data-testid="box-instruction"
    >
      <AnimatePresence mode="wait">
        <motion.p
          key={label}
          className="text-3xl font-semibold tracking-tight text-ink md:text-4xl"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {label}
        </motion.p>
      </AnimatePresence>
      <motion.p
        key={engine.phaseRemaining}
        className="text-5xl font-semibold tabular-nums tracking-tight text-ink"
        initial={{ scale: 1.12, opacity: 0.75 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 22 }}
        aria-label={`${engine.phaseRemaining} seconds remaining`}
      >
        {engine.phaseRemaining}
      </motion.p>
    </div>
  )
}
