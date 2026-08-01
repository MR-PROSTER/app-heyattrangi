"use client"

import { useMemo, useState } from "react"
import type { JournalConfig } from "@/data/activities/journalConfigs"
import ActivityAnimation from "@/components/patient/library/explore/engines/ActivityAnimation"

interface JournalEngineProps {
  config: JournalConfig
  isPaused: boolean
}

function countWords(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

export default function JournalEngine({
  config,
  isPaused,
}: JournalEngineProps) {
  const [text, setText] = useState("")
  const words = useMemo(() => countWords(text), [text])

  return (
    <ActivityAnimation
      animationKey="journal"
      variant="fade"
      isPaused={isPaused}
      className="w-full max-w-lg mx-auto"
    >
      <div className="w-full space-y-4">
        <div className="text-center space-y-1.5">
          <p className="text-[13px] font-bold uppercase tracking-widest text-slate-400">
            Prompt
          </p>
          <h2 className="font-extrabold text-xl sm:text-2xl text-slate-800 tracking-tight">
            {config.prompt}
          </h2>
        </div>

        <label htmlFor="journal-editor" className="sr-only">
          Journal entry
        </label>
        <textarea
          id="journal-editor"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isPaused}
          placeholder={config.placeholder}
          rows={10}
          aria-label="Journal entry"
          className="w-full min-h-[220px] sm:min-h-[280px] rounded-[22px] border border-slate-100 bg-white shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-5 text-[15px] leading-relaxed text-slate-700 font-medium placeholder:text-slate-300 resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
        />

        <div className="flex items-center justify-between text-sm">
          <p className="text-slate-400 font-medium" aria-live="polite">
            {words} {words === 1 ? "word" : "words"}
          </p>
          <p className="text-slate-400 text-xs font-semibold">
            Autosaved locally
          </p>
        </div>

        {isPaused && (
          <p
            className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400"
            role="status"
          >
            Paused
          </p>
        )}
      </div>
    </ActivityAnimation>
  )
}
