"use client"

import React from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, FileText } from "lucide-react"
import MoodVisualization from "./MoodVisualization"
import MoodLegend from "./MoodLegend"
import MonthlyEmptyState from "./MonthlyEmptyState"

interface MoodSegment {
  label: string
  value: number
  color: string
  bgClass: string
  image: string
}

interface MonthlyWellbeingProps {
  monthLabel: string
  averageMood: number
  moods: MoodSegment[]
  onPrevMonth: () => void
  onNextMonth: () => void
  isPrevDisabled: boolean
  isNextDisabled: boolean
  hasData?: boolean
}

export default function MonthlyWellbeing({
  monthLabel,
  averageMood,
  moods,
  onPrevMonth,
  onNextMonth,
  isPrevDisabled,
  isNextDisabled,
  hasData = true,
}: MonthlyWellbeingProps) {
  return (
    <div className="relative w-full max-w-2xl mx-auto select-none px-4 sm:px-6">
      {/* Main White Card with key transition */}
      <div 
        key={monthLabel}
        className="bg-white rounded-[32px] p-5 sm:px-8 sm:py-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/80 w-full flex flex-col gap-4 relative animate-in fade-in slide-in-from-right-3 duration-200"
      >
        
        {/* Card Header: Month title & History Button */}
        <div className="flex justify-between items-center">
          <span className="text-sm sm:text-base font-extrabold text-[#7A8B99] tracking-wide">
            {monthLabel}
          </span>
          
          <Link href="/patient/journal?tab=history">
            <button
              aria-label="View wellbeing history"
              className="w-9 h-9 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563] flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {hasData ? (
          <>
            {/* Circular Mood Visualization */}
            <div className="py-0">
              <MoodVisualization moods={moods} averageMood={averageMood} />
            </div>

            {/* Mood Distribution / Legend */}
            <div className="border-t border-slate-100 pt-3">
              <MoodLegend moods={moods} />
            </div>
          </>
        ) : (
          <MonthlyEmptyState />
        )}
      </div>

      {/* Previous Month Button (Overlayed absolutely on the left border) */}
      <button
        onClick={onPrevMonth}
        disabled={isPrevDisabled}
        aria-label="Previous month"
        className={`absolute left-4 sm:left-6 md:left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-[#FCE8E6] hover:bg-[#FCDAD6] text-[#A53A35] z-20 transition-all duration-200 cursor-pointer shadow-md border border-white/50
          ${isPrevDisabled ? "opacity-35 pointer-events-none" : "active:scale-90"}
        `}
      >
        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
      </button>

      {/* Next Month Button (Overlayed absolutely on the right border) */}
      <button
        onClick={onNextMonth}
        disabled={isNextDisabled}
        aria-label="Next month"
        className={`absolute right-4 sm:right-6 md:right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-[#FCE8E6] hover:bg-[#FCDAD6] text-[#A53A35] z-20 transition-all duration-200 cursor-pointer shadow-md border border-white/50
          ${isNextDisabled ? "opacity-35 pointer-events-none" : "active:scale-90"}
        `}
      >
        <ChevronRight className="w-5 h-5 stroke-[2.5]" />
      </button>
    </div>
  )
}
