"use client"

import { type ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"

interface InlineActionsProps {
  onSave: () => void
  onCancel: () => void
  isSaving?: boolean
  saveDisabled?: boolean
  className?: string
  children?: ReactNode
}

export default function InlineActions({
  onSave,
  onCancel,
  isSaving = false,
  saveDisabled = false,
  className = "",
  children,
}: InlineActionsProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={`flex flex-wrap items-center gap-2 ${className}`}
    >
      <button
        type="button"
        onClick={onSave}
        disabled={isSaving || saveDisabled}
        className="inline-flex items-center justify-center min-h-9 rounded-lg bg-gray-900 px-3.5 py-2 text-xs font-bold text-white
          hover:bg-black transition-colors duration-150
          disabled:opacity-50 disabled:cursor-not-allowed
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        Save
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={isSaving}
        className="inline-flex items-center justify-center min-h-9 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700
          hover:bg-gray-50 transition-colors duration-150
          disabled:opacity-50 disabled:cursor-not-allowed
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        Cancel
      </button>
      {children}
    </motion.div>
  )
}
