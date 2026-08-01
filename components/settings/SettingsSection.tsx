import type { ReactNode } from "react"

interface SettingsSectionProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
}

export default function SettingsSection({
  title,
  description,
  children,
  className = "",
}: SettingsSectionProps) {
  return (
    <section className={`space-y-3 ${className}`}>
      {title ? (
        <header className="px-0.5">
          <h2 className="text-[var(--text-sm)] font-bold text-[var(--color-text-primary)]">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-[var(--text-xs)] font-medium text-[var(--color-text-muted)] leading-[var(--leading-base)]">
              {description}
            </p>
          ) : null}
        </header>
      ) : null}
      <div className="space-y-2">{children}</div>
    </section>
  )
}
