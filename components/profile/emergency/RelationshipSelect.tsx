"use client"

import { useId } from "react"
import { RELATIONSHIP_OPTIONS } from "./emergencyUtils"

interface RelationshipSelectProps {
  id?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: string | null
  onKeyDown?: (e: React.KeyboardEvent<HTMLSelectElement>) => void
  className?: string
}

export default function RelationshipSelect({
  id,
  value,
  onChange,
  disabled = false,
  error = null,
  onKeyDown,
  className = "",
}: RelationshipSelectProps) {
  const autoId = useId()
  const selectId = id || autoId
  const errorId = `${selectId}-error`

  return (
    <div className={`relative ${className}`}>
      <select
        id={selectId}
        value={value}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium
          appearance-none outline-none transition-all duration-150
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:opacity-60"
      >
        <option value="">Select relationship…</option>
        {RELATIONSHIP_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div
        className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
        aria-hidden="true"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {error ? (
        <p id={errorId} className="mt-1.5 text-xs font-semibold text-red-500" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
