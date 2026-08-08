"use client"

import { motion } from "framer-motion"
import type { BodyRegion } from "../types"
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion"
import { AdvisoryRing } from "./AdvisoryRing"
import type { MotionValue } from "framer-motion"

interface MotionSketchProps {
  region: BodyRegion
  /** Settling step — no sketch */
  showSketch: boolean
  progressMv: MotionValue<number> | null
  advisoryComplete: boolean
}

/** Tiny one-line gesture loops (~120×120). Clarifies; never carries unique instruction. */
export function MotionSketch({
  region,
  showSketch,
  progressMv,
  advisoryComplete,
}: MotionSketchProps) {
  const reducedMotion = usePrefersReducedMotion()

  return (
    <div
      className="relative mx-auto h-[120px] w-[120px]"
      aria-hidden
      data-testid="motion-sketch"
    >
      {progressMv && !advisoryComplete ? (
        <AdvisoryRing
          progressMv={progressMv}
          complete={advisoryComplete}
          stepped={reducedMotion}
        />
      ) : null}

      {showSketch ? (
        <svg
          viewBox="0 0 120 120"
          className="relative h-full w-full"
          fill="none"
        >
          <SketchPaths region={region} reducedMotion={reducedMotion} />
        </svg>
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-accent/40" />
        </div>
      )}
    </div>
  )
}

function SketchPaths({
  region,
  reducedMotion,
}: {
  region: BodyRegion
  reducedMotion: boolean
}) {
  const loop = reducedMotion
    ? undefined
    : {
        animate: { pathLength: [0, 1, 1] as number[], opacity: [0.3, 1, 0.3] },
        transition: {
          duration: 3,
          times: [0, 0.75, 1],
          repeat: Infinity,
          repeatDelay: 1,
          ease: "easeInOut" as const,
        },
      }

  const stroke = {
    stroke: "var(--color-accent)",
    strokeWidth: 2.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none" as const,
    opacity: reducedMotion ? 0.7 : undefined,
  }

  switch (region) {
    case "jaw":
      return (
        <motion.path
          d="M40 55 Q60 72 80 55"
          {...stroke}
          initial={reducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
          {...(loop ?? { animate: { pathLength: 1 } })}
        />
      )
    case "shoulders":
      return (
        <>
          <motion.path
            d="M30 70 L30 40"
            {...stroke}
            initial={reducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
            {...(loop ?? { animate: { pathLength: 1 } })}
          />
          <motion.path
            d="M90 70 L90 40"
            {...stroke}
            initial={reducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
            {...(loop ?? { animate: { pathLength: 1 } })}
            transition={
              loop
                ? { ...loop.transition, delay: 0.15 }
                : undefined
            }
          />
        </>
      )
    case "hands":
      return (
        <motion.path
          d="M35 75 L45 40 L55 75 M50 75 L60 40 L70 75 M65 75 L75 40 L85 75"
          {...stroke}
          initial={reducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
          {...(loop ?? { animate: { pathLength: 1 } })}
        />
      )
    case "neck":
      return (
        <motion.path
          d="M60 40 Q40 60 60 80 Q80 60 60 40"
          {...stroke}
          initial={reducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
          {...(loop ?? { animate: { pathLength: 1 } })}
        />
      )
    case "feet":
      return (
        <motion.path
          d="M35 70 L55 85 L75 70"
          {...stroke}
          initial={reducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
          {...(loop ?? { animate: { pathLength: 1 } })}
        />
      )
    case "ankles":
      return (
        <motion.path
          d="M60 60 m-18 0 a18 12 0 1 1 36 0 a18 12 0 1 1 -36 0"
          {...stroke}
          initial={reducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
          {...(loop ?? { animate: { pathLength: 1 } })}
        />
      )
    case "spine":
      return (
        <motion.path
          d="M60 90 L60 30"
          {...stroke}
          initial={reducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
          {...(loop ?? { animate: { pathLength: 1 } })}
        />
      )
    case "tongue":
      return (
        <motion.path
          d="M45 55 Q60 70 75 55"
          {...stroke}
          initial={reducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
          {...(loop ?? { animate: { pathLength: 1 } })}
        />
      )
    case "brows":
      return (
        <motion.path
          d="M40 50 Q60 42 80 50"
          {...stroke}
          initial={reducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
          {...(loop ?? { animate: { pathLength: 1 } })}
        />
      )
    case "whole":
      return null
  }
}
