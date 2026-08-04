"use client"

import { AnimatePresence, motion } from "framer-motion"

interface ExhaleWispsProps {
  active: boolean
  cycle: number
  count?: number
}

/** Downward particles for long exhales — shared by 4-7-8 and Physiological Sigh. */
export function ExhaleWisps({ active, cycle, count = 5 }: ExhaleWispsProps) {
  if (!active) return null
  return (
    <AnimatePresence>
      {Array.from({ length: count }, (_, i) => (
        <motion.span
          key={`${cycle}-wisp-${i}`}
          data-testid="exhale-wisp"
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-accent"
          initial={{ x: -6 + (i % 3) * 6, y: 0, opacity: 0.35 }}
          animate={{ y: 100, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 1.8,
            delay: i * 0.35,
            ease: "easeOut",
          }}
        />
      ))}
    </AnimatePresence>
  )
}
