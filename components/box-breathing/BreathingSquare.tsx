"use client"

import { motion } from "framer-motion"
import type { BreathPhase } from "@/utils/box-breathing/types"

const SCALE_BY_PHASE: Record<BreathPhase, number> = { inhale: 1.25, hold1: 1.25, exhale: 1, hold2: 1 }
const RADIUS_BY_PHASE: Record<BreathPhase, string> = { inhale: "38%", hold1: "42%", exhale: "26%", hold2: "22%" }
const GLOW_BY_PHASE: Record<BreathPhase, number> = { inhale: 0.95, hold1: 1, exhale: 0.45, hold2: 0.3 }

interface BreathingSquareProps {
  phase: BreathPhase
  phaseDurationSec: number
  reducedMotion: boolean
}

/** The centerpiece shape: expands on inhale, holds, contracts on exhale, holds — always exactly phaseDurationSec long. */
export default function BreathingSquare({ phase, phaseDurationSec, reducedMotion }: BreathingSquareProps) {
  const scale = SCALE_BY_PHASE[phase]
  const borderRadius = RADIUS_BY_PHASE[phase]
  const glow = GLOW_BY_PHASE[phase]
  const isHold = phase === "hold1" || phase === "hold2"
  const duration = reducedMotion ? 0.6 : phaseDurationSec
  const ease: [number, number, number, number] = [0.45, 0, 0.2, 1]

  return (
    <>
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(96,165,250,0.55) 0%, rgba(129,140,248,0.25) 45%, rgba(45,212,191,0) 70%)",
          filter: "blur(40px)",
        }}
        animate={{ opacity: glow, scale: reducedMotion ? 1 : scale * 1.08 }}
        transition={{ duration, ease }}
      />
      <motion.div
        className="relative flex items-center justify-center overflow-hidden border border-white/30 bg-gradient-to-br from-sky-400/30 via-indigo-400/20 to-teal-300/30 shadow-[0_0_60px_rgba(99,179,237,0.35)] backdrop-blur-xl"
        style={{ width: "58%", height: "58%" }}
        animate={{ scale: reducedMotion ? 1 : scale, borderRadius }}
        transition={{ duration, ease }}
      >
        <motion.div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0))" }}
          animate={isHold && !reducedMotion ? { opacity: [0.5, 0.85, 0.5] } : { opacity: 0.5 }}
          transition={isHold && !reducedMotion ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
        />
      </motion.div>
    </>
  )
}
