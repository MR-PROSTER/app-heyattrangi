"use client"

import { useId } from "react"

/** Welcoming intro shown on the pre-session screen. */
export function BoxIntroCard() {
  const id = useId()
  return (
    <section
      className="mb-8 rounded-3xl border border-hairline bg-surface p-5 shadow-[0_1px_3px_rgba(20,33,61,0.06),0_8px_24px_-12px_rgba(20,33,61,0.10)]"
      aria-labelledby={id}
    >
      <h2 id={id} className="text-sm font-semibold text-ink">
        Before we begin
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">
        We&apos;ll breathe together. Follow the square — inhale as it expands,
        hold as it rests, exhale as it softens. Don&apos;t worry if you miss a
        breath. Simply continue with the animation.
      </p>
    </section>
  )
}
