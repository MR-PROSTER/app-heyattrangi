"use client"

import { AnimatePresence, motion } from "framer-motion"
import { PHASE_META } from "@/utils/box-breathing/breathingEngine"
import type { BreathPhase } from "@/utils/box-breathing/types"

interface InstructionTextProps {
  phase: BreathPhase
  reducedMotion: boolean
}

export default function InstructionText({ phase, reducedMotion }: InstructionTextProps) {
  return (
    <div className="relative flex h-12 items-center justify-center sm:h-14">
      <AnimatePresence mode="wait">
        <motion.h2
          key={phase}
          initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reducedMotion ? 0 : -12 }}
          transition={{ duration: reducedMotion ? 0.15 : 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center text-3xl font-light tracking-wide text-white sm:text-4xl md:text-5xl"
        >
          {PHASE_META[phase].instruction}
        </motion.h2>
      </AnimatePresence>
    </div>
  )
}
