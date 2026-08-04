/** Calm pre-session guidance for 4-7-8 — not a clinical warning. */
export function FourSevenEightNotice() {
  return (
    <section
      aria-labelledby="fse-before-title"
      className="rounded-2xl bg-accent-soft p-4 text-[15px] leading-relaxed text-ink"
    >
      <h2
        id="fse-before-title"
        className="mb-2 text-sm font-semibold text-ink"
      >
        Before you start
      </h2>
      <ul className="space-y-1.5 text-ink">
        <li>
          Sit or lie down — this one can make you feel lightheaded, and that&apos;s
          normal.
        </li>
        <li>If you&apos;re new to it, start with 4 cycles.</li>
        <li>Don&apos;t do this while driving or standing.</li>
        <li>
          Feeling dizzy? Just breathe normally. You can come back to it.
        </li>
      </ul>
    </section>
  )
}
