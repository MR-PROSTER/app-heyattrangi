"use client"

import { getEncouragingMessage } from "@/lib/data/wellnessExperienceConfig"

interface ExperienceCompletionProps {
  title: string
  estimatedDuration: string
  seed: string
  onRestart: () => void
  onDone: () => void
}

export default function ExperienceCompletion({
  title,
  estimatedDuration,
  seed,
  onRestart,
  onDone,
}: ExperienceCompletionProps) {
  const message = getEncouragingMessage(seed)

  return (
    <div
      className="w-full max-w-md mx-auto text-center animate-in fade-in zoom-in-95 duration-500 py-6"
      aria-live="polite"
    >
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/15 border border-white/25 flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.2)]">
        <svg
          className="w-10 h-10 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p className="text-white/70 text-[11px] font-black uppercase tracking-[0.2em] mb-3">
        ✓ Completed
      </p>
      <h3 className="text-white text-3xl font-extrabold tracking-tight mb-2">{title}</h3>
      <p className="text-white/70 text-sm font-semibold mb-6">{estimatedDuration}</p>
      <p className="text-white/85 text-base font-medium leading-relaxed max-w-sm mx-auto mb-8">
        {message}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="flex-1 py-3.5 rounded-full text-sm font-bold text-white/90 bg-white/10 border border-white/20 hover:bg-white/15 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          Restart
        </button>
        <button
          type="button"
          onClick={onDone}
          className="flex-[1.3] py-3.5 rounded-full text-sm font-black uppercase tracking-widest text-slate-800 bg-white hover:bg-white/95 shadow-lg transition-all hover:scale-[1.01] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          Done
        </button>
      </div>
    </div>
  )
}
