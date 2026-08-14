"use client"

import React from "react"

export default function MonthlyEmptyState() {
  const cx = 120
  const cy = 120
  const r = 80
  const strokeWidth = 24

  // Gap is at the bottom (90 degrees in SVG coordinates is bottom if 0 is right.
  // 105 degrees is bottom-left, 435 (360 + 75) is bottom-right.
  const startAngle = 105
  const endAngle = 435

  const radStart = (startAngle * Math.PI) / 180
  const radEnd = (endAngle * Math.PI) / 180

  const x1 = cx + r * Math.cos(radStart)
  const y1 = cy + r * Math.sin(radStart)
  const x2 = cx + r * Math.cos(radEnd)
  const y2 = cy + r * Math.sin(radEnd)

  const d = `M ${x1} ${y1} A ${r} ${r} 0 1 1 ${x2} ${y2}`

  return (
    <div 
      className="flex flex-col items-center justify-center w-full py-4 animate-in fade-in zoom-in-98 duration-200"
      aria-label="No wellbeing data available for this month"
    >
      <div className="relative w-full max-w-[240px] sm:max-w-[260px] aspect-square mx-auto flex items-center justify-center">
        {/* SVG Arc Ring */}
        <svg
          viewBox="0 0 240 240"
          className="w-full h-full select-none overflow-visible"
        >
          {/* Subtle drop shadow/glow for soft highlight */}
          <defs>
            <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <path
            d={d}
            fill="none"
            stroke="#9CA3AF"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="opacity-80"
            filter="url(#soft-glow)"
          />
        </svg>

        {/* Center Values */}
        <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none select-none">
          <span className="text-[54px] sm:text-[62px] font-semibold text-[#4B5563] leading-none tracking-tight">
            0
          </span>
          <span className="text-base sm:text-lg font-semibold text-[#8E9AA6] mt-2">
            Check in
          </span>
        </div>
      </div>

      {/* Status label under the ring */}
      <div className="text-center font-bold text-[#8E9AA6] text-sm mt-4 leading-normal select-none">
        Insufficient Data
      </div>
    </div>
  )
}
