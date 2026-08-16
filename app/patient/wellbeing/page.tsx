"use client"

import React, { useState } from "react"
import PeriodSelector from "@/components/wellbeing/PeriodSelector"
import WeeklyWellbeingCard from "@/components/wellbeing/WeeklyWellbeingCard"
import MonthlyWellbeing from "@/components/wellbeing/MonthlyWellbeing"
import SeniorSupportCard from "@/components/wellbeing/SeniorSupportCard"
import MoodPatternsCard from "@/components/wellbeing/MoodPatternsCard"
import RecentActivity from "@/components/patient/dashboard/RecentActivity"

const MOCK_WEEKS_DATA: Record<
  number,
  {
    week: number
    averageMood: number
    moods: {
      label: string
      value: number
      color: string
      bgClass: string
      image: string
    }[]
  }
> = {
  1: {
    week: 1,
    averageMood: 5.6,
    moods: [
      { label: "Okay", value: 4, color: "#FFD5B7", bgClass: "bg-[#FFD5B7]", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730633/Okay-emotion_sscj34.png" },
      { label: "Good", value: 5, color: "#CEF8A4", bgClass: "bg-[#CEF8A4]", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730633/Good-emotion_jimbfs.png" },
      { label: "Great", value: 3, color: "#FCE5AF", bgClass: "bg-[#FCE5AF]", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730630/Great-emotion_rbwtzb.png" },
      { label: "Meh", value: 2, color: "#C2DDF8", bgClass: "bg-[#C2DDF8]", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730630/Meh-emotion_nozhzi.png" },
      { label: "Low", value: 2, color: "#E9C9FF", bgClass: "bg-[#E9C9FF]", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730629/Low-emotion_vbpanv.png" },
    ],
  },
  2: {
    week: 2,
    averageMood: 6.3,
    moods: [
      { label: "Okay", value: 3, color: "#FFD5B7", bgClass: "bg-[#FFD5B7]", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730633/Okay-emotion_sscj34.png" },
      { label: "Good", value: 6, color: "#CEF8A4", bgClass: "bg-[#CEF8A4]", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730633/Good-emotion_jimbfs.png" },
      { label: "Great", value: 4, color: "#FCE5AF", bgClass: "bg-[#FCE5AF]", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730630/Great-emotion_rbwtzb.png" },
      { label: "Meh", value: 2, color: "#C2DDF8", bgClass: "bg-[#C2DDF8]", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730630/Meh-emotion_nozhzi.png" },
      { label: "Low", value: 1, color: "#E9C9FF", bgClass: "bg-[#E9C9FF]", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730629/Low-emotion_vbpanv.png" },
    ],
  },
  3: {
    week: 3,
    averageMood: 5.1,
    moods: [
      { label: "Okay", value: 5, color: "#FFD5B7", bgClass: "bg-[#FFD5B7]", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730633/Okay-emotion_sscj34.png" },
      { label: "Good", value: 4, color: "#CEF8A4", bgClass: "bg-[#CEF8A4]", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730633/Good-emotion_jimbfs.png" },
      { label: "Great", value: 2, color: "#FCE5AF", bgClass: "bg-[#FCE5AF]", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730630/Great-emotion_rbwtzb.png" },
      { label: "Meh", value: 3, color: "#C2DDF8", bgClass: "bg-[#C2DDF8]", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730630/Meh-emotion_nozhzi.png" },
      { label: "Low", value: 2, color: "#E9C9FF", bgClass: "bg-[#E9C9FF]", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730629/Low-emotion_vbpanv.png" },
    ],
  },
}

// TODO: Replace with real monthly wellbeing data when monthly analytics are implemented.
const MOCK_MONTHS_DATA: Record<
  number,
  {
    month: number
    averageMood: number
    moods: {
      label: string
      value: number
      color: string
      bgClass: string
      image: string
    }[]
  }
> = {
  0: {
    month: 0,
    averageMood: 5.6,
    moods: [
      { label: "Okay", value: 4, color: "#FFD5B7", bgClass: "bg-[#FFD5B7]", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730633/Okay-emotion_sscj34.png" },
      { label: "Good", value: 5, color: "#CEF8A4", bgClass: "bg-[#CEF8A4]", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730633/Good-emotion_jimbfs.png" },
      { label: "Great", value: 3, color: "#FCE5AF", bgClass: "bg-[#FCE5AF]", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730630/Great-emotion_rbwtzb.png" },
      { label: "Meh", value: 2, color: "#C2DDF8", bgClass: "bg-[#C2DDF8]", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730630/Meh-emotion_nozhzi.png" },
      { label: "Low", value: 2, color: "#E9C9FF", bgClass: "bg-[#E9C9FF]", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730629/Low-emotion_vbpanv.png" },
    ],
  },
  1: {
    month: 1,
    averageMood: 6.1,
    moods: [
      { label: "Okay", value: 3, color: "#FFD5B7", bgClass: "bg-[#FFD5B7]", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730633/Okay-emotion_sscj34.png" },
      { label: "Good", value: 6, color: "#CEF8A4", bgClass: "bg-[#CEF8A4]", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730633/Good-emotion_jimbfs.png" },
      { label: "Great", value: 4, color: "#FCE5AF", bgClass: "bg-[#FCE5AF]", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730630/Great-emotion_rbwtzb.png" },
      { label: "Meh", value: 1, color: "#C2DDF8", bgClass: "bg-[#C2DDF8]", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730630/Meh-emotion_nozhzi.png" },
      { label: "Low", value: 1, color: "#E9C9FF", bgClass: "bg-[#E9C9FF]", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730629/Low-emotion_vbpanv.png" },
    ],
  },
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

export default function WellbeingPage() {
  const [viewMode, setViewMode] = useState<"week" | "month">("week")
  const [selectedWeek, setSelectedWeek] = useState<number>(1)
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth())

  const weeks = [1, 2, 3]
  const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

  const currentWeekData = MOCK_WEEKS_DATA[selectedWeek] || MOCK_WEEKS_DATA[1]
  const currentMonthData = MOCK_MONTHS_DATA[selectedMonth]
  const hasMonthlyData = !!currentMonthData

  const handlePrevWeek = () => {
    if (selectedWeek > 1) {
      setSelectedWeek(selectedWeek - 1)
    }
  }

  const handleNextWeek = () => {
    if (selectedWeek < weeks.length) {
      setSelectedWeek(selectedWeek + 1)
    }
  }

  const handlePrevMonth = () => {
    if (selectedMonth > 0) {
      setSelectedMonth(selectedMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (selectedMonth < 11) {
      setSelectedMonth(selectedMonth + 1)
    }
  }

  const handleToggleMode = () => {
    setViewMode((prev) => (prev === "week" ? "month" : "week"))
  }

  return (
    <div className="flex-1 w-full h-full overflow-y-auto bg-[#F9F5F0] flex flex-col font-sans select-none pb-20">
      <div className="px-4 py-6 sm:p-8 flex-1 w-full max-w-2xl mx-auto flex flex-col gap-6 md:gap-8">
        
        {/* Header Section */}
        <header className="flex items-center justify-between gap-4 w-full">
          <h1
            style={{
              width: "162px",
              height: "39px",
              fontFamily: "'Geist', sans-serif",
              fontStyle: "normal",
              fontWeight: 600,
              fontSize: "26px",
              lineHeight: "39px",
              letterSpacing: "-0.65px",
              color: "#1E1E2E",
            }}
          >
            My Wellbeing
          </h1>
          <PeriodSelector
            type={viewMode}
            items={viewMode === "week" ? weeks : months}
            selectedItem={viewMode === "week" ? selectedWeek : selectedMonth}
            onSelectItem={viewMode === "week" ? setSelectedWeek : setSelectedMonth}
            onToggleType={handleToggleMode}
          />
        </header>

        {/* Main Card */}
        <main className="w-full flex-1 flex flex-col gap-6 md:gap-8 justify-center">
          {viewMode === "week" ? (
            <WeeklyWellbeingCard
              weekLabel={`Week ${selectedWeek}`}
              averageMood={currentWeekData.averageMood}
              moods={currentWeekData.moods}
              onPrevWeek={handlePrevWeek}
              onNextWeek={handleNextWeek}
              isPrevDisabled={selectedWeek === 1}
              isNextDisabled={selectedWeek === weeks.length}
            />
          ) : (
            <MonthlyWellbeing
              monthLabel={MONTH_NAMES[selectedMonth]}
              averageMood={currentMonthData?.averageMood || 0}
              moods={currentMonthData?.moods || []}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              isPrevDisabled={selectedMonth === 0}
              isNextDisabled={selectedMonth === 11}
              hasData={hasMonthlyData}
            />
          )}

          {/* Support Section */}
          <SeniorSupportCard />

          {/* Patterns Section */}
          <MoodPatternsCard />

          {/* Recent Activity Section */}
          <RecentActivity />
        </main>
        
      </div>
    </div>
  )
}
