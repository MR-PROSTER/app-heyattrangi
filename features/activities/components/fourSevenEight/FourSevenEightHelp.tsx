"use client"

import { useId } from "react"

/** Educational copy for the 4-7-8 technique — notice language, no demands. */
export function FourSevenEightHelp() {
  const titleId = useId()
  return (
    <section
      className="mb-8 rounded-3xl border border-hairline bg-surface p-5"
      aria-labelledby={titleId}
    >
      <h2 id={titleId} className="text-sm font-semibold text-ink">
        What is the 4-7-8 breathing technique?
      </h2>
      <ol className="mt-3 space-y-2 text-[15px] leading-relaxed text-ink-muted">
        <li>Inhale gently through your nose for 4 seconds.</li>
        <li>Hold for 7 seconds — a soft pause is enough.</li>
        <li>Exhale slowly through your mouth for 8 seconds.</li>
      </ol>
      <h3 className="mt-5 text-sm font-semibold text-ink">People often use it for</h3>
      <ul className="mt-2 list-inside list-disc space-y-1 text-[15px] text-ink-muted">
        <li>Settling stress</li>
        <li>Steadying focus</li>
        <li>Easing anxious moments</li>
        <li>Winding down before sleep</li>
        <li>Slowing the pace of the breath</li>
      </ul>
      <p className="mt-4 text-sm text-ink-subtle">
        If you feel lightheaded, pause and return to your normal breath. You can
        stop anytime.
      </p>
    </section>
  )
}
