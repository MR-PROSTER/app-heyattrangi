"use client"

import type { ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"

export type ActivityAnimationVariant =
  | "fade"
  | "slide"
  | "scale"
  | "float"

interface ActivityAnimationProps {
  animationKey: string
  variant?: ActivityAnimationVariant
  isPaused?: boolean
  className?: string
  children: ReactNode
}

const VARIANTS: Record<
  ActivityAnimationVariant,
  {
    initial: Record<string, number>
    animate: Record<string, number>
    exit: Record<string, number>
  }
> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.94 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 },
  },
  float: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  },
}

export default function ActivityAnimation({
  animationKey,
  variant = "fade",
  isPaused = false,
  className = "",
  children,
}: ActivityAnimationProps) {
  const v = VARIANTS[variant]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={animationKey}
        initial={v.initial}
        animate={v.animate}
        exit={v.exit}
        transition={{
          duration: 0.35,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={className}
        style={{
          // Soften motion feel when session is paused without unmounting
          opacity: isPaused ? 0.85 : undefined,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
