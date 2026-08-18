"use client"

import React from "react"
import Image from "next/image"

interface MoodSegment {
  label: string
  value: number
  color: string // stroke color
  bgClass: string // fallback Tailwind background class if needed
  image: string
}

interface MoodVisualizationProps {
  moods: MoodSegment[]
  averageMood: number
}

export default function MoodVisualization({ moods, averageMood }: MoodVisualizationProps) {
  const cx = 120
  const cy = 120
  const r = 88
  const strokeWidth = 32

  // Fixed angles configuration to perfectly replicate the target design (Image 2)
  const MOOD_REGIONS: Record<string, { start: number; end: number }> = {
    Good: { start: -85, end: 50 },    // Large smooth half-circle arc on the upper-right
    Great: { start: 60, end: 110 },   // Bottom-right arc
    Low: { start: 120, end: 145 },    // Bottom-middle arc
    Meh: { start: 155, end: 195 },    // Bottom-left arc
    Okay: { start: 205, end: 265 },   // Upper-left arc
  }

  const MOOD_COLORS: Record<string, string> = {
    Okay: "#FFD5B7",
    Good: "#CEF8A4",
    Great: "#FCE5AF",
    Meh: "#C2DDF8",
    Low: "#E9C9FF",
  }

  const order = ["Good", "Great", "Low", "Meh", "Okay"]
  const orderedMoods = [...moods].sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label))

  // Proportional arc scaling parameters
  const MAX_DYNAMIC_SPAN = 90
  const MIN_DYNAMIC_SPAN = 5
  const maxCount = Math.max(...moods.map((mood) => mood.value), 1)

  const segmentsData = orderedMoods.map((mood) => {
    const region = MOOD_REGIONS[mood.label] || { start: 0, end: 360 }
    const originalStart = region.start
    const originalEnd = region.end
    const originalSpan = originalEnd - originalStart

    // If count is 0, path won't be rendered. Otherwise, scale it proportionally.
    let startAngle = 0
    let endAngle = 0
    let d = ""

    if (mood.value > 0) {
      const ratio = mood.value / maxCount
      
      // Calculate span using the common visual scale
      let spanDegrees = Math.max(MIN_DYNAMIC_SPAN, ratio * MAX_DYNAMIC_SPAN)

      // Overlap protection: clamp the calculated span to the available original region size
      if (spanDegrees > originalSpan) {
        spanDegrees = originalSpan
      }

      // Center the dynamic arc within its original visual region
      const centerAngle = (originalStart + originalEnd) / 2
      startAngle = centerAngle - spanDegrees / 2
      endAngle = centerAngle + spanDegrees / 2

      // SVG path generation with stroke-linecap round adjustments
      const capAngle = ((strokeWidth / 2) / r) * (180 / Math.PI)
      let adjustedStart = startAngle + capAngle
      let adjustedEnd = endAngle - capAngle

      // Fallback if segment is extremely small
      if (adjustedStart >= adjustedEnd) {
        const midAngle = (startAngle + endAngle) / 2
        adjustedStart = midAngle - 0.1
        adjustedEnd = midAngle + 0.1
      }

      const radStart = (adjustedStart * Math.PI) / 180
      const radEnd = (adjustedEnd * Math.PI) / 180

      const x1 = cx + r * Math.cos(radStart)
      const y1 = cy + r * Math.sin(radStart)
      const x2 = cx + r * Math.cos(radEnd)
      const y2 = cy + r * Math.sin(radEnd)

      const largeArcFlag = adjustedEnd - adjustedStart <= 180 ? 0 : 1
      d = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`
    }

    return {
      ...mood,
      color: mood.color || MOOD_COLORS[mood.label] || "#CEF8A4",
      d,
    }
  })

  return (
    <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-square mx-auto flex items-center justify-center">
      {/* SVG Arc Segments */}
      <svg
        viewBox="0 0 240 240"
        className="w-full h-full select-none overflow-visible"
        style={{ overflow: "visible" }}
      >
        <defs>
          <filter id="soft-shadow" filterUnits="userSpaceOnUse" x="0" y="0" width="240" height="240">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.08" floodColor="#000000" />
          </filter>
        </defs>
        {segmentsData.map((seg, idx) => (
          <path
            key={idx}
            d={seg.d}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter="url(#soft-shadow)"
            className="transition-all duration-500 ease-in-out"
          />
        ))}
      </svg>

      {/* Center Label */}
      <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none select-none">
        <span className="text-[52px] sm:text-[60px] font-bold text-[#73A730] leading-none tracking-tight">
          {averageMood.toFixed(1)}
        </span>
        <span className="text-base sm:text-lg font-semibold text-slate-500 mt-1">
          Avg mood
        </span>
      </div>
    </div>
  )
}
