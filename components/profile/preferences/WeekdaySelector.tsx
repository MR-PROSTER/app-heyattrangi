"use client"

import type { WeekdayKey } from "./preferenceStorage"
import { WEEKDAYS } from "./preferenceStorage"

interface WeekdaySelectorProps {
  value: WeekdayKey[]
  onChange: (next: WeekdayKey[]) => void
  className?: string
}

export default function WeekdaySelector({
  value,
  onChange,
  className = "",
}: WeekdaySelectorProps) {
  const toggle = (key: WeekdayKey) => {
    if (value.includes(key)) {
      if (value.length <= 1) return // keep at least one day
      onChange(value.filter((d) => d !== key))
    } else {
      onChange([...value, key])
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
        Weekdays
      </p>
      <div
        role="group"
        aria-label="Reminder weekdays"
        className="flex flex-wrap gap-2"
      >
        {WEEKDAYS.map((day) => {
          const selected = value.includes(day.key)
          return (
            <button
              key={day.key}
              type="button"
              aria-pressed={selected}
              onClick={() => toggle(day.key)}
              className={`min-h-11 min-w-[2.75rem] rounded-full px-3 py-2 text-xs font-bold transition-colors duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                ${
                  selected
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {day.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
