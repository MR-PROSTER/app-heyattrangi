"use client"

import { AnimatePresence, motion } from "framer-motion"

interface PhaseLabelProps {
  label: string
  hint?: string
  remaining: number
}

export function PhaseLabel({ label, hint, remaining }: PhaseLabelProps) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={label + (hint ?? "")}
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -6, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <p className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            {label}
          </p>
          {hint ? (
            <p className="mt-1 text-sm text-ink-subtle">{hint}</p>
          ) : null}
        </motion.div>
      </AnimatePresence>
      <p className="text-[15px] leading-relaxed text-ink-muted">
        {remaining} {remaining === 1 ? "second" : "seconds"}
      </p>
    </div>
  )
}
