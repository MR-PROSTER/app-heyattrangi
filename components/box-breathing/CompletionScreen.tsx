"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { formatClock } from "@/utils/box-breathing/timer"

interface CompletionScreenProps {
  cyclesCompleted: number
  activeMs: number
  sessionMs: number
  reducedMotion: boolean
  onRepeat: () => void
  onDone: () => void
}

export default function CompletionScreen({
  cyclesCompleted,
  activeMs,
  sessionMs,
  reducedMotion,
  onRepeat,
  onDone,
}: CompletionScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto flex w-full max-w-md flex-col items-center gap-6 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300 ring-1 ring-emerald-300/40"
      >
        <Check className="h-10 w-10" />
      </motion.div>

      {!reducedMotion && <ConfettiBurst />}

      <div>
        <h2 className="text-2xl font-medium text-white">Great job.</h2>
        <p className="mt-1 text-white/70">You completed your breathing exercise.</p>
      </div>

      <div className="grid w-full grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <Stat label="Duration" value={formatClock(sessionMs / 1000)} />
        <Stat label="Cycles" value={String(cyclesCompleted)} />
        <Stat label="Breathing time" value={formatClock(activeMs / 1000)} />
      </div>

      <div className="flex w-full gap-3">
        <button
          type="button"
          onClick={onRepeat}
          className="flex-1 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          Repeat
        </button>
        <button
          type="button"
          onClick={onDone}
          className="flex-1 rounded-full bg-white px-6 py-3.5 text-sm font-medium text-slate-900 transition-transform hover:scale-[1.02] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        >
          Done
        </button>
      </div>
    </motion.div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-lg font-semibold text-white tabular-nums">{value}</span>
      <span className="mt-1 text-[11px] uppercase tracking-wide text-white/50">{label}</span>
    </div>
  )
}

function ConfettiBurst() {
  const pieces = Array.from({ length: 16 }, (_, i) => i)
  const colors = ["#60a5fa", "#34d399", "#fbbf24", "#f472b6", "#a78bfa"]
  return (
    <div className="pointer-events-none absolute inset-x-0 top-8 flex justify-center overflow-visible" aria-hidden>
      {pieces.map((i) => {
        const angle = (i / pieces.length) * Math.PI * 2
        const distance = 90 + (i % 3) * 24
        return (
          <motion.span
            key={i}
            className="absolute h-2 w-2 rounded-sm"
            style={{ backgroundColor: colors[i % colors.length] }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance - 40,
              opacity: 0,
              rotate: 180,
            }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          />
        )
      })}
    </div>
  )
}
