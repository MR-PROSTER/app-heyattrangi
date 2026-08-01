"use client"

import { useId } from "react"

interface PreferenceToggleProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
  "aria-controls"?: string
}

export default function PreferenceToggle({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  className = "",
  "aria-controls": ariaControls,
}: PreferenceToggleProps) {
  const id = useId()
  const descId = `${id}-desc`

  return (
    <div
      className={`flex items-start justify-between gap-4 rounded-xl px-2 py-2.5 -mx-1 transition-colors duration-150 hover:bg-gray-50/80 ${className}`}
    >
      <div className="min-w-0 pt-0.5">
        <label htmlFor={id} className="text-sm font-semibold text-gray-900 cursor-pointer">
          {label}
        </label>
        {description ? (
          <p id={descId} className="mt-0.5 text-xs font-medium text-gray-500 leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-controls={ariaControls}
        aria-expanded={ariaControls ? checked : undefined}
        aria-describedby={description ? descId : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-150
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          motion-reduce:transition-none
          ${checked ? "bg-gray-900" : "bg-gray-300"}`}
      >
        <span
          aria-hidden="true"
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-150
            ${checked ? "translate-x-6" : "translate-x-1"}`}
        />
      </button>
    </div>
  )
}
