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

  const currentSummary = MOOD_SUMMARY_CONFIGS[activeMood] || MOOD_SUMMARY_CONFIGS["Good"]

  // Grid for December 2025 matching Image 2 exactly:
  // Week 1: 30(prev), 1, 2(Okay), 3(Good), 4, 5, 6(Meh)
  // Week 2: 7(Great), 8(Low), 9, 10(Great), 11, 12(Great), 13(Great)
  // Week 3: 14(Okay), 15(Low), 16, 17(Okay), 18, 19(Low), 20(Low)
  // Week 4: 21(Great), 22(Great), 23, 24(Great), 25, 26(Great), 27
  // Week 5: 28, 29, 30(Great), 31, 1(next), 2(next), 3(next)
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
                {calendarDays.map((day, idx) => (
                  <div
                    key={idx}
                    className="aspect-square flex items-center justify-center relative w-full h-10 sm:h-12"
                  >
                    {day.moodImage ? (
                      <div
                        onClick={() => day.moodLabel && setActiveMood(day.moodLabel)}
                        className="w-8 h-8 sm:w-10 sm:h-10 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer drop-shadow-sm"
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
                      <span
                        className={`text-sm sm:text-base font-semibold font-sans
                          ${day.isCurrentMonth ? "text-slate-700" : "text-slate-300"}
                        `}
                      >
                        {day.date}
                      </span>
                    )}
                  </div>
                ))}
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
            Journal, 03 Dec
          </h3>
          
          <div className="flex flex-col gap-3.5 w-full">
            {/* Okay entry */}
            <div className="bg-[#FFD5B7]/25 border border-[#FFD5B7]/40 rounded-[24px] p-5 font-semibold text-slate-700 text-sm sm:text-base leading-relaxed text-left shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
              Took a slow stroll around the park. The crisp winter breeze felt incredibly refreshing and cleared my mind for the day.
            </div>
            
            {/* Meh entry */}
            <div className="bg-[#C2DDF8]/25 border border-[#C2DDF8]/40 rounded-[24px] p-5 font-semibold text-slate-700 text-sm sm:text-base leading-relaxed text-left shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
              Brewed a warm cup of jasmine green tea. Practiced breathing deeply and just enjoyed the steam rising in silence.
            </div>

            {/* Low entry */}
            <div className="bg-[#E9C9FF]/25 border border-[#E9C9FF]/40 rounded-[24px] p-5 font-semibold text-slate-700 text-sm sm:text-base leading-relaxed text-left shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
              Made progress on my current chapter. Reflection on today's thoughts brought a sense of calm and clarity.
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
