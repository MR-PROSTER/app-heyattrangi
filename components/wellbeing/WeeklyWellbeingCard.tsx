"use client"

import React from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, FileText } from "lucide-react"
import MoodVisualization from "./MoodVisualization"
import MoodLegend from "./MoodLegend"

interface MoodSegment {
  label: string
  value: number
  color: string
  bgClass: string
  image: string
}

interface WeeklyWellbeingCardProps {
  weekLabel: string
  averageMood: number
  moods: MoodSegment[]
  onPrevWeek: () => void
  onNextWeek: () => void
  isPrevDisabled: boolean
  isNextDisabled: boolean
}

export default function WeeklyWellbeingCard({
  weekLabel,
  averageMood,
  moods,
  onPrevWeek,
  onNextWeek,
  isPrevDisabled,
  isNextDisabled,
}: WeeklyWellbeingCardProps) {
  return (
    <div className="relative w-full max-w-2xl mx-auto select-none">
      {/* Main White Card */}
      <div className="bg-white rounded-[32px] p-5 sm:px-8 sm:py-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/80 w-full flex flex-col gap-4 relative">
        
        {/* Card Header: Week title & History Button */}
        <div className="flex justify-between items-center">
          <span className="text-sm sm:text-base font-extrabold text-[#7A8B99] tracking-wide">
            {weekLabel}
          </span>
          
          <Link href="/patient/journal?tab=history">
            <button
              aria-label="View wellbeing history"
              className="relative w-9 h-9 bg-transparent border border-black rounded-full text-slate-800 hover:text-black hover:bg-slate-50/50 transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  position: "absolute",
                  width: "22px",
                  height: "22px",
                  left: "calc(50% - 22px / 2)",
                  top: "calc(50% - 22px / 2)"
                }}
              >
                <path
                  d="M9 11v6m0 0l-2-2m2 2l2-2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 10v5c0 5-2 7-7 7H9c-5 0-7-2-7-7V9c0-5 2-7 7-7h5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 10h-4c-3 0-4-1-4-4V2l8 8z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </Link>
        </div>

        {/* Circular Mood Visualization */}
        <div className="py-0">
          <MoodVisualization moods={moods} averageMood={averageMood} />
        </div>

        {/* Mood Distribution / Legend */}
        <div className="border-t border-slate-100 pt-3">
          <MoodLegend moods={moods} />
        </div>
      </div>

      {/* Previous Week Button (Overlayed absolutely on the left border) */}
      <button
        onClick={onPrevWeek}
        disabled={isPrevDisabled}
        aria-label="Previous week"
        className={`absolute left-4 sm:left-6 md:left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-[#FCE8E6] hover:bg-[#FCDAD6] text-[#A53A35] z-20 transition-all duration-200 cursor-pointer shadow-md border border-white/50
          ${isPrevDisabled ? "opacity-35 pointer-events-none" : "active:scale-90"}
        `}
      >
        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
      </button>

      {/* Next Week Button (Overlayed absolutely on the right border) */}
      <button
        onClick={onNextWeek}
        disabled={isNextDisabled}
        aria-label="Next week"
        className={`absolute right-4 sm:right-6 md:right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-[#FCE8E6] hover:bg-[#FCDAD6] text-[#A53A35] z-20 transition-all duration-200 cursor-pointer shadow-md border border-white/50
          ${isNextDisabled ? "opacity-35 pointer-events-none" : "active:scale-90"}
        `}
      >
        <ChevronRight className="w-5 h-5 stroke-[2.5]" />
      </button>
    </div>
  )
}
