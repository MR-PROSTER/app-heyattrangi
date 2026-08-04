"use client"

import { useEffect, useMemo, useRef } from "react"
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion"
import type { BreathingEngineState } from "../hooks/usePacedTimeline"
import { PATTERN_478 } from "../data/patterns"
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion"

const VIEW = 320
const CX = 160
const CY = 160
const R = 120
const C = 2 * Math.PI * R
const GAP_PX = 6

interface ArcSeg {
  kind: "inhale" | "hold" | "exhale"
  seconds: number
  startFrac: number
  lengthFrac: number
  labelAngle: number
}

function buildArcs(): ArcSeg[] {
  const total = PATTERN_478.cycleSeconds
  const phases = PATTERN_478.phases
  const usable = C - GAP_PX * phases.length
  let cursor = 0
  return phases.map((p) => {
    const lengthFrac = (p.seconds / total) * (usable / C)
    const gapFrac = GAP_PX / C
    const startFrac = cursor
    const midFrac = startFrac + lengthFrac / 2
    const labelAngle = -Math.PI / 2 + midFrac * 2 * Math.PI
    cursor += lengthFrac + gapFrac
    return {
      kind: p.kind,
      seconds: p.seconds,
      startFrac,
      lengthFrac,
      labelAngle,
    }
  })
}

function polar(angle: number, radius: number) {
  return {
    x: CX + radius * Math.cos(angle),
    y: CY + radius * Math.sin(angle),
  }
}

interface BreathingRingProps {
  engine: BreathingEngineState
}

export function BreathingRing({ engine }: BreathingRingProps) {
  const reducedMotion = usePrefersReducedMotion()
  const arcs = useMemo(() => buildArcs(), [])
  const pathRef = useRef<SVGPathElement>(null)
  const pathLenRef = useRef(C)
  const cx = useMotionValue(CX)
  const cy = useMotionValue(CY - R)
  const trailLength = useMotionValue(0)
  const trailOpacity = useMotionValue(0.6)
  const dotOpacity = useMotionValue(reducedMotion ? 0.7 : 1)
  const lastCycleRef = useRef(engine.cycle)
  const kind = engine.phaseSpec.kind
  const showWisps = !reducedMotion && kind === "exhale"

  const fullCircle = useMemo(
    () =>
      `M ${CX} ${CY - R} a ${R} ${R} 0 1 1 0 ${R * 2} a ${R} ${R} 0 1 1 0 ${-R * 2}`,
    []
  )

  useEffect(() => {
    const el = pathRef.current
    if (!el || typeof el.getTotalLength !== "function") return
    try {
      pathLenRef.current = el.getTotalLength() || C
    } catch {
      pathLenRef.current = C
    }
  }, [fullCircle])

  useMotionValueEvent(engine.cycleProgressMv, "change", (v) => {
    const el = pathRef.current
    if (!el || typeof el.getPointAtLength !== "function") {
      trailLength.set(Math.min(1, Math.max(0, v)))
      return
    }
    try {
      const len = pathLenRef.current || el.getTotalLength() || C
      const dist = Math.min(0.9999, Math.max(0, v)) * len
      const pt = el.getPointAtLength(dist)
      cx.set(pt.x)
      cy.set(pt.y)
      trailLength.set(Math.min(1, Math.max(0, v)))
    } catch {
      trailLength.set(Math.min(1, Math.max(0, v)))
    }
  })

  useEffect(() => {
    if (engine.cycle === lastCycleRef.current) return
    lastCycleRef.current = engine.cycle
    trailOpacity.set(0)
    dotOpacity.set(0)
    const t = window.setTimeout(() => {
      trailLength.set(0)
      trailOpacity.set(0.6)
      dotOpacity.set(reducedMotion ? 0.7 : 1)
    }, 250)
    return () => clearTimeout(t)
  }, [engine.cycle, trailLength, trailOpacity, dotOpacity, reducedMotion])

  const orbScale = kind === "exhale" ? 0.85 : 1
  const orbScaleFrom = kind === "inhale" ? 0.85 : 1
  const orbDuration = kind === "inhale" ? 4 : kind === "exhale" ? 8 : 7

  return (
    <div
      className="relative mx-auto grid place-items-center"
      style={{
        width: "clamp(200px, 58vw, 320px)",
        height: "clamp(200px, 58vw, 320px)",
      }}
    >
      {!reducedMotion && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-[18%] rounded-full"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--color-accent-breath) 20%, transparent) 0%, var(--color-accent-soft) 45%, transparent 70%)",
            filter: "blur(48px)",
            willChange: "transform",
          }}
          animate={{
            scale: kind === "inhale" || kind === "hold" ? 1.4 : 1,
            opacity: kind === "exhale" ? 0.35 : 0.55,
          }}
          transition={{
            duration: kind === "exhale" ? 8 : 4,
            ease: kind === "exhale" ? [0.4, 0, 0.5, 1] : [0.34, 0.8, 0.4, 1],
          }}
        />
      )}

      <AnimatePresence>
        {showWisps
          ? [0, 1, 2, 3].map((i) => (
              <motion.span
                key={`${engine.cycle}-wisp-${i}`}
                data-testid="exhale-wisp"
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-accent"
                initial={{ x: -3 + (i % 2) * 6, y: 0, opacity: 0.3 }}
                animate={{ y: 90, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 2,
                  delay: i * 0.6,
                  ease: "easeOut",
                }}
              />
            ))
          : null}
      </AnimatePresence>

      <motion.div
        className="absolute inset-[28%] rounded-full"
        style={{
          willChange: "transform",
          background:
            "radial-gradient(circle at 40% 35%, color-mix(in srgb, var(--color-accent-breath) 55%, white) 0%, var(--color-accent-soft) 55%, transparent 75%)",
        }}
        initial={false}
        animate={
          reducedMotion
            ? { scale: 1, opacity: 0.85 }
            : kind === "hold"
              ? { scale: 1, opacity: [1, 0.92, 1] }
              : {
                  scale: [orbScaleFrom, orbScale],
                  opacity: kind === "inhale" ? [0.7, 1] : [1, 0.75],
                }
        }
        transition={
          reducedMotion
            ? { duration: 0 }
            : kind === "hold"
              ? { duration: 7, ease: "easeInOut", repeat: Infinity }
              : {
                  duration: orbDuration,
                  ease:
                    kind === "inhale"
                      ? [0.34, 0.8, 0.4, 1]
                      : [0.4, 0, 0.5, 1],
                }
        }
      />

      <svg
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        className="relative h-full w-full"
        aria-hidden="true"
      >
        <path ref={pathRef} d={fullCircle} fill="none" stroke="none" />

        {arcs.map((arc) => {
          const active = engine.phaseSpec.kind === arc.kind
          const dash = `${arc.lengthFrac * C} ${C}`
          const offset = C * (0.25 - arc.startFrac)
          return (
            <motion.path
              key={arc.kind}
              d={fullCircle}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={dash}
              strokeDashoffset={offset}
              animate={{
                strokeWidth: active ? 8 : 6,
                opacity: active ? 1 : 0.3,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={active ? "stroke-accent" : "stroke-hairline"}
            />
          )
        })}

        <motion.path
          d={fullCircle}
          fill="none"
          className="stroke-accent"
          strokeWidth={4}
          strokeLinecap="round"
          style={{
            pathLength: trailLength,
            opacity: trailOpacity,
            rotate: -90,
            transformOrigin: "center",
          }}
        />

        {arcs.map((arc) => {
          const pos = polar(arc.labelAngle, R + 18)
          return (
            <text
              key={`label-${arc.kind}`}
              data-testid="arc-duration-label"
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-ink-subtle text-[11px]"
              aria-hidden="true"
            >
              {arc.seconds}s
            </text>
          )
        })}

        <motion.circle
          r={9}
          fill="var(--color-accent-breath)"
          style={{ cx, cy, opacity: dotOpacity }}
        />
      </svg>

      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <motion.span
          key={engine.phaseRemaining}
          className="text-5xl font-semibold tabular-nums tracking-tight text-ink"
          initial={{ scale: 1.15, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
        >
          {engine.phaseRemaining}
        </motion.span>
      </div>
    </div>
  )
}
