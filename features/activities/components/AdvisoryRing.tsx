"use client"

import { motion, useTransform, type MotionValue } from "framer-motion"
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion"

interface AdvisoryRingProps {
  progressMv: MotionValue<number>
  complete: boolean
  size?: number
  /** When reduced motion, show stepped arcs instead of continuous fill */
  stepped?: boolean
}

const R = 54
const C = 2 * Math.PI * R

/** Ambient advisory ring — accent at 35% opacity. Never blocks Next. */
export function AdvisoryRing({
  progressMv,
  complete,
  size = 120,
  stepped = false,
}: AdvisoryRingProps) {
  const reducedMotion = usePrefersReducedMotion()
  const dashOffset = useTransform(progressMv, (p) => C * (1 - p))
  const steppedProgress = useTransform(progressMv, (p) => {
    if (p <= 0) return 0
    if (p < 0.25) return 0.25
    if (p < 0.5) return 0.5
    if (p < 0.75) return 0.75
    return 1
  })
  const steppedOffset = useTransform(steppedProgress, (p) => C * (1 - p))

  if (complete) return null

  const offset = reducedMotion || stepped ? steppedOffset : dashOffset

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className="pointer-events-none absolute inset-0"
      aria-hidden
      data-testid="advisory-ring"
    >
      <circle
        cx={60}
        cy={60}
        r={R}
        fill="none"
        stroke="var(--color-hairline)"
        strokeWidth={2.5}
        opacity={0.5}
      />
      <motion.circle
        cx={60}
        cy={60}
        r={R}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray={C}
        style={{
          strokeDashoffset: offset,
          opacity: 0.35,
          rotate: -90,
          transformOrigin: "60px 60px",
        }}
      />
    </svg>
  )
}
