"use client"

import { motion } from "framer-motion"

interface IntroCardProps {
  compact: boolean
  onStart: () => void
}

export default function IntroCard({ compact, onStart }: IntroCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto flex w-full max-w-md flex-col items-center gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-xl"
    >
      <span className="text-xs font-medium uppercase tracking-[0.3em] text-sky-300/80">Box Breathing</span>
      {!compact && (
        <p className="text-balance text-base leading-relaxed text-white/75">
          We&apos;ll breathe together. Follow the square. Don&apos;t worry if you miss a breath —
          simply continue with the animation.
        </p>
      )}
      <button
        type="button"
        onClick={onStart}
        className="w-full rounded-full bg-white px-8 py-4 text-base font-medium text-slate-900 shadow-lg shadow-black/20 transition-transform hover:scale-[1.02] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
      >
        {compact ? "Begin" : "Start Exercise"}
      </button>
    </motion.div>
  )
}
