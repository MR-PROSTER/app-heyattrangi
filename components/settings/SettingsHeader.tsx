import Link from "next/link"

interface SettingsHeaderProps {
  title: string
  backHref?: string
}

const TOUCH =
  "inline-flex min-h-[38px] min-w-[38px] min-[360px]:min-h-11 min-[360px]:min-w-11 items-center justify-center rounded-full " +
  "text-[var(--color-text-primary)] transition-colors duration-150 " +
  "hover:bg-[var(--color-surface)]/80 active:scale-[0.98] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2"

/**
 * Sticky settings title bar. Back navigates to backHref
 * (sub-pages → /dashboard/settings; menu → /dashboard/profile).
 */
export default function SettingsHeader({
  title,
  backHref = "/dashboard/settings",
}: SettingsHeaderProps) {
  return (
    <header
      className="sticky top-0 z-20 flex items-center gap-1.5 min-[360px]:gap-[var(--text-xs)]
        px-1.5 min-[360px]:px-[var(--text-xs)] pt-[max(0.5rem,env(safe-area-inset-top))] pb-1.5 min-[360px]:pb-[var(--text-xs)]
        bg-[color-mix(in_srgb,var(--color-bg)_92%,transparent)] backdrop-blur-sm"
    >
      <Link href={backHref} aria-label="Go back" className={TOUCH}>
        <svg className="h-[18px] w-[18px] min-[360px]:h-5 min-[360px]:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </Link>
      <h1 className="flex-1 text-[clamp(24px,7vw,32px)] font-bold leading-[1.1] tracking-tight text-[var(--color-text-primary)]">
        {title}
      </h1>
      <span className="w-[38px] min-[360px]:w-11 shrink-0" aria-hidden="true" />
    </header>
  )
}
