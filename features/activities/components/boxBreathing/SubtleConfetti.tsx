"use client"

import { motion } from "framer-motion"
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion"

/** Subtle celebration particles on the completion screen. */
export function SubtleConfetti() {
  const reduced = usePrefersReducedMotion()
  if (reduced) return null

  const pieces = Array.from({ length: 12 }, (_, i) => i)

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      data-testid="box-confetti"
    >
      {pieces.map((i) => (
        <motion.span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-accent/60"
          style={{
            left: `${10 + (i * 7) % 80}%`,
            top: "20%",
          }}
          initial={{ y: 0, opacity: 0.8, scale: 1 }}
          animate={{
            y: [0, 80 + (i % 3) * 20],
            opacity: [0.8, 0],
            x: [(i % 2 === 0 ? -1 : 1) * (i * 4), (i % 2 === 0 ? 1 : -1) * 12],
          }}
          transition={{
            duration: 1.8 + (i % 4) * 0.2,
            ease: "easeOut",
            delay: i * 0.04,
          }}
        />
      ))}
    </div>
  )
}
