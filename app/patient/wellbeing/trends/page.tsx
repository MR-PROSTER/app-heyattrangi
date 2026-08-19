"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Define calendar items (dates / emotions)
interface CalendarDay {
  date: number
  isCurrentMonth: boolean
  dateKey: string
  moodImage?: string
  moodLabel?: string
}

interface MoodRecord {
  mood: string
  moodScore?: number | null
  timestamp: string
}

interface JournalRecord {
  content: string
  moodScore?: number | null
  createdAt: string
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

const MOOD_IMAGE_MAP: Record<string, { label: string; image: string }> = {
  LOW: { label: "Low", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786799140/Low_sujxbx.png" },
  MEH: { label: "Meh", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730508/Meh_fh0ndp.png" },
  OKAY: { label: "Okay", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730508/Okay_ikdsom.png" },
  GOOD: { label: "Good", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730507/Good_qtm32o.png" },
  GREAT: { label: "Great", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730508/Great_hbqsmr.png" },
  NEUTRAL: { label: "Okay", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730508/Okay_ikdsom.png" },
  BAD: { label: "Meh", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730508/Meh_fh0ndp.png" },
  VERY_BAD: { label: "Low", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786799140/Low_sujxbx.png" },
}

function getDefaultSelectedDayKey(targetMonth: number, targetYear: number) {
  const now = new Date()
  if (now.getFullYear() === targetYear && now.getMonth() === targetMonth) {
    return format(now, "yyyy-MM-dd")
  }
  return format(new Date(targetYear, targetMonth, 1), "yyyy-MM-dd")
}

function getNormalizedTrendsMood(mood: string, moodScore?: number | null): string {
  const key = mood.toUpperCase().trim()
  if (key === "GREAT" || key === "HAPPY" || key === "EXCITED") return "GREAT"
  if (key === "GOOD" || key === "CALM") return "GOOD"
  if (key === "OKAY" || key === "NEUTRAL") return "OKAY"
  if (key === "MEH" || key === "BAD" || key === "TIRED" || key === "SAD" || key === "ANXIOUS") return "MEH"
  if (key === "LOW" || key === "VERY_BAD" || key === "STRESSED" || key === "ANGRY") return "LOW"

  if (typeof moodScore === "number") {
    if (moodScore > 4) {
      if (moodScore >= 8) return "GREAT"
      if (moodScore >= 6) return "GOOD"
      if (moodScore >= 4) return "OKAY"
      if (moodScore >= 3) return "MEH"
      return "LOW"
    } else {
      if (moodScore === 4) return "GREAT"
      if (moodScore === 3) return "GOOD"
      if (moodScore === 2) return "OKAY"
      if (moodScore === 1) return "MEH"
      if (moodScore === 0) return "LOW"
    }
  }
  return "OKAY"
}

function getMoodScore(mood: MoodRecord) {
  if (typeof mood.moodScore === "number") return mood.moodScore

  const normalized = getNormalizedTrendsMood(mood.mood, mood.moodScore)
  switch (normalized) {
    case "GREAT":
      return 4
    case "GOOD":
      return 3
    case "OKAY":
      return 2
    case "MEH":
      return 1
    case "LOW":
      return 0
    default:
      return 2
  }
}

function getMoodSummaryFromAverage(average: number) {
  if (average >= 3.5) return MOOD_SUMMARY_CONFIGS.Great
  if (average >= 2.5) return MOOD_SUMMARY_CONFIGS.Good
  if (average >= 1.5) return MOOD_SUMMARY_CONFIGS.Okay
  if (average >= 0.5) return MOOD_SUMMARY_CONFIGS.Meh
  return MOOD_SUMMARY_CONFIGS.Low
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
  const [selectedDayKey, setSelectedDayKey] = useState<string>(format(new Date(), "yyyy-MM-dd"))

  const [dbMoods, setDbMoods] = useState<MoodRecord[]>([])
  const [dbJournals, setDbJournals] = useState<JournalRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/patient/wellbeing/trends?month=${month}&year=${year}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch wellbeing trends")
        return res.json()
      })
      .then((data) => {
        setDbMoods(data.moods || [])
        setDbJournals(data.journals || [])
        setSelectedDayKey(getDefaultSelectedDayKey(month, year))
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching trends:", err)
        setLoading(false)
      })
  }, [month, year])

  const handlePrevMonth = () => {
    setLoading(true)
    if (month === 0) {
      setMonth(11)
      setYear((y) => y - 1)
    } else {
      setMonth((m) => m - 1)
    }
    const targetMonth = month === 0 ? 11 : month - 1
    const targetYear = month === 0 ? year - 1 : year
    setSelectedDayKey(getDefaultSelectedDayKey(targetMonth, targetYear))
  }

  const handleNextMonth = () => {
    setLoading(true)
    if (month === 11) {
      setMonth(0)
      setYear((y) => y + 1)
    } else {
      setMonth((m) => m + 1)
    }
    const targetMonth = month === 11 ? 0 : month + 1
    const targetYear = month === 11 ? year + 1 : year
    setSelectedDayKey(getDefaultSelectedDayKey(targetMonth, targetYear))
  }

  const monthMoodAverage = dbMoods.length > 0
    ? dbMoods.reduce((sum, mood) => sum + getMoodScore(mood), 0) / dbMoods.length
    : null
  const currentSummary = monthMoodAverage !== null
    ? getMoodSummaryFromAverage(monthMoodAverage)
    : null
  const selectedDate = new Date(selectedDayKey)
  const selectedMonthLabel = Number.isNaN(selectedDate.getTime())
    ? MONTH_NAMES[month]
    : MONTH_NAMES[selectedDate.getMonth()]
  const selectedDayLabel = Number.isNaN(selectedDate.getTime())
    ? String(new Date().getDate()).padStart(2, "0")
    : String(selectedDate.getDate()).padStart(2, "0")

  // Generate calendar grid for the selected month and year
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDayOfWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const prevMonthLastDay = new Date(year, month, 0).getDate()
  const calendarDays: CalendarDay[] = []

  // Padding days from previous month
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = prevMonthLastDay - i
    calendarDays.push({
      date,
      isCurrentMonth: false,
      dateKey: format(new Date(year, month, date), "yyyy-MM-dd"),
    })
  }

  // Days in current month
  for (let i = 1; i <= daysInMonth; i++) {
    const dateKey = format(new Date(year, month, i), "yyyy-MM-dd")
    const entriesOnDay = dbMoods.filter((e) => {
      return format(new Date(e.timestamp), "yyyy-MM-dd") === dateKey
    })
    
    let moodImage: string | undefined = undefined
    let moodLabel: string | undefined = undefined
    
    if (entriesOnDay.length > 0) {
      const latestEntry = entriesOnDay[entriesOnDay.length - 1]
      const normalizedKey = getNormalizedTrendsMood(latestEntry.mood, latestEntry.moodScore)
      const config = MOOD_IMAGE_MAP[normalizedKey]
      if (config) {
        moodImage = config.image
        moodLabel = config.label
      }
    }

    calendarDays.push({
      date: i,
      isCurrentMonth: true,
      dateKey,
      moodImage,
      moodLabel,
    })
  }

  // Padding days from next month to complete 42 elements (6 rows)
  const remaining = 42 - calendarDays.length
  for (let i = 1; i <= remaining; i++) {
    const dateKey = format(new Date(year, month + 1, i), "yyyy-MM-dd")
    calendarDays.push({
      date: i,
      isCurrentMonth: false,
      dateKey,
    })
  }

  const handleDayClick = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return
    setSelectedDayKey(day.dateKey)
  }

  const currentJournals = dbJournals
    .filter((j) => {
      return format(new Date(j.createdAt), "yyyy-MM-dd") === selectedDayKey
    })
    .map((j) => {
      let moodLabel = "Okay"
      if (j.moodScore !== null && j.moodScore !== undefined) {
        if (j.moodScore >= 8) moodLabel = "Great"
        else if (j.moodScore >= 6) moodLabel = "Good"
        else if (j.moodScore >= 4) moodLabel = "Okay"
        else if (j.moodScore >= 3) moodLabel = "Meh"
        else moodLabel = "Low"
      }

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
                      const isSelected = selectedDayKey === day.dateKey && day.isCurrentMonth
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
            {currentSummary && monthMoodAverage !== null ? (
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
                    {monthMoodAverage.toFixed(1)}
                  </h2>
                  <p
                    className="text-sm sm:text-base font-bold leading-relaxed mt-2 max-w-[240px] sm:max-w-xs opacity-90"
                    style={{ color: currentSummary.textColor }}
                  >
                    Average mood this month · {currentSummary.title}
                    <br />
                    Based on {dbMoods.length} mood entr{dbMoods.length === 1 ? "y" : "ies"}.
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
            ) : (
              <div className="w-full max-w-2xl mx-auto rounded-[32px] p-6 sm:p-8 bg-white border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] select-none">
                <div className="flex flex-col gap-2">
                  <span className="text-xs sm:text-sm font-bold tracking-wide uppercase text-slate-400">
                    Monthly Mood Summary
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                    No Mood Entries found
                  </h2>
                  <p className="text-sm sm:text-base font-medium leading-relaxed mt-1 max-w-[320px] text-slate-500">
                    Log your first mood this month to see your average mood summary here.
                  </p>
                </div>
              </div>
            )}

            {/* Journal Section */}
            <div className="w-full max-w-2xl mx-auto flex flex-col items-start gap-4">
              <h3 className="text-lg font-bold text-slate-800 px-1 font-sans">
                Journal, {selectedDayLabel} {selectedMonthLabel.slice(0, 3)}
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
