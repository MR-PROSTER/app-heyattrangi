"use client"

import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react"

interface SettingsInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  label: string
  error?: string | null
  hint?: string
  leading?: ReactNode
}

const fieldClass =
  "w-full min-h-11 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] " +
  "px-3.5 py-2.5 text-[var(--text-sm)] font-medium text-[var(--color-text-primary)] outline-none " +
  "transition-[border-color,box-shadow] duration-150 " +
  "placeholder:text-[var(--color-text-muted)] " +
  "focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-brand)_25%,transparent)] " +
  "disabled:opacity-60 disabled:bg-[var(--color-surface-raised)]"

export default function SettingsInput({
  label,
  error,
  hint,
  leading,
  id,
  ...props
}: SettingsInputProps) {
  const autoId = useId()
  const inputId = id || autoId
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-[var(--text-xs)] font-bold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
        {label}
      </label>
      <div className="relative">
        {leading ? (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
            {leading}
          </span>
        ) : null}
        <input
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`${fieldClass} ${leading ? "pl-10" : ""}`}
          {...props}
        />
      </div>
      {error ? (
        <p id={errorId} className="text-[var(--text-xs)] font-semibold text-[var(--color-error)]" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-[var(--text-xs)] font-medium text-[var(--color-text-muted)]">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

interface SettingsSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> {
  label: string
  error?: string | null
  options: { value: string; label: string }[]
  placeholder?: string
}

export function SettingsSelect({
  label,
  error,
  options,
  placeholder,
  id,
  ...props
}: SettingsSelectProps) {
  const autoId = useId()
  const selectId = id || autoId
  const errorId = `${selectId}-error`

  return (
    <div className="space-y-1.5">
      <label htmlFor={selectId} className="block text-[var(--text-xs)] font-bold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
        {label}
      </label>
      <select
        id={selectId}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={fieldClass}
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={errorId} className="text-[var(--text-xs)] font-semibold text-[var(--color-error)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
