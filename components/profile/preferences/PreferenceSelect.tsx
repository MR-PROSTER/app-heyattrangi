"use client"

import { useId } from "react"

interface PreferenceSelectOption {
  value: string
  label: string
}

interface PreferenceSelectProps {
  label: string
  value: string
  options: PreferenceSelectOption[]
  onChange: (value: string) => void
  description?: string
  className?: string
}

export default function PreferenceSelect({
  label,
  value,
  options,
  onChange,
  description,
  className = "",
}: PreferenceSelectProps) {
  const id = useId()
  const descId = `${id}-desc`

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={id} className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          aria-describedby={description ? descId : undefined}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-11 appearance-none rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 pr-10
            text-sm font-semibold text-gray-900 outline-none transition-[border-color,box-shadow] duration-150
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            hover:border-gray-300"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {description ? (
        <p id={descId} className="text-xs font-medium text-gray-500">
          {description}
        </p>
      ) : null}
    </div>
  )
}
