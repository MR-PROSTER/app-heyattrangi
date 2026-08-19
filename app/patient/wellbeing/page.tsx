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

export default function WellbeingPage() {
    const [viewMode, setViewMode] = useState<"week" | "month">("week")
    const [selectedWeek, setSelectedWeek] = useState<number>(4) // Default to the current 7-day block
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth())
    const [periodData, setPeriodData] = useState<{
        periodId: number
        averageMood: number
        moods: { label: string; value: number; color: string; bgClass: string; image: string }[]
        entryCount: number
    } | null>(null)
    const [initialLoading, setInitialLoading] = useState(true)
    const [cardLoading, setCardLoading] = useState(false)

    useEffect(() => {
        const controller = new AbortController()
        const params = new URLSearchParams()
        if (viewMode === "week") {
            params.set("period", "week")
            params.set("week", String(selectedWeek))
        } else {
            params.set("period", "month")
            params.set("month", String(selectedMonth))
            params.set("year", String(new Date().getFullYear()))
        }

        fetch(`/api/patient/wellbeing/stats?${params.toString()}`, { signal: controller.signal })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch wellbeing stats")
                return res.json()
            })
            .then((data) => {
                if (controller.signal.aborted) return
                setPeriodData(data?.summary || null)
            })
            .catch((err) => {
                if (err?.name === "AbortError") return
                console.error("Error fetching stats:", err)
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setInitialLoading(false)
                    setCardLoading(false)
                }
            })

        return () => controller.abort()
    }, [viewMode, selectedWeek, selectedMonth])

    const weeks = [1, 2, 3, 4]
    const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

    const currentWeekData = viewMode === "week" ? periodData : null
    const currentMonthData = viewMode === "month" ? periodData : null
    const hasMonthlyData = (currentMonthData?.entryCount || 0) > 0
    const hasWeeklyData = (currentWeekData?.entryCount || 0) > 0

    const handleSelectWeek = (week: number) => {
        setCardLoading(true)
        setPeriodData(null)
        setSelectedWeek(week)
    }

    const handleSelectMonth = (month: number) => {
        setCardLoading(true)
        setPeriodData(null)
        setSelectedMonth(month)
    }

    const handlePrevWeek = () => {
        if (selectedWeek > 1) {
            handleSelectWeek(selectedWeek - 1)
        }
    }

    const handleNextWeek = () => {
        if (selectedWeek < weeks.length) {
            handleSelectWeek(selectedWeek + 1)
        }
    }

    const handlePrevMonth = () => {
        if (selectedMonth > 0) {
            handleSelectMonth(selectedMonth - 1)
        }
    }

    const handleNextMonth = () => {
        if (selectedMonth < 11) {
            handleSelectMonth(selectedMonth + 1)
        }
    }

    const handleToggleMode = () => {
        setCardLoading(true)
        setPeriodData(null)
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
                        onSelectItem={viewMode === "week" ? handleSelectWeek : handleSelectMonth}
                        onToggleType={handleToggleMode}
                    />
                </header>

                {/* Main Card */}
                <main className="w-full flex-1 flex flex-col gap-6 md:gap-8 justify-center">
                    {viewMode === "week" ? (
                        <WeeklyWellbeingCard
                            key={`week-${selectedWeek}`}
                            weekLabel={`Week ${selectedWeek}`}
                            averageMood={currentWeekData?.averageMood || 0}
                            moods={currentWeekData?.moods || []}
                            onPrevWeek={handlePrevWeek}
                            onNextWeek={handleNextWeek}
                            isPrevDisabled={selectedWeek === 1}
                            isNextDisabled={selectedWeek === weeks.length}
                            hasData={hasWeeklyData}
                            isLoading={initialLoading || cardLoading}
                        />
                    ) : (
                        <MonthlyWellbeing
                            key={`month-${selectedMonth}`}
                            monthLabel={MONTH_NAMES[selectedMonth]}
                            averageMood={currentMonthData?.averageMood || 0}
                            moods={currentMonthData?.moods || []}
                            onPrevMonth={handlePrevMonth}
                            onNextMonth={handleNextMonth}
                            isPrevDisabled={selectedMonth === 0}
                            isNextDisabled={selectedMonth === 11}
                            hasData={hasMonthlyData}
                            isLoading={initialLoading || cardLoading}
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
