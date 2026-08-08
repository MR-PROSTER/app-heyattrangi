"use client"

import { AnimatePresence, motion } from "framer-motion"

interface CountdownProps {
  value: number | string
  size?: "sm" | "lg"
  reducedMotion?: boolean
  label?: string
}

/** Big animated number display — reused for the in-session "seconds remaining" readout and the pre-start 3-2-1. */
export default function Countdown({ value, size = "sm", reducedMotion = false, label }: CountdownProps) {
  const sizeClass = size === "lg" ? "text-8xl font-semibold sm:text-9xl" : "text-2xl font-medium sm:text-3xl"

  return (
    <div className="flex flex-col items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.span
          key={value}
          initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: reducedMotion ? 1 : 1.15 }}
          transition={{ duration: reducedMotion ? 0.1 : 0.35, ease: [0.34, 1.56, 0.64, 1] }}
          className={`${sizeClass} text-white tabular-nums`}
        >
          {value}
        </motion.span>
      </AnimatePresence>
      {label ? <span className="mt-2 text-sm uppercase tracking-[0.2em] text-white/50">{label}</span> : null}
    </div>
  )
}
