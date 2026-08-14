"use client"

import React from "react"

interface LegendItem {
  label: string
  value: number
  color: string
}

interface MoodLegendProps {
  moods: LegendItem[]
}

export default function MoodLegend({ moods }: MoodLegendProps) {
  // Order of legend items: Okay -> Good -> Great -> Meh -> Low
  const displayOrder = ["Okay", "Good", "Great", "Meh", "Low"]
  const sortedMoods = [...moods].sort(
    (a, b) => displayOrder.indexOf(a.label) - displayOrder.indexOf(b.label)
  )

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-2 py-1 select-none">
      {sortedMoods.map((mood) => (
        <div
          key={mood.label}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 transition-colors duration-200"
        >
          {/* Dot with matching color */}
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: mood.color }}
          />
          <span>
            {mood.label} <span className="text-slate-300 mx-0.5">·</span> <span className="text-slate-600 font-bold">{mood.value}</span>
          </span>
        </div>
      ))}
    </div>
  )
}
