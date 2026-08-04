"use client"

import { AnimatePresence, motion, useTransform } from "framer-motion"
import type { BreathingEngineState } from "../hooks/usePacedTimeline"
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion"

interface BellyBreathingFigureProps {
  engine: BreathingEngineState
}

/**
 * Soft seated silhouette. Only the belly group scales on the breath;
 * chest hand stays still — that stillness is the instruction.
 */
export function BellyBreathingFigure({ engine }: BellyBreathingFigureProps) {
  const reducedMotion = usePrefersReducedMotion()
  const kind = engine.phaseSpec.kind
  const showLabels = reducedMotion || engine.cycle <= 3

  // Map phase progress to belly excursion with continuous feel across phases
  const bellyScale = useTransform(engine.phaseProgressMv, (p) => {
    if (reducedMotion) return 1
    if (kind === "inhale") return 1 + p * 0.18
    // exhale: 1.18 → 1.0
    return 1.18 - p * 0.18
  })

  const handX = useTransform(bellyScale, [1, 1.18], [0, 14])
  const glowOpacity = useTransform(bellyScale, [1, 1.18], [0.15, 0.45])
  const glowScale = useTransform(bellyScale, [1, 1.18], [1, 1.25])

  const inhaleSec = engine.phaseSpec.kind === "inhale" ? engine.phaseSpec.seconds : 4
  const exhaleSec =
    engine.phaseSpec.kind === "exhale" ? engine.phaseSpec.seconds : 6
  const phaseText =
    kind === "inhale"
      ? "Breathe in — let your belly rise"
      : "Breathe out — slowly"

  return (
    <div className="relative mx-auto flex w-full max-w-[320px] flex-col items-center">
      {!reducedMotion && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[42%] h-28 w-28 -translate-x-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--color-accent-breath) 35%, transparent), transparent 70%)",
            filter: "blur(40px)",
            willChange: "transform",
            opacity: glowOpacity,
            scale: glowScale,
          }}
        />
      )}

      <svg
        viewBox="0 0 320 360"
        className="relative h-auto w-full"
        aria-hidden="true"
      >
        {/* Static head + shoulders + chest */}
        <path
          d="M160 36
             C140 36 128 52 128 72
             C128 92 140 108 160 108
             C180 108 192 92 192 72
             C192 52 180 36 160 36
             Z
             M118 118
             C118 118 100 130 96 168
             L96 210
             L224 210
             L224 168
             C220 130 202 118 202 118
             C190 112 170 110 160 110
             C150 110 130 112 118 118
             Z"
          className="fill-surface stroke-hairline"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* Belly — only this region scales from the spine (left) */}
        <motion.g
          style={{
            scaleX: reducedMotion ? 1 : bellyScale,
            transformOrigin: "110px 250px",
            willChange: "transform",
          }}
        >
          <path
            d="M96 210
               C96 210 90 250 100 288
               C110 310 140 318 160 318
               C180 318 210 310 220 288
               C230 250 224 210 224 210
               Z"
            className="fill-surface stroke-hairline"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        </motion.g>

        {/* Hips / seat — static */}
        <path
          d="M100 288
             C110 320 130 340 160 342
             C190 340 210 320 220 288
             C210 300 180 308 160 308
             C140 308 110 300 100 288
             Z"
          className="fill-surface stroke-hairline"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* Chest hand — never moves */}
        <rect
          x={148}
          y={150}
          width={36}
          height={22}
          rx={8}
          fill="var(--color-ink)"
          opacity={0.2}
        />

        {/* Belly hand — tracks excursion */}
        <motion.rect
          x={148}
          y={248}
          width={36}
          height={22}
          rx={8}
          fill="var(--color-accent-breath)"
          style={{ x: handX, opacity: 0.35 }}
        />

        <AnimatePresence>
          {showLabels ? (
            <>
              <motion.text
                key="still"
                x={196}
                y={164}
                className="fill-ink-subtle text-[11px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                data-testid="hand-label-still"
              >
                still
              </motion.text>
              <motion.text
                key="rises"
                x={196}
                y={262}
                className="fill-ink-subtle text-[11px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                data-testid="hand-label-rises"
              >
                rises
              </motion.text>
            </>
          ) : null}
        </AnimatePresence>
      </svg>

      {reducedMotion ? (
        <div
          className="mt-3 flex w-full max-w-[200px] items-center gap-1"
          data-testid="belly-proportion-bar"
          aria-hidden
        >
          <div
            className="h-1.5 rounded-full bg-accent"
            style={{ flex: inhaleSec }}
            title={`${inhaleSec}s in`}
          />
          <div
            className="h-1.5 rounded-full bg-hairline"
            style={{ flex: exhaleSec }}
            title={`${exhaleSec}s out`}
          />
        </div>
      ) : null}

      <AnimatePresence mode="wait">
        <motion.p
          key={phaseText}
          className="mt-4 text-center text-[15px] leading-relaxed text-ink-muted"
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -4, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {phaseText}
        </motion.p>
      </AnimatePresence>

      <motion.span
        key={engine.phaseRemaining}
        className="mt-2 text-4xl font-semibold tabular-nums tracking-tight text-ink"
        initial={{ scale: 1.1, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 360, damping: 22 }}
      >
        {engine.phaseRemaining}
      </motion.span>
    </div>
  )
}
