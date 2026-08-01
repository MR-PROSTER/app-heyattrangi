"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface CompletionActionsProps {
  onDone: () => void
  onTryAnother: () => void
}

export default function CompletionActions({
  onDone,
  onTryAnother,
}: CompletionActionsProps) {
  const doneRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    doneRef.current?.focus()
  }, [])

  return (
    <motion.div
      className="w-full space-y-3"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        ref={doneRef}
        type="button"
        onClick={onDone}
        aria-label="Done, return to Explore"
        className="w-full rounded-2xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-[16px] py-4 px-6 shadow-[0_10px_28px_rgba(249,115,22,0.28)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2"
      >
        Done
      </button>
      <button
        type="button"
        onClick={onTryAnother}
        aria-label="Try another activity, return to Activity Library"
        className="w-full rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-bold text-[15px] py-3.5 px-6 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2"
      >
        Try Another Activity
      </button>
    </motion.div>
  )
}
