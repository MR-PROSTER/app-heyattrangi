"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import type { BreathingTechniqueConfig } from "@/data/activities/breathingConfigs"

interface BreathingEngineProps {
  config: BreathingTechniqueConfig
  isPaused: boolean
}

export default function BreathingEngine({
  config,
  isPaused,
}: BreathingEngineProps) {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const phase = config.phases[phaseIndex] ?? config.phases[0]
  const [secondsLeft, setSecondsLeft] = useState(phase.seconds)

  useEffect(() => {
    setSecondsLeft(phase.seconds)
  }, [phaseIndex, phase.seconds])

  useEffect(() => {
    if (isPaused) return

    const id = window.setTimeout(() => {
      if (secondsLeft <= 1) {
        setPhaseIndex((i) => (i + 1) % config.phases.length)
      } else {
        setSecondsLeft((s) => s - 1)
      }
    }, 1000)

    return () => window.clearTimeout(id)
  }, [isPaused, secondsLeft, phaseIndex, config.phases.length])

  const displayCount = Math.max(1, secondsLeft)
  const ariaPhase = useMemo(
    () =>
      `${phase.label}, ${displayCount} ${
        displayCount === 1 ? "second" : "seconds"
      } remaining`,
    [phase.label, displayCount]
  )

  return (
    <div
      className="flex flex-col items-center text-center gap-8 w-full max-w-sm"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={ariaPhase}
    >
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full bg-orange-200/35"
          animate={{
            scale: phase.scale * 0.95,
            opacity: isPaused ? 0.5 : 0.7,
          }}
          transition={{
            duration: isPaused ? 0 : Math.max(phase.seconds * 0.9, 0.6),
            ease: "easeInOut",
          }}
          aria-hidden
        />
        <motion.div
          className="absolute inset-3 rounded-full bg-gradient-to-br from-orange-300/55 to-amber-200/40 border border-orange-200/70 shadow-[0_12px_40px_rgba(249,115,22,0.15)]"
          animate={{
            scale: phase.scale,
            opacity: isPaused ? 0.75 : 1,
          }}
          transition={{
            duration: isPaused ? 0 : Math.max(phase.seconds * 0.9, 0.6),
            ease: "easeInOut",
          }}
          aria-hidden
        />
        <div className="relative z-10 flex flex-col items-center justify-center">
          <span className="text-5xl sm:text-6xl font-extrabold tabular-nums text-slate-800 tracking-tight">
            {displayCount}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[13px] font-bold uppercase tracking-widest text-slate-400">
          Current phase
        </p>
        <h2 className="font-extrabold text-2xl sm:text-3xl text-slate-800 tracking-tight">
          {phase.label}
        </h2>
        {isPaused && (
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest pt-1">
            Paused
          </p>
        )}
      </div>
    </div>
  )
}
