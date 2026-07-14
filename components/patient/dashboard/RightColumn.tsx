"use client"

import Link from "next/link"
import { useState } from "react"
import { startOfMonth, endOfMonth, eachDayOfInterval, format, addMonths, subMonths, isSameDay, getDay, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays } from "date-fns"

import DailyCheckinCards from "./DailyCheckinCards"

const SearchIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </svg>
)

const BellIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
)

const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function RightColumn({ upcomingAppointments }: { upcomingAppointments: any[] }) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [view, setView] = useState<'Monthly' | 'Weekly'>('Weekly')

    const handlePrev = () => {
        if (view === 'Weekly') setCurrentDate(subWeeks(currentDate, 1))
        else setCurrentDate(subMonths(currentDate, 1))
    }
    const handleNext = () => {
        if (view === 'Weekly') setCurrentDate(addWeeks(currentDate, 1))
        else setCurrentDate(addMonths(currentDate, 1))
    }

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

    const weekStart = startOfWeek(currentDate)
    const weekEnd = endOfWeek(currentDate)
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd })

    // padding for start of month
    const startDayOfWeek = getDay(monthStart)
    const emptyDays = Array.from({ length: startDayOfWeek }, (_, i) => i)

    const displayedDays = view === 'Weekly' ? daysInWeek : daysInMonth
    const displayEmptyDays = view === 'Weekly' ? [] : emptyDays

    // Only show appointments for the selected date, or all if none matches precisely, or just stick to upcoming chronological
    const displayAppointments = upcomingAppointments && upcomingAppointments.length > 0 ? upcomingAppointments.slice(0, 3) : []

    return (
        <div className="hidden xl:flex flex-col w-[400px] bg-white h-full px-5 py-5 relative">

            {/* Schedule Section */}
            <div className="mb-3">
                <h3 className="text-[15px] font-black text-gray-900 text-center">Schedule</h3>
            </div>

            {/* Calendar Area */}
            <div className="bg-white rounded-[24px] p-3.5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100/80 mb-4 relative z-10 w-full hover:shadow-[0_8px_40px_rgb(0,0,0,0.05)] transition-shadow duration-300">
                <div className="relative flex p-1 bg-gray-100/80 rounded-[10px] mb-3 border border-gray-200">
                    <div 
                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-[8px] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.12)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${view === 'Weekly' ? 'left-1' : 'left-[calc(50%+2px)]'}`} 
                    />
                    <button onClick={() => setView('Weekly')} className={`flex-1 text-[11px] font-black py-1.5 rounded-[8px] relative z-10 transition-all duration-300 active:scale-95 ${view === 'Weekly' ? 'text-gray-800' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/30'}`}>Weekly</button>
                    <button onClick={() => setView('Monthly')} className={`flex-1 text-[11px] font-black py-1.5 rounded-[8px] relative z-10 transition-all duration-300 active:scale-95 ${view === 'Monthly' ? 'text-gray-800' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/30'}`}>Monthly</button>
                </div>

                <div className="flex items-center justify-between mb-3 px-1">
                    <h4 className="font-black text-[14px] text-gray-800 tracking-tight">{format(currentDate, view === 'Weekly' ? "MMM yyyy" : "MMMM yyyy")}</h4>
                    <div className="flex gap-2">
                        <button onClick={handlePrev} className="w-7 h-7 rounded-full border border-gray-100 bg-white shadow-sm flex items-center justify-center text-gray-500 hover:border-gray-300 hover:text-gray-800 hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-200">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button onClick={handleNext} className="w-7 h-7 rounded-full border border-gray-100 bg-white shadow-sm flex items-center justify-center text-gray-500 hover:border-gray-300 hover:text-gray-800 hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-200">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-y-2 gap-x-2 text-center mb-1">
                    {days.map((d, i) => (
                        <div key={`header-${i}`} className="text-[11px] font-black text-gray-400 mb-1.5">{d}</div>
                    ))}

                    {/* Show full month if 'Monthly' is selected, otherwise show 2 weeks */}
                    {view === 'Monthly' ? (
                        <>
                            {displayEmptyDays.map((_, i) => (
                                <div key={`empty-${i}`} className="flex justify-center" />
                            ))}
                            {displayedDays.map((date, i) => {
                                const isSelected = isSameDay(date, selectedDate)
                                const hasAppointment = upcomingAppointments && upcomingAppointments.some(apt => isSameDay(new Date(apt.appointmentDate), date))
                                const isToday = isSameDay(date, new Date())
                                
                                return (
                                    <div key={`day-${i}`} className="flex justify-center relative group">
                                        <button
                                            onClick={() => setSelectedDate(date)}
                                            className={`w-10 h-[36px] flex flex-col items-center justify-center text-[13px] font-black rounded-[10px] relative z-10 transition-all duration-300
                                                ${isSelected ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/40' : isToday ? 'text-orange-500 bg-orange-50' : 'text-gray-600'}
                                            `}
                                        >
                                            <span>{format(date, "d")}</span>
                                            {hasAppointment && (
                                                <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-orange-400'}`} />
                                            )}
                                        </button>
                                    </div>
                                )
                            })}
                        </>
                    ) : (
                        Array.from({ length: 14 }).map((_, i) => {
                            const date = addDays(startOfWeek(currentDate), i)
                            const isSelected = isSameDay(date, selectedDate)
                            const hasAppointment = upcomingAppointments && upcomingAppointments.some(apt => isSameDay(new Date(apt.appointmentDate), date))
                            const isToday = isSameDay(date, new Date())
                            
                            return (
                                <div key={`day-${i}`} className="flex justify-center relative group">
                                    <button
                                        onClick={() => setSelectedDate(date)}
                                        className={`w-10 h-[36px] flex flex-col items-center justify-center text-[13px] font-black rounded-[10px] relative z-10 transition-all duration-300
                                            ${isSelected ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/40' : isToday ? 'text-orange-500 bg-orange-50' : 'text-gray-600'}
                                        `}
                                    >
                                        <span>{format(date, "d")}</span>
                                        {hasAppointment && (
                                            <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-orange-400'}`} />
                                        )}
                                    </button>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
            <div className="mt-auto">
                <DailyCheckinCards />
            </div>
        </div>
    )
}
