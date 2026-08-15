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
  const MOOD_ANGLES: Record<string, { start: number; end: number }> = {
    Good: { start: -85, end: 50 },    // Large smooth half-circle arc on the upper-right
    Great: { start: 60, end: 110 },   // Bottom-right arc
    Low: { start: 120, end: 145 },    // Bottom-middle arc
    Meh: { start: 155, end: 195 },    // Bottom-left arc
    Okay: { start: 205, end: 265 },   // Upper-left arc
  }

  const order = ["Good", "Great", "Low", "Meh", "Okay"]
  const orderedMoods = [...moods].sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label))

  const segmentsData = orderedMoods.map((mood) => {
    const angleConfig = MOOD_ANGLES[mood.label] || { start: 0, end: 360 }
    const startAngle = angleConfig.start
    const endAngle = angleConfig.end

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
    const d = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`

    return {
      ...mood,
      d,
    }
  })

  // Calculate coordinates for the "Good" emotion face placed on the green arc
  const goodAngleConfig = MOOD_ANGLES["Good"]
  // Position face upwards near the start edge of the green arc
  const goodEdgeAngle = goodAngleConfig.start + 12
  const goodRad = (goodEdgeAngle * Math.PI) / 180
  const goodFaceX = cx + r * Math.cos(goodRad)
  const goodFaceY = cy + r * Math.sin(goodRad)
  const goodLeftPercent = (goodFaceX / 240) * 100
  const goodTopPercent = (goodFaceY / 240) * 100

  // Calculate coordinates for the "Meh" emotion face placed on the blue arc
  const mehAngleConfig = MOOD_ANGLES["Meh"]
  // Position face near the start edge (bottom side) of the blue arc to match design
  const mehEdgeAngle = mehAngleConfig.start + 12
  const mehRad = (mehEdgeAngle * Math.PI) / 180
  const mehFaceX = cx + r * Math.cos(mehRad)
  const mehFaceY = cy + r * Math.sin(mehRad)
  const mehLeftPercent = (mehFaceX / 240) * 100
  const mehTopPercent = (mehFaceY / 240) * 100

  // Calculate coordinates for the "Low" emotion face placed on the purple arc
  const lowAngleConfig = MOOD_ANGLES["Low"]
  const lowMidAngle = (lowAngleConfig.start + lowAngleConfig.end) / 2
  const lowRad = (lowMidAngle * Math.PI) / 180
  const lowFaceX = cx + r * Math.cos(lowRad)
  const lowFaceY = cy + r * Math.sin(lowRad)
  const lowLeftPercent = (lowFaceX / 240) * 100
  const lowTopPercent = (lowFaceY / 240) * 100

  // Calculate coordinates for the "Okay" emotion face placed on the orange arc
  const okayAngleConfig = MOOD_ANGLES["Okay"]
  // Position face near the start edge (bottom side) of the orange arc to match design
  const okayEdgeAngle = okayAngleConfig.start + 12
  const okayRad = (okayEdgeAngle * Math.PI) / 180
  const okayFaceX = cx + r * Math.cos(okayRad)
  const okayFaceY = cy + r * Math.sin(okayRad)
  const okayLeftPercent = (okayFaceX / 240) * 100
  const okayTopPercent = (okayFaceY / 240) * 100

  // Calculate coordinates for the "Great" emotion face placed on the yellow arc
  const greatAngleConfig = MOOD_ANGLES["Great"]
  // Position face near the start edge (right side) of the yellow arc to match design
  const greatEdgeAngle = greatAngleConfig.start + 12
  const greatRad = (greatEdgeAngle * Math.PI) / 180
  const greatFaceX = cx + r * Math.cos(greatRad)
  const greatFaceY = cy + r * Math.sin(greatRad)
  const greatLeftPercent = (greatFaceX / 240) * 100
  const greatTopPercent = (greatFaceY / 240) * 100

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
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.08" flood-color="#000000" />
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

      {/* Floating Good Emotion Face */}
      <div
        className="absolute w-8 h-8 hover:scale-110 active:scale-95 transition-all duration-300 pointer-events-auto"
        style={{
          left: `${goodLeftPercent}%`,
          top: `${goodTopPercent}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        <Image
          src="https://res.cloudinary.com/dxoiluua8/image/upload/v1786722289/Good-emotion_wrweoi.png"
          alt="Good emotion face"
          width={32}
          height={32}
          className="object-contain w-full h-full drop-shadow-md select-none"
          draggable={false}
        />
      </div>

      {/* Floating Meh Emotion Face */}
      <div
        className="absolute w-8 h-8 hover:scale-110 active:scale-95 transition-all duration-300 pointer-events-auto"
        style={{
          left: `${mehLeftPercent}%`,
          top: `${mehTopPercent}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        <Image
          src="https://res.cloudinary.com/dxoiluua8/image/upload/v1786722289/Meh-emotion_zdlpsd.png"
          alt="Meh emotion face"
          width={32}
          height={32}
          className="object-contain w-full h-full drop-shadow-md select-none"
          draggable={false}
        />
      </div>

      {/* Floating Low Emotion Face */}
      <div
        className="absolute w-8 h-8 hover:scale-110 active:scale-95 transition-all duration-300 pointer-events-auto"
        style={{
          left: `${lowLeftPercent}%`,
          top: `${lowTopPercent}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        <Image
          src="https://res.cloudinary.com/dxoiluua8/image/upload/v1786722289/Low-emotion_pm77jm.png"
          alt="Low emotion face"
          width={32}
          height={32}
          className="object-contain w-full h-full drop-shadow-md select-none"
          draggable={false}
        />
      </div>

      {/* Floating Okay Emotion Face */}
      <div
        className="absolute w-8 h-8 hover:scale-110 active:scale-95 transition-all duration-300 pointer-events-auto"
        style={{
          left: `${okayLeftPercent}%`,
          top: `${okayTopPercent}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        <Image
          src="https://res.cloudinary.com/dxoiluua8/image/upload/v1786722289/Okay-emotion_xb5iql.png"
          alt="Okay emotion face"
          width={32}
          height={32}
          className="object-contain w-full h-full drop-shadow-md select-none"
          draggable={false}
        />
      </div>

      {/* Floating Great Emotion Face */}
      <div
        className="absolute w-8 h-8 hover:scale-110 active:scale-95 transition-all duration-300 pointer-events-auto"
        style={{
          left: `${greatLeftPercent}%`,
          top: `${greatTopPercent}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        <Image
          src="https://res.cloudinary.com/dxoiluua8/image/upload/v1786722289/Great-emotion_q3ouyr.png"
          alt="Great emotion face"
          width={32}
          height={32}
          className="object-contain w-full h-full drop-shadow-md select-none"
          draggable={false}
        />
      </div>

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
