"use client"

import { motion } from "framer-motion"
import { useMemo } from "react"
import type { BreathPhase } from "@/utils/box-breathing/types"

const PARTICLE_COUNT = 12
const REF = 400

interface ParticleFieldProps {
  phase: BreathPhase
  phaseDurationSec: number
  reducedMotion: boolean
}

/** Small ambient dots that drift outward on inhale and inward on exhale, echoing the square's motion. */
export default function ParticleField({ phase, phaseDurationSec, reducedMotion }: ParticleFieldProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        angle: (i / PARTICLE_COUNT) * Math.PI * 2,
        jitter: (i % 3) * 0.08,
      })),
    []
  )

  if (reducedMotion) return null

  const expanded = phase === "inhale" || phase === "hold1"
  const inner = REF * 0.28
  const outer = REF * 0.48
  const center = REF / 2

  return (
    <svg viewBox={`0 0 ${REF} ${REF}`} width="100%" height="100%" className="pointer-events-none absolute inset-0" aria-hidden>
      {particles.map((p, i) => {
        const radius = expanded ? outer * (1 + p.jitter) : inner * (1 - p.jitter * 0.5)
        const cx = center + Math.cos(p.angle) * radius
        const cy = center + Math.sin(p.angle) * radius
        return (
          <motion.circle
            key={i}
            r={3.5}
            fill="rgba(255,255,255,0.75)"
            animate={{ cx, cy, opacity: expanded ? [0.3, 0.9, 0.6] : [0.6, 0.3, 0.15] }}
            transition={{
              cx: { duration: phaseDurationSec, ease: [0.45, 0, 0.2, 1] },
              cy: { duration: phaseDurationSec, ease: [0.45, 0, 0.2, 1] },
              opacity: { duration: phaseDurationSec, ease: "easeInOut" },
            }}
            style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.6))" }}
          />
        )
      })}
    </svg>
  )
}
