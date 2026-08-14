"use client"

import React, { useState, useRef, useEffect } from "react"
import { Calendar } from "lucide-react"

interface WeekSelectorProps {
  weeks: number[]
  selectedWeek: number
  onSelectWeek: (week: number) => void
}

export default function WeekSelector({ weeks, selectedWeek, onSelectWeek }: WeekSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className="relative z-30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select week"
        className="flex items-center gap-3 border border-slate-200 bg-white pl-4 pr-1.5 py-1.5 rounded-full shadow-sm hover:shadow-md hover:bg-slate-50 transition-all font-bold text-slate-600 text-sm select-none cursor-pointer"
      >
        <span className="tracking-wide text-slate-500 font-bold">Week</span>
        <div className="w-8 h-8 rounded-full bg-[#2A1810] hover:bg-[#3d2417] flex items-center justify-center text-white shrink-0 shadow-sm transition-all duration-200">
          <Calendar className="w-4 h-4" />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <ul
          role="listbox"
          className="absolute right-0 mt-2 w-36 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-40 focus:outline-none animate-in fade-in slide-in-from-top-1 duration-200"
        >
          {weeks.map((week) => (
            <li key={week}>
              <button
                role="option"
                aria-selected={week === selectedWeek}
                onClick={() => {
                  onSelectWeek(week)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors duration-200
                  ${week === selectedWeek
                    ? "bg-[#EFF4FF] text-[#3B82F6]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }
                `}
              >
                Week {week}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
