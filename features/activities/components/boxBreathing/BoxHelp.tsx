"use client"

import { useEffect, useId } from "react"

const CYCLE_MESSAGES = [
  "You're doing great.",
  "Stay with the square.",
  "Nice and steady.",
  "Let each breath soften you.",
] as const

interface BoxHelpProps {
  breathSeconds: number
}

export function BoxHelp({ breathSeconds }: BoxHelpProps) {
  const id = useId()
  return (
    <section
      className="mb-8 rounded-3xl border border-hairline bg-surface p-5"
      aria-labelledby={id}
    >
      <h2 id={id} className="text-sm font-semibold text-ink">
        What is box breathing?
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
        Four equal sides — inhale, hold, exhale, hold — each{" "}
        {breathSeconds} seconds. Used by athletes and clinicians to steady the
        nervous system.
      </p>
      <ul className="mt-3 list-inside list-disc space-y-1 text-[15px] text-ink-muted">
        <li>Reduces stress</li>
        <li>Improves focus</li>
        <li>Helps regulate heart rate</li>
      </ul>
    </section>
  )
}

export function cycleMotivation(cycle: number): string | null {
  if (cycle <= 1) return null
  return CYCLE_MESSAGES[(cycle - 2) % CYCLE_MESSAGES.length]
}

/** Screen reader announcement for mid-session nudges. */
export function BoxCycleNudge({ message }: { message: string | null }) {
  return message ? (
    <p className="sr-only" aria-live="polite">
      {message}
    </p>
  ) : null
}

/** Load SpeechSynthesis voice list (Safari needs voiceschanged). */
export function SpeechVoiceLoader({
  onVoices,
}: {
  onVoices: (v: SpeechSynthesisVoice[]) => void
}) {
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    const load = () => onVoices(window.speechSynthesis.getVoices())
    load()
    window.speechSynthesis.addEventListener("voiceschanged", load)
    return () =>
      window.speechSynthesis.removeEventListener("voiceschanged", load)
  }, [onVoices])

  return null
}
