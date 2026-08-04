"use client"

import { AnimatePresence, motion, useTransform } from "framer-motion"
import type { BreathingEngineState } from "../hooks/usePacedTimeline"
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion"
import { ExhaleWisps } from "./ExhaleWisps"

interface SighVisualizerProps {
  engine: BreathingEngineState
  totalCycles: number
}

/**
 * Two-step rise + long fall. Column fill (scaleY) makes the top-up sip legible.
 */
export function SighVisualizer({ engine, totalCycles }: SighVisualizerProps) {
  const reducedMotion = usePrefersReducedMotion()
  const phaseId = String(engine.phase)
  const kind = engine.phaseSpec.kind

  const columnScale = useTransform(engine.phaseProgressMv, (p) => {
    if (phaseId === "inhale") return p * 0.72
    if (phaseId === "inhale-2") return 0.72 + p * 0.28
    // exhale
    return 1 - p
  })

  const orbScale = useTransform(engine.phaseProgressMv, (p) => {
    if (reducedMotion) return 1
    if (phaseId === "inhale") return 0.7 + p * 0.22
    if (phaseId === "inhale-2") return 0.92 + p * 0.14
    return 1.06 - p * 0.36
  })

  const label =
    phaseId === "inhale-2"
      ? "…and again"
      : phaseId === "exhale"
        ? "Out, slowly"
        : "In…"

  const showWisps = !reducedMotion && kind === "exhale"
  const showPulse = !reducedMotion && phaseId === "inhale-2"

  return (
    <div className="relative mx-auto flex w-full max-w-[320px] flex-col items-center">
      <div className="relative flex w-full items-center justify-center gap-6">
        {/* Lung volume column */}
        <div
          className="relative h-[220px] w-6 overflow-hidden rounded-full bg-hairline"
          data-testid="sigh-volume-column"
          aria-hidden
        >
          {reducedMotion ? (
            <>
              <div
                className="absolute inset-x-0 bottom-0 rounded-full bg-accent"
                style={{ height: "72%" }}
                data-testid="sigh-notch-72"
              />
              <div
                className="absolute inset-x-0 top-0 h-px bg-ink-subtle"
                style={{ top: "0%" }}
                data-testid="sigh-notch-100"
              />
              <div
                className="absolute inset-x-0 h-px bg-ink-subtle"
                style={{ bottom: "72%" }}
              />
            </>
          ) : (
            <motion.div
              className="absolute inset-x-0 bottom-0 origin-bottom rounded-full bg-accent"
              style={{
                height: "100%",
                scaleY: columnScale,
                willChange: "transform",
              }}
            />
          )}
        </div>

        <div className="relative h-[220px] w-[220px]">
          {!reducedMotion && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-[10%] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, color-mix(in srgb, var(--color-accent-breath) 25%, transparent) 0%, var(--color-accent-soft) 45%, transparent 70%)",
                filter: "blur(48px)",
                willChange: "transform",
                scale: orbScale,
              }}
            />
          )}

          <ExhaleWisps active={showWisps} cycle={engine.cycle} count={5} />

          <AnimatePresence>
            {showPulse ? (
              <motion.div
                key={`pulse-${engine.cycle}`}
                data-testid="sigh-topup-pulse"
                aria-hidden
                className="pointer-events-none absolute inset-[18%] rounded-full border-2 border-accent"
                initial={{ scale: 0.9, opacity: 0.55 }}
                animate={{ scale: 1.35, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              />
            ) : null}
          </AnimatePresence>

          <svg
            viewBox="0 0 320 320"
            className="relative h-full w-full"
            aria-hidden="true"
          >
            <motion.circle
              cx={160}
              cy={160}
              r={72}
              fill="url(#sighOrbGrad)"
              style={{
                scale: reducedMotion ? 1 : orbScale,
                transformOrigin: "160px 160px",
                willChange: "transform",
              }}
            />
            <defs>
              <radialGradient id="sighOrbGrad" cx="40%" cy="35%" r="65%">
                <stop
                  offset="0%"
                  stopColor="var(--color-accent-breath)"
                  stopOpacity="0.55"
                />
                <stop
                  offset="55%"
                  stopColor="var(--color-accent-soft)"
                  stopOpacity="0.9"
                />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={label}
          className="mt-6 text-center text-2xl font-medium text-ink"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
        >
          {label}
        </motion.p>
      </AnimatePresence>

      <p className="mt-2 max-w-xs text-center text-[13px] leading-relaxed text-ink-subtle">
        Two breaths in through your nose, one long breath out through your
        mouth.
      </p>

      <div
        className="mt-6 flex items-center gap-2"
        role="img"
        aria-label={`Cycle ${engine.cycle} of ${totalCycles}`}
        data-testid="sigh-cycle-dots"
      >
        {Array.from({ length: totalCycles }, (_, i) => {
          const filled = i < engine.cyclesCompleted
          const current = i === engine.cycle - 1 && engine.status === "running"
          return (
            <span
              key={i}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                filled || current ? "bg-accent" : "bg-hairline"
              }`}
            />
          )
        })}
      </div>
    </div>
  )
}
