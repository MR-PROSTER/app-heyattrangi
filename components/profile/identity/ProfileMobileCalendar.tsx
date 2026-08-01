"use client"

import { useMemo, useState } from "react"
import { getMindMatrixProfileState } from "@/data/mindMatrixProfile"

type CalView = "day" | "week" | "month"

interface ProfileMobileCalendarProps {
  className?: string
  onClose?: () => void
}

const WEEKDAYS = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"] as const

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
}

/** Monday-first weekday index 0–6 */
function mondayIndex(d: Date) {
  return (d.getDay() + 6) % 7
}

function isoDay(y: number, m: number, day: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export default function ProfileMobileCalendar({
  className = "",
  onClose,
}: ProfileMobileCalendarProps) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()))
  const [view, setView] = useState<CalView>("month")
  const [selected, setSelected] = useState(() => new Date().getDate())

  const marked = useMemo(() => {
    const state = getMindMatrixProfileState()
    const map = new Map<string, "orange" | "red">()
    state.history.forEach((item, index) => {
      map.set(item.date, index === 0 ? "orange" : "red")
    })
    if (state.latest) map.set(state.latest.date, "orange")
    return map
  }, [])

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const label = cursor
    .toLocaleDateString("en-US", { month: "short", year: "numeric" })
    .toUpperCase()

  const leading = mondayIndex(startOfMonth(cursor))
  const total = daysInMonth(cursor)
  const prevTotal = daysInMonth(new Date(year, month - 1, 1))

  const cells: { day: number; inMonth: boolean; iso: string }[] = []
  for (let i = 0; i < leading; i++) {
    const day = prevTotal - leading + 1 + i
    const prev = new Date(year, month - 1, day)
    cells.push({
      day,
      inMonth: false,
      iso: isoDay(prev.getFullYear(), prev.getMonth(), day),
    })
  }
  for (let day = 1; day <= total; day++) {
    cells.push({ day, inMonth: true, iso: isoDay(year, month, day) })
  }
  while (cells.length % 7 !== 0) {
    const day = cells.length - (leading + total) + 1
    const next = new Date(year, month + 1, day)
    cells.push({
      day,
      inMonth: false,
      iso: isoDay(next.getFullYear(), next.getMonth(), day),
    })
  }

  const today = new Date()
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month

  const shiftMonth = (delta: number) => {
    setCursor(new Date(year, month + delta, 1))
    setSelected(1)
  }

  return (
    <section
      className={`rounded-t-[28px] bg-white shadow-[0_-8px_32px_rgba(15,23,42,0.06)] ${className}`}
      aria-label="Profile calendar"
    >
      <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close calendar"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-500
            hover:bg-gray-50 transition-colors duration-150
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div
          role="tablist"
          aria-label="Calendar view"
          className="inline-flex rounded-full bg-gray-100 p-1"
        >
          {(["day", "week", "month"] as const).map((key) => {
            const active = view === key
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setView(key)}
                className={`min-h-9 rounded-full px-4 text-sm font-bold capitalize transition-colors duration-150
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                  ${active ? "bg-[#4A6CF7] text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
              >
                {key}
              </button>
            )
          })}
        </div>

        <span className="w-10" aria-hidden="true" />
      </div>

      <div className="flex items-center justify-between px-5 pb-3">
        <h3 className="text-base font-black tracking-wide text-gray-900">{label}</h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => shiftMonth(-1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-50
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => shiftMonth(1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-50
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            ›
          </button>
        </div>
      </div>

      {(view === "month" || view === "week") && (
        <div className="mx-4 mb-4 rounded-2xl border border-gray-100 p-3">
          <div className="mb-2 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d) => (
              <span
                key={d}
                className="text-center text-[10px] font-bold uppercase tracking-wider text-gray-400"
              >
                {d}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {(view === "week"
              ? (() => {
                  const todayIdx = cells.findIndex(
                    (c) => c.inMonth && isCurrentMonth && c.day === today.getDate()
                  )
                  const row = Math.max(0, Math.floor((todayIdx >= 0 ? todayIdx : leading) / 7))
                  return cells.slice(row * 7, row * 7 + 7)
                })()
              : cells
            ).map((cell) => {
              const isSelected = cell.inMonth && cell.day === selected
              const mark = cell.inMonth ? marked.get(cell.iso) : undefined
              return (
                <button
                  key={`${cell.iso}-${cell.inMonth}`}
                  type="button"
                  disabled={!cell.inMonth}
                  onClick={() => cell.inMonth && setSelected(cell.day)}
                  className={`relative flex h-10 items-center justify-center rounded-full text-sm font-semibold
                    transition-colors duration-150
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                    ${!cell.inMonth ? "text-gray-300" : isSelected ? "bg-gray-900 text-white" : "text-gray-900 hover:bg-gray-50"}`}
                >
                  {cell.day}
                  {mark && !isSelected ? (
                    <span
                      className={`absolute bottom-1 h-0.5 w-3 rounded-full ${
                        mark === "orange" ? "bg-orange-500" : "bg-rose-500"
                      }`}
                      aria-hidden="true"
                    />
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {view === "day" && (
        <div className="mx-4 mb-4 rounded-2xl border border-gray-100 px-4 py-6 text-center">
          <p className="text-3xl font-black text-gray-900 tabular-nums">{selected}</p>
          <p className="mt-1 text-sm font-medium text-gray-500">{label}</p>
        </div>
      )}
    </section>
  )
}
