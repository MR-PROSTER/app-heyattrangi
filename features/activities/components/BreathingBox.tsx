"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion"
import type { Phase, PhaseKind } from "../types"

const VIEW = 320
const INSET = 40
const RX = 28
const SIDE = VIEW - INSET * 2

function buildBoxPath(): string {
  const x = INSET
  const y = INSET
  const w = SIDE
  const h = SIDE
  const r = RX
  // Path starts at the bottom-left corner (split at the middle of its rounded
  // arc) rather than partway up the left edge, so the progress dot/trail
  // visually begins at the corner instead of appearing to start mid-side.
  const startX = x + r / 4
  const startY = y + h - r / 4
  return [
    `M ${startX} ${startY}`,
    `Q ${x} ${y + h - r / 2} ${x} ${y + h - r}`,
    `L ${x} ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y}`,
    `L ${x + w - r} ${y}`,
    `Q ${x + w} ${y} ${x + w} ${y + r}`,
    `L ${x + w} ${y + h - r}`,
    `Q ${x + w} ${y + h} ${x + w - r} ${y + h}`,
    `L ${x + r} ${y + h}`,
    `Q ${x + r / 2} ${y + h} ${startX} ${startY}`,
    `Z`,
  ].join(" ")
}

interface BreathingBoxProps {
  phase: Phase | string
  phaseKind?: PhaseKind
  phaseSeconds?: number
  cycleProgressMv: MotionValue<number>
  phaseProgressMv: MotionValue<number>
  reducedMotion: boolean
  countdown: number
  /** Immersive mode: scale 1↔1.25, particles, no center countdown */
  immersive?: boolean
}

export function BreathingBox({
  phase,
  phaseKind,
  phaseSeconds = 4,
  cycleProgressMv,
  phaseProgressMv,
  reducedMotion,
  countdown,
  immersive = false,
}: BreathingBoxProps) {
  const pathD = useMemo(() => buildBoxPath(), [])
  const pathId = useId()
  const pathRef = useRef<SVGPathElement>(null)
  const pathLenRef = useRef(1)
  const cx = useMotionValue(INSET + RX / 4)
  const cy = useMotionValue(INSET + SIDE - RX / 4)
  const trailLength = useMotionValue(0)
  const [ripples, setRipples] = useState<number[]>([])
  const rippleIdRef = useRef(0)
  const [particles, setParticles] = useState<number[]>([])
  const particleIdRef = useRef(0)
  const lastPhaseRef = useRef<Phase | string | null>(null)

  const kind =
    phaseKind ??
    (phase === "inhale"
      ? "inhale"
      : phase === "exhale"
        ? "exhale"
        : "hold")

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
    if (!el || typeof el.getTotalLength !== "function") {
      trailLength.set(Math.min(1, Math.max(0, v)))
      return
    }
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

  useMotionValueEvent(phaseProgressMv, "change", () => {
    /* keep hot */
  })

  const immersiveScale =
    kind === "inhale" || phase === "hold-in"
      ? 1.25
      : kind === "exhale" || phase === "hold-out"
        ? 1
        : phase === "inhale" || phase === "hold-in"
          ? 1.25
          : 1

  const classicScale =
    phase === "inhale" || phase === "hold-in" ? 1.06 : 0.92

  const scaleTarget = immersive ? immersiveScale : classicScale
  const scaleFrom = immersive
    ? kind === "inhale"
      ? 1
      : kind === "exhale"
        ? 1.25
        : scaleTarget
    : scaleTarget

  const glowScale =
    kind === "inhale" || phase === "hold-in" || phase === "inhale" ? 1.45 : 1
  const glowOpacity =
    kind === "inhale" || phase === "hold-in" || phase === "inhale" ? 0.8 : 0.35
  const holding = phase === "hold-in" || phase === "hold-out" || kind === "hold"
  const animDuration = phaseSeconds

  useEffect(() => {
    if (reducedMotion) return
    if (phase === lastPhaseRef.current) return
    lastPhaseRef.current = phase

    if (!immersive && phase === "inhale") {
      const base = rippleIdRef.current
      rippleIdRef.current += 3
      setRipples((prev) => [...prev, base, base + 1, base + 2].slice(-3))
    }

    if (immersive && kind === "inhale") {
      const base = particleIdRef.current
      particleIdRef.current += 4
      setParticles((prev) =>
        [...prev, base, base + 1, base + 2, base + 3].slice(-8)
      )
    }
    if (immersive && kind === "exhale") {
      const base = particleIdRef.current
      particleIdRef.current += 4
      setParticles((prev) =>
        [...prev, base, base + 1, base + 2, base + 3].slice(-8)
      )
    }
  }, [phase, kind, reducedMotion, immersive])

  const showCenterCountdown = !immersive

  return (
    <div
      className="relative mx-auto grid place-items-center"
      style={{
        width: "clamp(200px, 58vw, 320px)",
        height: "clamp(200px, 58vw, 320px)",
      }}
      data-testid="breathing-box"
    >
      {!reducedMotion && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--color-accent-breath) 18%, transparent) 0%, transparent 70%)",
            filter: "blur(48px)",
            willChange: "transform, opacity",
          }}
          animate={{
            scale: glowScale,
            opacity: glowOpacity,
          }}
          transition={{
            duration: kind === "exhale" ? animDuration : animDuration,
            ease:
              kind === "exhale"
                ? [0.4, 0, 0.5, 1]
                : [0.34, 0.8, 0.4, 1],
          }}
        />
      )}

      {!reducedMotion &&
        !immersive &&
        ripples.map((id, i) => (
          <motion.div
            key={id}
            data-testid="breath-ripple"
            aria-hidden
            className="pointer-events-none absolute inset-[12%] rounded-[28%] border-2 border-accent"
            initial={{ scale: 1, opacity: 0.35 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{
              duration: animDuration,
              delay: (i % 3) * 0.4,
              ease: "easeOut",
            }}
            onAnimationComplete={() => {
              setRipples((prev) => prev.filter((r) => r !== id))
            }}
          />
        ))}

      {!reducedMotion &&
        immersive &&
        particles.map((id, i) => {
          const outward = kind === "inhale" || phase === "inhale"
          return (
            <motion.div
              key={id}
              data-testid="box-particle"
              aria-hidden
              className="pointer-events-none absolute inset-[10%] rounded-[32%] border-2 border-accent/40"
              initial={{
                scale: outward ? 0.95 : 1.2,
                opacity: 0.4,
              }}
              animate={{
                scale: outward ? 1.55 : 0.85,
                opacity: 0,
              }}
              transition={{
                duration: animDuration,
                delay: (i % 4) * 0.15,
                ease: "easeOut",
              }}
              onAnimationComplete={() => {
                setParticles((prev) => prev.filter((p) => p !== id))
              }}
            />
          )
        })}

      {!reducedMotion && immersive && holding && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={`float-${phase}-${i}`}
              aria-hidden
              className="pointer-events-none absolute h-1 w-1 rounded-full bg-accent/35"
              style={{
                left: `${35 + i * 12}%`,
                top: `${30 + i * 10}%`,
              }}
              animate={{ y: [0, -10, 0], opacity: [0.2, 0.5, 0.2] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut",
              }}
            />
          ))}
        </>
      )}

      <motion.div
        className="relative h-full w-full"
        style={{ willChange: "transform" }}
        animate={
          reducedMotion
            ? { scale: 1, borderRadius: "28%" }
            : immersive
              ? holding
                ? { scale: scaleTarget }
                : { scale: [scaleFrom, scaleTarget] }
              : { scale: scaleTarget }
        }
        transition={
          reducedMotion
            ? { duration: 0 }
            : holding
              ? { duration: 0.35, ease: "easeOut" }
              : {
                  duration: animDuration,
                  ease:
                    kind === "inhale"
                      ? [0.34, 0.8, 0.4, 1]
                      : [0.4, 0, 0.5, 1],
                }
        }
      >
        {immersive && !reducedMotion ? (
          <motion.div
            aria-hidden
            className="absolute inset-[18%] rounded-[28%] border-2 border-accent/30"
            style={{
              willChange: "transform, opacity, border-radius",
              boxShadow:
                "0 0 32px color-mix(in srgb, var(--color-accent-breath) 25%, transparent)",
              background:
                "linear-gradient(145deg, color-mix(in srgb, var(--color-accent-breath) 12%, transparent), color-mix(in srgb, var(--color-accent-soft) 40%, transparent))",
            }}
            animate={
              holding
                ? {
                    borderRadius: "32%",
                    opacity: [0.85, 0.95, 0.85],
                  }
                : {
                    borderRadius:
                      kind === "inhale" ? "36%" : "24%",
                    opacity: kind === "inhale" ? [0.7, 1] : [1, 0.75],
                  }
            }
            transition={
              holding
                ? { duration: animDuration, repeat: Infinity, ease: "easeInOut" }
                : { duration: animDuration, ease: [0.37, 0, 0.63, 1] }
            }
          />
        ) : null}

        <svg
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          className="relative h-full w-full"
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
            strokeWidth={immersive ? 4 : 3}
            strokeLinecap="round"
            style={{ pathLength: trailLength }}
          />
          <motion.circle
            r={immersive ? 10 : 16}
            fill="var(--color-accent-breath)"
            style={{
              cx,
              cy,
              opacity: holding && !reducedMotion ? 0.25 : 0,
            }}
            animate={
              holding && !reducedMotion
                ? { opacity: [0.15, 0.35, 0.15] }
                : { opacity: reducedMotion ? 0 : holding ? 0.25 : 0 }
            }
            transition={
              holding && !reducedMotion
                ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.3 }
            }
          />
          <motion.circle
            r={immersive ? 7 : 8}
            fill="var(--color-accent-breath)"
            style={{
              cx,
              cy,
              opacity: reducedMotion ? 0.55 : 1,
            }}
          />
        </svg>

        {showCenterCountdown ? (
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
        ) : null}
      </motion.div>
    </div>
  )
}
