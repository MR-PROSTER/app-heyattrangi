"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion"
import type { Phase } from "../types"

const VIEW = 320
const INSET = 40
const RX = 28
const SIDE = VIEW - INSET * 2

/** Rounded rect path starting at bottom-left, going up (inhale first). */
function buildBoxPath(): string {
  const x = INSET
  const y = INSET
  const w = SIDE
  const h = SIDE
  const r = RX
  // Start bottom-left (after left-bottom corner), go up the left side
  return [
    `M ${x} ${y + h - r}`,
    `L ${x} ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y}`,
    `L ${x + w - r} ${y}`,
    `Q ${x + w} ${y} ${x + w} ${y + r}`,
    `L ${x + w} ${y + h - r}`,
    `Q ${x + w} ${y + h} ${x + w - r} ${y + h}`,
    `L ${x + r} ${y + h}`,
    `Q ${x} ${y + h} ${x} ${y + h - r}`,
    `Z`,
  ].join(" ")
}

interface BreathingBoxProps {
  phase: Phase | string
  cycleProgressMv: MotionValue<number>
  phaseProgressMv: MotionValue<number>
  reducedMotion: boolean
  countdown: number
}

export function BreathingBox({
  phase,
  cycleProgressMv,
  phaseProgressMv,
  reducedMotion,
  countdown,
}: BreathingBoxProps) {
  const pathD = useMemo(() => buildBoxPath(), [])
  const pathId = useId()
  const pathRef = useRef<SVGPathElement>(null)
  const pathLenRef = useRef(1)
  const cx = useMotionValue(INSET)
  const cy = useMotionValue(INSET + SIDE)
  const trailLength = useMotionValue(0)
  const [ripples, setRipples] = useState<number[]>([])
  const rippleIdRef = useRef(0)
  const lastPhaseRef = useRef<Phase | string | null>(null)

  useEffect(() => {
    const el = pathRef.current
    if (!el || typeof el.getTotalLength !== "function") return
    try {
      pathLenRef.current = el.getTotalLength() || 1
    } catch {
      pathLenRef.current = 1
    }
  }, [pathD])

  useMotionValueEvent(cycleProgressMv, "change", (v) => {
    const el = pathRef.current
    if (!el || typeof el.getTotalLength !== "function") return
    try {
      const len = pathLenRef.current || el.getTotalLength() || 1
      const dist = Math.min(0.9999, Math.max(0, v)) * len
      const pt = el.getPointAtLength(dist)
      cx.set(pt.x)
      cy.set(pt.y)
      trailLength.set(Math.min(1, Math.max(0, v)))
    } catch {
      trailLength.set(Math.min(1, Math.max(0, v)))
    }
  })

  // Scale driven by phase via CSS/Framer animate (not per-frame filter)
  const scaleTarget =
    phase === "inhale" || phase === "hold-in" ? 1.06 : 0.92
  const glowScale = phase === "inhale" || phase === "hold-in" ? 1.35 : 1
  const glowOpacity = phase === "inhale" || phase === "hold-in" ? 0.75 : 0.4
  const holding = phase === "hold-in" || phase === "hold-out"

  useEffect(() => {
    if (reducedMotion) return
    if (phase === "inhale" && lastPhaseRef.current !== "inhale") {
      const base = rippleIdRef.current
      rippleIdRef.current += 3
      setRipples((prev) => {
        const next = [...prev, base, base + 1, base + 2]
        return next.slice(-3)
      })
    }
    lastPhaseRef.current = phase
  }, [phase, reducedMotion])

  // Keep phaseProgressMv subscribed so it stays hot (engine writes it)
  useMotionValueEvent(phaseProgressMv, "change", () => {
    /* motion-only; no React state */
  })

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
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--color-accent-breath) 12%, transparent) 0%, transparent 70%)",
            filter: "blur(40px)",
            willChange: "transform",
          }}
          animate={{ scale: glowScale, opacity: glowOpacity }}
          transition={{ duration: 4, ease: [0.37, 0, 0.63, 1] }}
        />
      )}

      {!reducedMotion &&
        ripples.map((id, i) => (
          <motion.div
            key={id}
            data-testid="breath-ripple"
            aria-hidden
            className="pointer-events-none absolute inset-[12%] rounded-[28%] border-2 border-accent"
            initial={{ scale: 1, opacity: 0.35 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{
              duration: 4,
              delay: (i % 3) * 0.4,
              ease: "easeOut",
            }}
            onAnimationComplete={() => {
              setRipples((prev) => prev.filter((r) => r !== id))
            }}
          />
        ))}

      <motion.div
        className="relative h-full w-full"
        style={{ willChange: "transform" }}
        animate={reducedMotion ? { scale: 1 } : { scale: scaleTarget }}
        transition={
          reducedMotion
            ? { duration: 0 }
            : {
                duration: phase === "inhale" || phase === "exhale" ? 4 : 0.2,
                ease: [0.37, 0, 0.63, 1],
              }
        }
      >
        <svg
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          className="h-full w-full"
          aria-hidden="true"
        >
          <defs>
            <path id={pathId} d={pathD} />
          </defs>
          <path
            ref={pathRef}
            d={pathD}
            fill="none"
            className="stroke-hairline"
            strokeWidth={2}
          />
          <motion.path
            d={pathD}
            fill="none"
            className="stroke-accent"
            strokeWidth={3}
            strokeLinecap="round"
            style={{ pathLength: trailLength }}
          />
          <motion.circle
            r={16}
            fill="var(--color-accent-breath)"
            style={{
              cx,
              cy,
              opacity: holding && !reducedMotion ? 0.25 : 0,
            }}
            animate={
              holding && !reducedMotion
                ? { opacity: [0.15, 0.3, 0.15] }
                : { opacity: reducedMotion ? 0 : holding ? 0.25 : 0 }
            }
            transition={
              holding && !reducedMotion
                ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.3 }
            }
          />
          <motion.circle
            r={8}
            fill="var(--color-accent-breath)"
            style={{
              cx,
              cy,
              opacity: reducedMotion ? 0.55 : 1,
            }}
          />
        </svg>

        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <motion.span
            key={countdown}
            className="text-5xl font-semibold tabular-nums tracking-tight text-ink"
            initial={{ scale: 1.15, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
          >
            {countdown}
          </motion.span>
        </div>
      </motion.div>
    </div>
  )
}
