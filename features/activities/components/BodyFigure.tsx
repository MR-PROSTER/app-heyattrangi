"use client"

import { motion, useMotionValue, useTransform, type MotionValue } from "framer-motion"
import type { BodyRegion, ScanRegionId } from "../types"
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion"

/** Shared silhouette path — soft continuous outline, no face, no gender markers. */
export const BODY_FIGURE_PATH = `M120 28
             C102 28 90 42 90 58
             C90 74 102 88 120 88
             C138 88 150 74 150 58
             C150 42 138 28 120 28
             Z
             M120 88
             C120 88 112 100 112 112
             L112 118
             M88 130
             C70 138 58 168 56 200
             L54 248
             C72 252 92 248 108 240
             L108 320
             C108 340 100 360 96 380
             L108 380
             L120 340
             L132 380
             L144 380
             C140 360 132 340 132 320
             L132 240
             C148 248 168 252 186 248
             L184 200
             C182 168 170 138 152 130
             C140 122 128 118 120 118
             C112 118 100 122 88 130
             Z`

/** Micro-movement region anchors (viewBox 0 0 240 400) */
export const MOVEMENT_REGION_POS: Record<BodyRegion, { x: number; y: number }> =
  {
    jaw: { x: 120, y: 52 },
    tongue: { x: 120, y: 62 },
    brows: { x: 120, y: 38 },
    shoulders: { x: 120, y: 118 },
    hands: { x: 52, y: 220 },
    neck: { x: 120, y: 95 },
    feet: { x: 120, y: 370 },
    ankles: { x: 120, y: 350 },
    spine: { x: 120, y: 210 },
    whole: { x: 120, y: 200 },
  }

/** Scan region centres — feet → head (y decreases upward) */
export const SCAN_REGION_Y: Record<ScanRegionId, number> = {
  "feet-toes": 370,
  "lower-legs": 340,
  "knees-thighs": 300,
  "hips-seat": 265,
  "lower-back": 235,
  belly: 210,
  chest: 175,
  "upper-back-shoulders": 140,
  "hands-arms": 200,
  "neck-throat": 100,
  "face-jaw": 55,
  whole: 200,
}

function resolveDiscretePos(
  region: BodyRegion | ScanRegionId
): { x: number; y: number } {
  if (region in MOVEMENT_REGION_POS) {
    return MOVEMENT_REGION_POS[region as BodyRegion]
  }
  return { x: 120, y: SCAN_REGION_Y[region as ScanRegionId] ?? 200 }
}

interface BodyFigureProps {
  region?: BodyRegion | ScanRegionId
  travelProgressMv?: MotionValue<number>
  travelYs?: readonly number[]
  showTrail?: boolean
  /** Region index for reduced-motion discrete trail fill */
  activeIndex?: number
  blurPx?: number
  pulseDurationSec?: number
  glowPeakOpacity?: number
  className?: string
  testId?: string
}

/**
 * Shared abstract body figure for Micro Movement and Body Scan.
 */
export function BodyFigure({
  region,
  travelProgressMv,
  travelYs,
  showTrail = false,
  activeIndex = 0,
  blurPx = 32,
  pulseDurationSec = 4,
  glowPeakOpacity = 0.5,
  className = "relative mx-auto h-[280px] w-[168px] sm:h-[320px] sm:w-[192px]",
  testId = "body-figure",
}: BodyFigureProps) {
  const reducedMotion = usePrefersReducedMotion()
  const fallbackMv = useMotionValue(0)
  const progressMv = travelProgressMv ?? fallbackMv

  const yPx = useTransform(progressMv, (p) => {
    const ys = travelYs
    if (!ys || ys.length === 0) return 200
    if (ys.length === 1) return ys[0]
    const n = ys.length
    const t = Math.min(1, Math.max(0, p))
    const scaled = t * (n - 1)
    const i = Math.min(n - 2, Math.floor(scaled))
    const local = scaled - i
    const eased = local * local * (3 - 2 * local)
    return ys[i] + (ys[i + 1] - ys[i]) * eased
  })

  const topPct = useTransform(yPx, (y) => `${(y / 400) * 100}%`)
  const trailBottomPct = useTransform(yPx, (y) => {
    const start = travelYs?.[0] ?? 370
    const covered = Math.max(0, start - y)
    return `${(covered / 400) * 100}%`
  })
  const trailTopPct = useTransform(yPx, (y) => `${(y / 400) * 100}%`)

  const discrete = region && !travelProgressMv ? resolveDiscretePos(region) : null
  const leftPct = discrete ? (discrete.x / 240) * 100 : 50
  const discreteTop = discrete ? (discrete.y / 400) * 100 : 50

  return (
    <div className={className} aria-hidden data-testid={testId}>
      {showTrail && travelProgressMv && !reducedMotion ? (
        <motion.div
          className="pointer-events-none absolute left-1/2 w-3 -translate-x-1/2 rounded-full"
          style={{
            top: trailTopPct,
            height: trailBottomPct,
            background:
              "linear-gradient(to bottom, color-mix(in srgb, var(--color-accent) 8%, transparent), transparent)",
          }}
          data-testid="scan-trail"
        />
      ) : null}

      {showTrail && reducedMotion && travelYs ? (
        <div
          className="pointer-events-none absolute inset-0"
          data-testid="scan-trail-segmented"
        >
          {travelYs.slice(0, activeIndex + 1).map((y, i) => {
            const prev = i === 0 ? y : travelYs[i - 1]
            const top = Math.min(prev, y)
            const h = Math.abs(prev - y) || 8
            return (
              <div
                key={i}
                className="absolute left-1/2 w-2 -translate-x-1/2 rounded-full bg-accent/10"
                style={{
                  top: `${(top / 400) * 100}%`,
                  height: `${(h / 400) * 100}%`,
                }}
              />
            )
          })}
        </div>
      ) : null}

      {travelProgressMv ? (
        <motion.div
          className="pointer-events-none absolute left-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: "50%",
            top: topPct,
            background: `radial-gradient(circle, color-mix(in srgb, var(--color-accent) ${Math.round(glowPeakOpacity * 100)}%, transparent), transparent 70%)`,
            filter: `blur(${blurPx}px)`,
            willChange: "transform, opacity",
            opacity: reducedMotion ? 0.4 : undefined,
          }}
          animate={
            reducedMotion
              ? { opacity: 0.4 }
              : {
                  opacity: [
                    glowPeakOpacity,
                    glowPeakOpacity * 0.55,
                    glowPeakOpacity,
                  ],
                }
          }
          transition={
            reducedMotion
              ? { duration: 0.2 }
              : {
                  opacity: {
                    duration: pulseDurationSec,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }
          }
        />
      ) : null}

      {discrete ? (
        <motion.div
          className="pointer-events-none absolute h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--color-accent) 50%, transparent), transparent 70%)",
            filter: `blur(${blurPx}px)`,
            willChange: "transform, opacity",
          }}
          initial={false}
          animate={
            reducedMotion
              ? { left: `${leftPct}%`, top: `${discreteTop}%`, opacity: 0.4 }
              : {
                  left: `${leftPct}%`,
                  top: `${discreteTop}%`,
                  opacity: [
                    glowPeakOpacity,
                    glowPeakOpacity * 0.56,
                    glowPeakOpacity,
                  ],
                }
          }
          transition={
            reducedMotion
              ? { duration: 0.15, ease: "easeOut" }
              : {
                  left: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
                  top: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
                  opacity: {
                    duration: pulseDurationSec,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }
          }
        />
      ) : null}

      <svg
        viewBox="0 0 240 400"
        className="relative h-full w-full"
        fill="none"
      >
        <path
          d={BODY_FIGURE_PATH}
          className="fill-surface stroke-hairline"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
