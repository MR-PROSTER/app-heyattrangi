"use client"

import { useId } from "react"

interface DeleteConfirmationInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export default function DeleteConfirmationInput({
  value,
  onChange,
  disabled = false,
  className = "",
}: DeleteConfirmationInputProps) {
  const id = useId()
  const hintId = `${id}-hint`

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={id} className="text-sm font-semibold text-gray-900">
        Type <span className="font-black tracking-wide">DELETE</span> to confirm
      </label>
      <input
        id={id}
        type="text"
        value={value}
        disabled={disabled}
        autoComplete="off"
        spellCheck={false}
        aria-describedby={hintId}
        placeholder="DELETE"
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900
          outline-none transition-all duration-150 placeholder:text-gray-300
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:opacity-60 disabled:cursor-not-allowed"
      />
      <p id={hintId} className="text-xs font-medium text-gray-500">
        Confirmation is case-sensitive.
      </p>
    </div>
  )
}
