"use client"

import { useMemo } from "react"
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import { motion } from "framer-motion"
import type { MoodEntryRow } from "./MoodTrackerClient"

interface MoodHistoryProps {
  entries: MoodEntryRow[]
}

export default function MoodHistory({ entries }: MoodHistoryProps) {
  // 1. Line Graph Data (Last 7 days)
  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(new Date(), 6 - i)
      const dayEntries = entries.filter((e) => isSameDay(new Date(e.timestamp), date))
      const avgScore = dayEntries.length > 0
        ? dayEntries.reduce((acc, curr) => acc + curr.moodScore, 0) / dayEntries.length
        : null
      return {
        date,
        label: format(date, "EEE"),
        score: avgScore
      }
    })
  }, [entries])

  // 2. Calendar Data (Current Month)
  const calendarDays = useMemo(() => {
    const start = startOfMonth(new Date())
    const end = endOfMonth(new Date())
    return eachDayOfInterval({ start, end })
  }, [])

  // Line Graph SVG Path calculation
  const chartHeight = 120
  const chartWidth = 400

  const last7DaysWithPoints = useMemo(() => {
    return last7Days.map((d, i) => {
      const score = d.score !== null ? d.score : 5 // fallback to 5 for continuous curve
      const x = (i / (last7Days.length - 1)) * chartWidth
      const y = chartHeight - ((score - 1) / 9) * (chartHeight - 40) - 20 // leave top/bottom margins
      return { ...d, x, y, score }
    })
  }, [last7Days])

  const curvePath = useMemo(() => {
    if (last7DaysWithPoints.length < 2) return ""
    let path = `M ${last7DaysWithPoints[0].x} ${last7DaysWithPoints[0].y}`
    for (let i = 0; i < last7DaysWithPoints.length - 1; i++) {
      const p0 = last7DaysWithPoints[i]
      const p1 = last7DaysWithPoints[i + 1]
      const cpX1 = p0.x + (p1.x - p0.x) / 2
      const cpY1 = p0.y
      const cpX2 = p0.x + (p1.x - p0.x) / 2
      const cpY2 = p1.y
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`
    }
    return path
  }, [last7DaysWithPoints])

  const areaPath = useMemo(() => {
    if (!curvePath) return ""
    return `${curvePath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`
  }, [curvePath])

  // Highlight index 3 (Thursday/Friday or middle of the week)
  const highlightIndex = 3
  const highlightedDay = last7DaysWithPoints[highlightIndex]

  const leftPercent = (highlightedDay.x / chartWidth) * 100
  const topPercent = (highlightedDay.y / chartHeight) * 100

  return (
    <div className="space-y-8 pb-10">
      
      {/* Split Dashboard Row */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-stretch">
        
        {/* 1. Curved Progress/Activity Card */}
        <section className="rounded-[2.5rem] border border-[var(--color-border)] bg-white p-8 shadow-sm flex flex-col justify-between relative overflow-hidden min-h-[350px]">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Activity</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">today</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-green-500 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                10% ↑ than yesterday
              </span>
            </div>
          </div>

          <div className="relative flex-1 mt-6">
            {/* Smooth SVG Chart */}
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-full w-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="purple-area-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#db2777" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="purple-line-gradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="50%" stopColor="#db2777" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((line) => (
                <line key={line} x1="0" y1={(line / 100) * chartHeight} x2={chartWidth} y2={(line / 100) * chartHeight} stroke="#f3f4f6" strokeWidth="1" />
              ))}
              
              {/* Vertical dotted highlight line */}
              <line
                x1={highlightedDay.x}
                y1={highlightedDay.y}
                x2={highlightedDay.x}
                y2={chartHeight}
                stroke="#db2777"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* The Area under the curve */}
              {areaPath && (
                <path d={areaPath} fill="url(#purple-area-gradient)" />
              )}

              {/* The Curve */}
              {curvePath && (
                <path
                  d={curvePath}
                  fill="none"
                  stroke="url(#purple-line-gradient)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              )}
              
              {/* Interactive Point on Curve */}
              <circle
                cx={highlightedDay.x}
                cy={highlightedDay.y}
                r="5"
                fill="white"
                stroke="#db2777"
                strokeWidth="3.5"
              />
            </svg>

            {/* Floating Pink Pill Bubble */}
            <div
              className="absolute bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[10px] font-black px-3.5 py-1.5 rounded-full shadow-lg shadow-pink-100 -translate-x-1/2 -translate-y-[135%] flex items-center justify-center whitespace-nowrap after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-pink-500"
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
              }}
            >
              {highlightedDay.score.toFixed(1)} avg
            </div>
          </div>

          {/* X-Axis Labels */}
          <div className="mt-4 flex justify-between border-t border-gray-100 pt-4">
            {last7DaysWithPoints.map((d) => (
              <span key={d.label} className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                {d.label}
              </span>
            ))}
          </div>
        </section>

        {/* 2. Compact Small Calendar Card */}
        <section className="rounded-[2.5rem] border border-[var(--color-border)] bg-white p-6 shadow-sm flex flex-col justify-between min-h-[350px]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-black text-gray-900 tracking-tight">{format(new Date(), "MMMM yyyy")}</h3>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
              <span key={day} className="text-center text-[10px] font-black text-gray-400 mb-1">
                {day}
              </span>
            ))}

            {/* Prepend empty placeholders for week offset */}
            {Array.from({ length: startOfMonth(new Date()).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {calendarDays.map((date) => {
              const dayEntries = entries.filter((e) => isSameDay(new Date(e.timestamp), date))
              const hasEntry = dayEntries.length > 0
              const avgScore = hasEntry
                ? dayEntries.reduce((acc, curr) => acc + curr.moodScore, 0) / dayEntries.length
                : null
              
              const isToday = isSameDay(new Date(), date)
              
              return (
                <div
                  key={date.toISOString()}
                  className="group relative flex aspect-square items-center justify-center rounded-[14px] text-[10px] font-black transition-all hover:scale-[1.05] cursor-pointer shadow-sm border border-orange-50/10"
                  style={{
                    backgroundColor: isToday
                      ? "var(--color-brand)" 
                      : avgScore 
                      ? `rgba(232, 114, 42, ${Math.min(0.9, (avgScore / 10) + 0.15)})` 
                      : "#fff5ee", 
                    color: isToday || avgScore ? "white" : "#92400e", 
                  }}
                >
                  {format(date, "d")}
                  {hasEntry && !isToday && (
                    <div className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--color-brand)]" />
                  )}
                </div>
              )
            })}
          </div>
        </section>

      </div>

      {/* 3. Recent Logs */}
      <section>
        <h3 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">Recent Entries</h3>
        <div className="space-y-4">
          {entries.slice(0, 10).map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">
                  {e.mood === "VERY_BAD" ? "😞" : e.mood === "BAD" ? "😕" : e.mood === "NEUTRAL" ? "😐" : e.mood === "GOOD" ? "🙂" : "😄"}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-[var(--color-text-primary)]">
                      {format(new Date(e.timestamp), "EEEE, MMM d")}
                    </p>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {format(new Date(e.timestamp), "h:mm a")}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {e.tags.map((t) => (
                      <span key={t} className="rounded-full bg-[var(--color-surface-raised)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {e.note && (
                <p className="mt-3 text-sm italic text-[var(--color-text-secondary)] border-l-2 border-[var(--color-brand)] pl-3">
                  "{e.note}"
                </p>
              )}
            </motion.div>
          ))}
          {entries.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-[var(--color-text-secondary)]">No entries yet. Start your journey today!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
