"use client"

import { motion } from "framer-motion"
import type { AnimationIntensity, BreathPhase } from "@/utils/box-breathing/types"

const BRIGHTNESS_BY_PHASE: Record<BreathPhase, number> = {
  inhale: 1,
  hold1: 1,
  exhale: 0.7,
  hold2: 0.7,
}

const SPEED_MULTIPLIER: Record<AnimationIntensity, number> = {
  calm: 1.6,
  normal: 1,
  lively: 0.65,
}

interface AmbientBackgroundProps {
  phase: BreathPhase
  phaseDurationSec: number
  reducedMotion: boolean
  intensity: AnimationIntensity
}

export default function AmbientBackground({ phase, phaseDurationSec, reducedMotion, intensity }: AmbientBackgroundProps) {
  const brightness = BRIGHTNESS_BY_PHASE[phase]
  const speed = SPEED_MULTIPLIER[intensity]

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#070b16]">
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 25%, rgba(56,189,248,0.35), transparent 55%), radial-gradient(circle at 80% 20%, rgba(129,140,248,0.3), transparent 50%), radial-gradient(circle at 50% 85%, rgba(45,212,191,0.3), transparent 55%)",
        }}
        animate={{ opacity: brightness }}
        transition={{ duration: reducedMotion ? 0.4 : phaseDurationSec, ease: "easeInOut" }}
      />

      {!reducedMotion && (
        <>
          <BlurOrb className="left-[-10%] top-[-10%] h-[45vmax] w-[45vmax] bg-sky-500/25" duration={26 * speed} />
          <BlurOrb className="right-[-15%] top-[10%] h-[38vmax] w-[38vmax] bg-indigo-500/20" duration={32 * speed} delay={2} />
          <BlurOrb className="bottom-[-15%] left-[20%] h-[42vmax] w-[42vmax] bg-teal-400/20" duration={30 * speed} delay={4} />
        </>
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />
    </div>
  )
}

function BlurOrb({ className, duration, delay = 0 }: { className: string; duration: number; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl ${className}`}
      animate={{
        x: [0, 40, -20, 0],
        y: [0, -30, 20, 0],
        scale: [1, 1.08, 0.96, 1],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  )
}
