"use client"

import React, { useState } from "react"
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

export default function MoodTrendsPage() {
  const [selectedMonth, setSelectedMonth] = useState("December 2025")
  const [activeMood, setActiveMood] = useState<string>("Good")
  const [selectedDay, setSelectedDay] = useState<number>(3) // Default to Dec 3rd

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

  const JOURNAL_ENTRIES_BY_DAY: Record<number, { text: string; mood: string; bg: string; border: string }[]> = {
    2: [
      { text: "Took a slow stroll around the park. The crisp winter breeze felt incredibly refreshing and cleared my mind for the day.", mood: "Okay", bg: "bg-[#FFD5B7]/25", border: "border-[#FFD5B7]/40" }
    ],
    3: [
      { text: "Took a slow stroll around the park. The crisp winter breeze felt incredibly refreshing and cleared my mind for the day.", mood: "Okay", bg: "bg-[#FFD5B7]/25", border: "border-[#FFD5B7]/40" },
      { text: "Brewed a warm cup of jasmine green tea. Practiced breathing deeply and just enjoyed the steam rising in silence.", mood: "Meh", bg: "bg-[#C2DDF8]/25", border: "border-[#C2DDF8]/40" },
      { text: "Made progress on my current chapter. Reflection on today's thoughts brought a sense of calm and clarity.", mood: "Low", bg: "bg-[#E9C9FF]/25", border: "border-[#E9C9FF]/40" }
    ],
    6: [
      { text: "Brewed a warm cup of jasmine green tea. Practiced breathing deeply and just enjoyed the steam rising in silence.", mood: "Meh", bg: "bg-[#C2DDF8]/25", border: "border-[#C2DDF8]/40" }
    ],
    7: [
      { text: "Woke up early and watched the sunrise. Felt an immense sense of gratitude and peace starting the week.", mood: "Great", bg: "bg-[#FCE5AF]/25", border: "border-[#FCE5AF]/40" }
    ],
    8: [
      { text: "Feeling slightly overwhelmed by work today. Tried writing down my thoughts to ease the anxiety.", mood: "Low", bg: "bg-[#E9C9FF]/25", border: "border-[#E9C9FF]/40" }
    ],
    10: [
      { text: "Had an amazing conversation with a close friend. Connected deeply and shared some good laughs.", mood: "Great", bg: "bg-[#FCE5AF]/25", border: "border-[#FCE5AF]/40" }
    ],
    12: [
      { text: "Completed all my tasks for the week ahead. Looking forward to a restful weekend.", mood: "Great", bg: "bg-[#FCE5AF]/25", border: "border-[#FCE5AF]/40" }
    ],
    13: [
      { text: "Spent the afternoon reading by the window. A quiet, peaceful day of self-reflection.", mood: "Great", bg: "bg-[#FCE5AF]/25", border: "border-[#FCE5AF]/40" }
    ],
    14: [
      { text: "Attended a light yoga session. Stretched out the physical tension from the past week.", mood: "Okay", bg: "bg-[#FFD5B7]/25", border: "border-[#FFD5B7]/40" }
    ],
    15: [
      { text: "Struggling to stay focused today. Decided to step away and take a warm bath to reset.", mood: "Low", bg: "bg-[#E9C9FF]/25", border: "border-[#E9C9FF]/40" }
    ],
    17: [
      { text: "Went for a run in the evening. Hard to get started but felt much better afterwards.", mood: "Okay", bg: "bg-[#FFD5B7]/25", border: "border-[#FFD5B7]/40" }
    ],
    19: [
      { text: "Felt a wave of loneliness tonight. Listening to soothing music and journaling it out.", mood: "Low", bg: "bg-[#E9C9FF]/25", border: "border-[#E9C9FF]/40" }
    ],
    20: [
      { text: "Tired and low energy. Resting in bed and keeping my environment calm.", mood: "Low", bg: "bg-[#E9C9FF]/25", border: "border-[#E9C9FF]/40" }
    ],
    21: [
      { text: "Sunny day! Walked to a new cafe and enjoyed a delicious slice of lemon cake.", mood: "Great", bg: "bg-[#FCE5AF]/25", border: "border-[#FCE5AF]/40" }
    ],
    22: [
      { text: "Started learning a new skill. Excitement and focus are high today.", mood: "Great", bg: "bg-[#FCE5AF]/25", border: "border-[#FCE5AF]/40" }
    ],
    24: [
      { text: "Exchanged festive cards with neighbors. Enjoying the warm community feeling.", mood: "Great", bg: "bg-[#FCE5AF]/25", border: "border-[#FCE5AF]/40" }
    ],
    26: [
      { text: "Felt very relaxed all day. Slept in, cooked a comforting meal, and had no stress.", mood: "Great", bg: "bg-[#FCE5AF]/25", border: "border-[#FCE5AF]/40" }
    ],
    30: [
      { text: "Reflecting on the year. Happy with the progress I have made on my personal journey.", mood: "Great", bg: "bg-[#FCE5AF]/25", border: "border-[#FCE5AF]/40" }
    ]
  }

  const currentSummary = MOOD_SUMMARY_CONFIGS[activeMood] || MOOD_SUMMARY_CONFIGS["Good"]

  // Grid for December 2025 matching Image 2 exactly:
  const calendarDays: CalendarDay[] = [
    // Week 1
    { date: 30, isCurrentMonth: false },
    { date: 1, isCurrentMonth: true },
    { date: 2, isCurrentMonth: true, moodImage: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730508/Okay_ikdsom.png", moodLabel: "Okay" },
    { date: 3, isCurrentMonth: true, moodImage: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730507/Good_qtm32o.png", moodLabel: "Good" },
    { date: 4, isCurrentMonth: true },
    { date: 5, isCurrentMonth: true },
    { date: 6, isCurrentMonth: true, moodImage: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730508/Meh_fh0ndp.png", moodLabel: "Meh" },
    
    // Week 2
    { date: 7, isCurrentMonth: true, moodImage: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730508/Great_hbqsmr.png", moodLabel: "Great" },
    { date: 8, isCurrentMonth: true, moodImage: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786799140/Low_sujxbx.png", moodLabel: "Low" },
    { date: 9, isCurrentMonth: true },
    { date: 10, isCurrentMonth: true, moodImage: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730508/Great_hbqsmr.png", moodLabel: "Great" },
    { date: 11, isCurrentMonth: true },
    { date: 12, isCurrentMonth: true, moodImage: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730508/Great_hbqsmr.png", moodLabel: "Great" },
    { date: 13, isCurrentMonth: true, moodImage: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730508/Great_hbqsmr.png", moodLabel: "Great" },
    
    // Week 3
    { date: 14, isCurrentMonth: true, moodImage: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730508/Okay_ikdsom.png", moodLabel: "Okay" },
    { date: 15, isCurrentMonth: true, moodImage: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786799140/Low_sujxbx.png", moodLabel: "Low" },
    { date: 16, isCurrentMonth: true },
    { date: 17, isCurrentMonth: true, moodImage: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730508/Okay_ikdsom.png", moodLabel: "Okay" },
    { date: 18, isCurrentMonth: true },
    { date: 19, isCurrentMonth: true, moodImage: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786799140/Low_sujxbx.png", moodLabel: "Low" },
    { date: 20, isCurrentMonth: true, moodImage: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786799140/Low_sujxbx.png", moodLabel: "Low" },
    
    // Week 4
    { date: 21, isCurrentMonth: true, moodImage: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730508/Great_hbqsmr.png", moodLabel: "Great" },
    { date: 22, isCurrentMonth: true, moodImage: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730508/Great_hbqsmr.png", moodLabel: "Great" },
    { date: 23, isCurrentMonth: true },
    { date: 24, isCurrentMonth: true, moodImage: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730508/Great_hbqsmr.png", moodLabel: "Great" },
    { date: 25, isCurrentMonth: true },
    { date: 26, isCurrentMonth: true, moodImage: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730508/Great_hbqsmr.png", moodLabel: "Great" },
    { date: 27, isCurrentMonth: true },
    
    // Week 5
    { date: 28, isCurrentMonth: true },
    { date: 29, isCurrentMonth: true },
    { date: 30, isCurrentMonth: true, moodImage: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730508/Great_hbqsmr.png", moodLabel: "Great" },
    { date: 31, isCurrentMonth: true },
    { date: 1, isCurrentMonth: false },
    { date: 2, isCurrentMonth: false },
    { date: 3, isCurrentMonth: false },
  ]

  const handleDayClick = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return
    setSelectedDay(day.date)
  }

  const currentJournals = JOURNAL_ENTRIES_BY_DAY[selectedDay] || []

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

        {/* Calendar Card */}
        <div className="relative w-full max-w-2xl mx-auto select-none px-0">
          <div className="bg-white rounded-[32px] p-5 sm:px-8 sm:py-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/80 w-full flex flex-col gap-6">
            
            {/* Calendar Selector */}
            <div className="flex justify-between items-center px-2">
              <button className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FCE8E6] hover:bg-[#FCDAD6] text-[#A53A35] transition-all duration-200 cursor-pointer shadow-sm active:scale-90">
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
              
              <span className="text-base sm:text-lg font-bold text-slate-800 font-sans">
                {selectedMonth}
              </span>
              
              <button className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FCE8E6] hover:bg-[#FCDAD6] text-[#A53A35] transition-all duration-200 cursor-pointer shadow-sm active:scale-90">
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
            Journal, {String(selectedDay).padStart(2, "0")} Dec
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

      </div>
    </div>
  )
}
