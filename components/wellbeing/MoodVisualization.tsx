"use client"

import React from "react"

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

function getArcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  let start = startAngle
  let end = endAngle
  if (end - start < 0.1) {
    end = start + 0.1
  }
  const radStart = (start * Math.PI) / 180
  const radEnd = (end * Math.PI) / 180

  const x1 = cx + r * Math.cos(radStart)
  const y1 = cy + r * Math.sin(radStart)
  const x2 = cx + r * Math.cos(radEnd)
  const y2 = cy + r * Math.sin(radEnd)

  const largeArcFlag = end - start <= 180 ? 0 : 1
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`
}

export default function MoodVisualization({ moods, averageMood }: MoodVisualizationProps) {
  const cx = 120
  const cy = 120
  const r = 88
  const strokeWidth = 32

  const MOOD_COLORS: Record<string, string> = {
    Okay: "#FFD5B7",
    Good: "#CEF8A4",
    Great: "#FCE5AF",
    Meh: "#C2DDF8",
    Low: "#E9C9FF",
  }

  const totalCheckIns = moods.reduce((sum, m) => sum + m.value, 0)

  // Empty state handling fallback within visualization
  if (totalCheckIns === 0) {
    const startAngle = 105
    const endAngle = 435
    const capAngle = ((strokeWidth / 2) / r) * (180 / Math.PI)
    const d = getArcPath(cx, cy, r, startAngle + capAngle, endAngle - capAngle)

    return (
      <div 
        className="flex flex-col items-center justify-center w-full py-4 animate-in fade-in zoom-in-98 duration-200 select-none"
        aria-label="No data available"
      >
        <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-square mx-auto flex items-center justify-center">
          <svg viewBox="0 0 240 240" className="w-full h-full select-none overflow-visible">
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
          <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none select-none">
            <span className="text-[54px] sm:text-[62px] font-bold text-[#4B5563] leading-none tracking-tight">
              0
            </span>
            <span className="text-base sm:text-lg font-semibold text-[#8E9AA6] mt-2">
              Check in
            </span>
          </div>
        </div>
        <div className="text-center font-bold text-[#8E9AA6] text-sm mt-4 leading-normal select-none">
          Insufficient Data
        </div>
      </div>
    )
  }

  // Segment calculation for active data state
  const order = ["Good", "Great", "Low", "Meh", "Okay"]
  const orderedMoods = [...moods].sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label))

  // Spacing gap between segments
  const nonZeroSegments = orderedMoods.filter((m) => m.value > 0).length
  const gapAngle = nonZeroSegments > 1 ? 8 : 0 

  let currentAngle = -90 // Start at top center

  const segmentsData = orderedMoods.map((mood) => {
    if (mood.value === 0) {
      return { ...mood, d: "", emojiX: 0, emojiY: 0, visible: false }
    }

    const percentage = mood.value / totalCheckIns
    const angleSpan = percentage * 360

    const startAngle = currentAngle + gapAngle / 2
    const endAngle = currentAngle + angleSpan - gapAngle / 2

    // Emoji coordinate calculation at the midpoint of segment
    const midAngle = currentAngle + angleSpan / 2
    const rad = (midAngle * Math.PI) / 180
    const emojiX = cx + r * Math.cos(rad)
    const emojiY = cy + r * Math.sin(rad)

    // Adjust angles to fit strokeLinecap="round" overlaps
    const capAngle = ((strokeWidth / 2) / r) * (180 / Math.PI)
    let adjustedStart = startAngle + capAngle
    let adjustedEnd = endAngle - capAngle

    if (adjustedStart >= adjustedEnd) {
      const midAngleAdjusted = (startAngle + endAngle) / 2
      adjustedStart = midAngleAdjusted - 0.1
      adjustedEnd = midAngleAdjusted + 0.1
    }

    const d = getArcPath(cx, cy, r, adjustedStart, adjustedEnd)

    currentAngle += angleSpan

    return {
      ...mood,
      color: mood.color || MOOD_COLORS[mood.label] || "#CEF8A4",
      d,
      emojiX,
      emojiY,
      visible: true,
    }
  })

  return (
    <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-square mx-auto flex items-center justify-center select-none">
      {/* SVG Arc Segments */}
      <svg
        viewBox="0 0 240 240"
        className="w-full h-full select-none overflow-visible animate-in fade-in zoom-in-98 duration-300"
        style={{ overflow: "visible" }}
      >
        <defs>
          <filter id="soft-shadow" filterUnits="userSpaceOnUse" x="0" y="0" width="240" height="240">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.08" floodColor="#000000" />
          </filter>
        </defs>
        {segmentsData.map((seg, idx) => {
          if (!seg.visible) return null
          return (
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
          )
        })}

        {/* Emojis */}
        {segmentsData.map((seg, idx) => {
          if (!seg.visible || !seg.image) return null
          return (
            <image
              key={`emoji-${idx}`}
              href={seg.image}
              x={seg.emojiX - 14}
              y={seg.emojiY - 14}
              width="28"
              height="28"
              className="transition-all duration-500 ease-in-out hover:scale-115 origin-center"
              style={{ transformOrigin: `${seg.emojiX}px ${seg.emojiY}px` }}
            />
          )
        })}
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
