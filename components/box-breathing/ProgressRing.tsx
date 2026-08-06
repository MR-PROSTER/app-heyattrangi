"use client"

import { motion } from "framer-motion"
import type { BreathPhase } from "@/utils/box-breathing/types"

const COLOR_BY_PHASE: Record<BreathPhase, string> = {
  inhale: "#60a5fa",
  hold1: "#818cf8",
  exhale: "#2dd4bf",
  hold2: "#38bdf8",
}

const REF = 400
const STROKE = 6

interface ProgressRingProps {
  phase: BreathPhase
  phaseDurationSec: number
  cycle: number
  totalCycles: number
  reducedMotion: boolean
}

/** SVG ring around the breathing square: outer thin ring = overall session progress, inner bold ring = current phase countdown. */
export default function ProgressRing({ phase, phaseDurationSec, cycle, totalCycles, reducedMotion }: ProgressRingProps) {
  const center = REF / 2
  const innerRadius = center - STROKE * 2
  const outerRadius = innerRadius + STROKE * 1.4
  const innerCircumference = 2 * Math.PI * innerRadius
  const outerCircumference = 2 * Math.PI * outerRadius
  const overallProgress = Math.min(1, (cycle - 1) / totalCycles)

  return (
    <svg viewBox={`0 0 ${REF} ${REF}`} width="100%" height="100%" className="absolute inset-0 -rotate-90" aria-hidden>
      <circle cx={center} cy={center} r={innerRadius} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={STROKE} />
      <circle
        cx={center}
        cy={center}
        r={outerRadius}
        fill="none"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth={STROKE / 2.5}
        strokeDasharray={outerCircumference}
        strokeDashoffset={outerCircumference * (1 - overallProgress)}
        strokeLinecap="round"
      />
      <motion.circle
        key={`${phase}-${cycle}`}
        cx={center}
        cy={center}
        r={innerRadius}
        fill="none"
        stroke={COLOR_BY_PHASE[phase]}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={innerCircumference}
        initial={{ strokeDashoffset: innerCircumference }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: reducedMotion ? 0.4 : phaseDurationSec, ease: "linear" }}
        style={{ filter: `drop-shadow(0 0 6px ${COLOR_BY_PHASE[phase]})` }}
      />
    </svg>
  )
}
