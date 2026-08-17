"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Define calendar items (dates / emotions)
interface CalendarDay {
  date: number
  isCurrentMonth: boolean
  moodImage?: string
  moodLabel?: string
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const SHORT_MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

const MOOD_IMAGE_MAP: Record<string, { label: string; image: string }> = {
  GREAT: { label: "Great", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730508/Great_hbqsmr.png" },
  GOOD: { label: "Good", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730507/Good_qtm32o.png" },
  NEUTRAL: { label: "Okay", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730508/Okay_ikdsom.png" },
  BAD: { label: "Meh", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730508/Meh_fh0ndp.png" },
  VERY_BAD: { label: "Low", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786799140/Low_sujxbx.png" },
}

const MOOD_SUMMARY_CONFIGS: Record<string, {
  title: string
  color: string
  textColor: string
  image: string
  description: string
}> = {
  Good: {
    title: "Good",
    color: "#CEF8A4",
    textColor: "#2E5E1C",
    image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730633/Good-emotion_jimbfs.png",
    description: "Your are feeling clam and optimistic keep it going",
  },
  Great: {
    title: "Great",
    color: "#FCE5AF",
    textColor: "#6B4C0A",
    image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730630/Great-emotion_rbwtzb.png",
    description: "You're having a wonderful month full of energy and joy!",
  },
  Okay: {
    title: "Okay",
    color: "#FFD5B7",
    textColor: "#6B320A",
    image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730633/Okay-emotion_sscj34.png",
    description: "You are maintaining a balanced and stable state.",
  },
  Meh: {
    title: "Meh",
    color: "#C2DDF8",
    textColor: "#1A3E6B",
    image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730630/Meh-emotion_nozhzi.png",
    description: "A bit flat lately. Take some time for yourself to recharge.",
  },
  Low: {
    title: "Low",
    color: "#E9C9FF",
    textColor: "#4E1A6B",
    image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786799192/Low-emotion_vbpanv.png",
    description: "It has been a tough month, but remember support is always near.",
  },
}

export default function MoodTrendsPage() {
  const [month, setMonth] = useState<number>(new Date().getMonth())
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate())
  
  const [dbMoods, setDbMoods] = useState<any[]>([])
  const [dbJournals, setDbJournals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/patient/wellbeing/trends?month=${month}&year=${year}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch wellbeing trends")
        return res.json()
      })
      .then((data) => {
        setDbMoods(data.moods || [])
        setDbJournals(data.journals || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching trends:", err)
        setLoading(false)
      })
  }, [month, year])

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear((y) => y - 1)
    } else {
      setMonth((m) => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0)
      setYear((y) => y + 1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  // Calculate dominant mood of the month
  const getDominantMood = () => {
    if (dbMoods.length === 0) return "Good"

    const counts: Record<string, number> = {
      GREAT: 0,
      GOOD: 0,
      NEUTRAL: 0,
      BAD: 0,
      VERY_BAD: 0,
    }

    dbMoods.forEach((m) => {
      const key = m.mood.toUpperCase()
      if (counts[key] !== undefined) {
        counts[key]++
      }
    })

    let maxKey = "GOOD"
    let maxCount = -1

    const keys = ["GREAT", "GOOD", "NEUTRAL", "BAD", "VERY_BAD"]
    keys.forEach((k) => {
      if (counts[k] > maxCount) {
        maxCount = counts[k]
        maxKey = k
      }
    })

    const keyToLabel: Record<string, string> = {
      GREAT: "Great",
      GOOD: "Good",
      NEUTRAL: "Okay",
      BAD: "Meh",
      VERY_BAD: "Low",
    }

    return keyToLabel[maxKey] || "Good"
  }

  const activeMood = getDominantMood()
  const currentSummary = MOOD_SUMMARY_CONFIGS[activeMood] || MOOD_SUMMARY_CONFIGS["Good"]

  // Generate calendar grid for the selected month and year
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDayOfWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const prevMonthLastDay = new Date(year, month, 0).getDate()
  const calendarDays: CalendarDay[] = []

  // Padding days from previous month
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push({
      date: prevMonthLastDay - i,
      isCurrentMonth: false,
    })
  }

  // Days in current month
  for (let i = 1; i <= daysInMonth; i++) {
    const entriesOnDay = dbMoods.filter((e) => {
      const d = new Date(e.timestamp)
      return d.getDate() === i
    })
    
    let moodImage: string | undefined = undefined
    let moodLabel: string | undefined = undefined
    
    if (entriesOnDay.length > 0) {
      const latestEntry = entriesOnDay[entriesOnDay.length - 1]
      const key = latestEntry.mood.toUpperCase()
      
      const config = MOOD_IMAGE_MAP[key]
      if (config) {
        moodImage = config.image
        moodLabel = config.label
      }
    }

    calendarDays.push({
      date: i,
      isCurrentMonth: true,
      moodImage,
      moodLabel,
    })
  }

  // Padding days from next month to complete 42 elements (6 rows)
  const remaining = 42 - calendarDays.length
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({
      date: i,
      isCurrentMonth: false,
    })
  }

  const handleDayClick = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return
    setSelectedDay(day.date)
  }

  const currentJournals = dbJournals
    .filter((j) => {
      const d = new Date(j.createdAt)
      return d.getDate() === selectedDay
    })
    .map((j) => {
      let moodLabel = "Okay"
      if (j.moodScore >= 8) moodLabel = "Great"
      else if (j.moodScore >= 6) moodLabel = "Good"
      else if (j.moodScore >= 4) moodLabel = "Okay"
      else if (j.moodScore >= 3) moodLabel = "Meh"
      else moodLabel = "Low"

      const themeMap: Record<string, { bg: string; border: string }> = {
        Great: { bg: "bg-[#FCE5AF]/25", border: "border-[#FCE5AF]/40" },
        Good: { bg: "bg-[#CEF8A4]/25", border: "border-[#CEF8A4]/40" },
        Okay: { bg: "bg-[#FFD5B7]/25", border: "border-[#FFD5B7]/40" },
        Meh: { bg: "bg-[#C2DDF8]/25", border: "border-[#C2DDF8]/40" },
        Low: { bg: "bg-[#E9C9FF]/25", border: "border-[#E9C9FF]/40" },
      }

      const theme = themeMap[moodLabel] || themeMap.Okay

      return {
        text: j.content,
        mood: moodLabel,
        bg: theme.bg,
        border: theme.border,
      }
    })

  return (
    <div className="flex-1 w-full h-full overflow-y-auto bg-[#F9F5F0] flex flex-col font-sans select-none pb-20">
      <div className="px-4 py-6 sm:p-8 flex-1 w-full max-w-2xl mx-auto flex flex-col gap-6 md:gap-8">
        
        {/* Header Section */}
        <header className="flex items-center gap-4 w-full">
          <Link href="/patient/wellbeing" className="text-slate-800 hover:text-slate-600 transition-colors">
            <span className="text-xl font-bold mr-1">←</span>
          </Link>
          <h1
            style={{
              fontFamily: "'Geist', sans-serif",
              fontStyle: "normal",
              fontWeight: 600,
              fontSize: "26px",
              lineHeight: "39px",
              letterSpacing: "-0.65px",
              color: "#1E1E2E",
            }}
          >
            Mood Trends
          </h1>
        </header>

        {loading ? (
          <div className="flex-grow flex items-center justify-center py-20">
            <div className="text-[#1E1E2E] font-bold text-lg animate-pulse">
              Loading trends...
            </div>
          </div>
        ) : (
          <>
            {/* Calendar Card */}
            <div className="relative w-full max-w-2xl mx-auto select-none px-0">
              <div className="bg-white rounded-[32px] p-5 sm:px-8 sm:py-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/80 w-full flex flex-col gap-6">
                
                {/* Calendar Selector */}
                <div className="flex justify-between items-center px-2">
                  <button 
                    onClick={handlePrevMonth}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FCE8E6] hover:bg-[#FCDAD6] text-[#A53A35] transition-all duration-200 cursor-pointer shadow-sm active:scale-90"
                  >
                    <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                  </button>
                  
                  <span className="text-base sm:text-lg font-bold text-slate-800 font-sans">
                    {MONTH_NAMES[month]} {year}
                  </span>
                  
                  <button 
                    onClick={handleNextMonth}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FCE8E6] hover:bg-[#FCDAD6] text-[#A53A35] transition-all duration-200 cursor-pointer shadow-sm active:scale-90"
                  >
                    <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="flex flex-col gap-4">
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-x-2 text-center text-xs sm:text-sm font-semibold text-slate-400">
                    <span>Sun</span>
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                  </div>
                  
                  {/* Date Cells */}
                  <div className="grid grid-cols-7 gap-y-3 gap-x-2 text-center items-center">
                    {calendarDays.map((day, idx) => {
                      const isSelected = selectedDay === day.date && day.isCurrentMonth
                      return (
                        <div
                          key={idx}
                          className="aspect-square flex items-center justify-center relative w-full h-10 sm:h-12"
                        >
                          {day.moodImage ? (
                            <div
                              onClick={() => handleDayClick(day)}
                              className={`w-8 h-8 sm:w-10 sm:h-10 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer drop-shadow-sm rounded-full flex items-center justify-center ${
                                isSelected ? "ring-2 ring-indigo-500 ring-offset-2" : ""
                              }`}
                            >
                              <Image
                                src={day.moodImage}
                                alt={day.moodLabel || "mood"}
                                width={40}
                                height={40}
                                className="object-contain w-full h-full"
                              />
                            </div>
                          ) : (
                            <button
                              disabled={!day.isCurrentMonth}
                              onClick={() => handleDayClick(day)}
                              className={`text-sm sm:text-base font-semibold font-sans w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full transition-all active:scale-90 ${
                                !day.isCurrentMonth
                                  ? "text-slate-300 cursor-default"
                                  : isSelected
                                  ? "bg-slate-800 text-white font-extrabold shadow-sm"
                                  : "text-slate-700 hover:bg-slate-50 cursor-pointer"
                              }`}
                            >
                              {day.date}
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

              </div>
            </div>

            {/* Monthly Summary Card */}
            <div
              className="w-full max-w-2xl mx-auto rounded-[32px] p-6 relative overflow-hidden flex flex-row justify-between items-center shadow-[0_10px_30px_rgba(0,0,0,0.02)] select-none transition-all duration-500 ease-in-out border border-white/20"
              style={{ backgroundColor: currentSummary.color }}
            >
              <div className="flex flex-col gap-1 items-start text-left z-10">
                <span
                  className="text-xs sm:text-sm font-bold tracking-wide uppercase opacity-80"
                  style={{ color: currentSummary.textColor }}
                >
                  Monthly Mood Summary
                </span>
                <h2
                  className="text-4xl sm:text-5xl font-black tracking-tight leading-tight"
                  style={{ color: currentSummary.textColor }}
                >
                  {currentSummary.title}
                </h2>
                <p
                  className="text-sm sm:text-base font-bold leading-relaxed mt-2 max-w-[240px] sm:max-w-xs opacity-90"
                  style={{ color: currentSummary.textColor }}
                >
                  {currentSummary.description}
                </p>
              </div>

              {/* Dynamic Mood Face Image */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center select-none pointer-events-none mr-2">
                <Image
                  src={currentSummary.image}
                  alt={`${currentSummary.title} emotion`}
                  width={112}
                  height={112}
                  className="object-contain w-full h-full"
                />
              </div>
            </div>

            {/* Journal Section */}
            <div className="w-full max-w-2xl mx-auto flex flex-col items-start gap-4">
              <h3 className="text-lg font-bold text-slate-800 px-1 font-sans">
                Journal, {String(selectedDay).padStart(2, "0")} {SHORT_MONTH_NAMES[month]}
              </h3>
              
              <div className="flex flex-col gap-3.5 w-full">
                {currentJournals.length === 0 ? (
                  <div className="bg-white border border-slate-100 rounded-[24px] p-8 text-center text-slate-400 font-semibold text-sm sm:text-base shadow-[0_2px_10px_rgba(0,0,0,0.005)] w-full">
                    No journal entry recorded for this day.
                  </div>
                ) : (
                  currentJournals.map((item, idx) => (
                    <div
                      key={idx}
                      className={`${item.bg} border ${item.border} rounded-[24px] p-5 font-semibold text-slate-700 text-sm sm:text-base leading-relaxed text-left shadow-[0_2px_10px_rgba(0,0,0,0.01)]`}
                    >
                      {item.text}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
