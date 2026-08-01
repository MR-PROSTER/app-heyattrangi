"use client"

import { useId } from "react"

interface SettingsToggleProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export default function SettingsToggle({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: SettingsToggleProps) {
  const id = useId()
  const descId = `${id}-desc`

  return (
    <div
      className="flex items-start justify-between gap-4 rounded-[var(--radius-xl)] border border-[var(--color-border)]
        bg-[var(--color-surface)] px-4 py-3.5"
    >
      <div className="min-w-0 pt-0.5">
        <label htmlFor={id} className="text-[var(--text-sm)] font-semibold text-[var(--color-text-primary)] cursor-pointer">
          {label}
        </label>
        {description ? (
          <p id={descId} className="mt-0.5 text-[var(--text-xs)] font-medium text-[var(--color-text-muted)] leading-[var(--leading-base)]">
            {description}
          </p>
        ) : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={description ? descId : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-150
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed motion-reduce:transition-none
          ${checked ? "bg-[var(--color-text-primary)]" : "bg-[var(--color-border-strong)]"}`}
      >
        <span
          aria-hidden="true"
          className={`inline-block size-5 transform rounded-full bg-[var(--color-surface)] shadow transition-transform duration-150
            ${checked ? "translate-x-6" : "translate-x-1"}`}
        />
      </button>
    </div>
  )
}
