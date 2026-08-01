import Link from "next/link"
import type { SettingsMenuItem } from "@/lib/settings/types"
import { ChevronIcon } from "./SettingsIcons"

interface SettingsRowProps {
  item: SettingsMenuItem
  /** Draw bottom divider */
  showDivider?: boolean
}

/** Handoff menu row: label + trailing chevron only. */
export default function SettingsRow({ item, showDivider = true }: SettingsRowProps) {
  return (
    <li className="list-none">
      <Link
        href={item.href}
        aria-label={item.label}
        className="flex w-full min-h-11 items-center justify-between gap-3 bg-[var(--color-surface)] px-4 py-3.5
          text-left transition-colors duration-150 hover:bg-[var(--color-surface-raised)] active:scale-[0.995]
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-brand)]"
      >
        <span className="text-[var(--text-base)] font-medium text-[var(--color-text-primary)]">
          {item.label}
        </span>
        <ChevronIcon className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" aria-hidden />
      </Link>
      {showDivider ? (
        <div className="h-px w-full bg-[var(--color-border)]" role="separator" />
      ) : null}
    </li>
  )
}
