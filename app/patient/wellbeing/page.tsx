"use client"

import React, { useState, useEffect } from "react"
import PeriodSelector from "@/components/wellbeing/PeriodSelector"
import WeeklyWellbeingCard from "@/components/wellbeing/WeeklyWellbeingCard"
import MonthlyWellbeing from "@/components/wellbeing/MonthlyWellbeing"
import SeniorSupportCard from "@/components/wellbeing/SeniorSupportCard"
import MoodPatternsCard from "@/components/wellbeing/MoodPatternsCard"
import RecentActivity from "@/components/patient/dashboard/RecentActivity"

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

const DEFAULT_WEEK_MOODS = [
  { label: "Okay", value: 0, color: "#FFD5B7", bgClass: "bg-[#FFD5B7]", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730633/Okay-emotion_sscj34.png" },
  { label: "Good", value: 0, color: "#CEF8A4", bgClass: "bg-[#CEF8A4]", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730633/Good-emotion_jimbfs.png" },
  { label: "Great", value: 0, color: "#FCE5AF", bgClass: "bg-[#FCE5AF]", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730630/Great-emotion_rbwtzb.png" },
  { label: "Meh", value: 0, color: "#C2DDF8", bgClass: "bg-[#C2DDF8]", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730630/Meh-emotion_nozhzi.png" },
  { label: "Low", value: 0, color: "#E9C9FF", bgClass: "bg-[#E9C9FF]", image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730629/Low-emotion_vbpanv.png" },
]

export default function WellbeingPage() {
  const [viewMode, setViewMode] = useState<"week" | "month">("week")
  const [selectedWeek, setSelectedWeek] = useState<number>(3) // Default to current week (Week 3)
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth())
  
  const [weeklyData, setWeeklyData] = useState<any>(null)
  const [monthlyData, setMonthlyData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/patient/wellbeing/stats")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch wellbeing stats")
        return res.json()
      })
      .then((data) => {
        setWeeklyData(data.weeklyData || {})
        setMonthlyData(data.monthlyData || {})
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching stats:", err)
        setLoading(false)
      })
  }, [])

  const weeks = [1, 2, 3]
  const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

  const currentWeekData = weeklyData?.[selectedWeek] || { averageMood: 0, moods: DEFAULT_WEEK_MOODS }
  const currentMonthData = monthlyData?.[selectedMonth]
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

  if (loading) {
    return (
      <div className="flex-1 w-full h-full overflow-y-auto bg-[#F9F5F0] flex flex-col items-center justify-center font-sans select-none pb-20">
        <div className="text-[#1E1E2E] font-bold text-lg animate-pulse">
          Loading stats...
        </div>
      </div>
    )
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
