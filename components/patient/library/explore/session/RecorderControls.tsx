"use client"

import { Pause, Play, Check } from "lucide-react"

interface RecorderControlsProps {
  isPaused: boolean
  onTogglePause: () => void
  onFinish: () => void
}

export default function RecorderControls({
  isPaused,
  onTogglePause,
  onFinish,
}: RecorderControlsProps) {
  return (
    <footer className="shrink-0 border-t border-slate-100/80 bg-white/80 backdrop-blur-md px-4 sm:px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="max-w-md mx-auto flex items-center gap-3">
        <button
          type="button"
          onClick={onTogglePause}
          aria-label={isPaused ? "Resume session" : "Pause session"}
          aria-pressed={isPaused}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-[15px] py-3.5 px-4 transition-all duration-200 hover:scale-[1.02] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
        >
          {isPaused ? (
            <>
              <Play className="w-4 h-4 fill-current" aria-hidden />
              Resume
            </>
          ) : (
            <>
              <Pause className="w-4 h-4 fill-current" aria-hidden />
              Pause
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onFinish}
          aria-label="Finish session"
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-[15px] py-3.5 px-4 shadow-[0_8px_24px_rgba(249,115,22,0.25)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2"
        >
          <Check className="w-4 h-4" strokeWidth={2.5} aria-hidden />
          Finish
        </button>
      </div>
    </footer>
  )
}
