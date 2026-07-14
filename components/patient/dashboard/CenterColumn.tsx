"use client"

import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { useState } from "react"
import UpgradeOffersBanner from "./UpgradeOffersBanner"



export default function CenterColumn({ displayName, plan, upcomingAppointments, dailyTasks = [] }: { displayName: string, plan?: string, upcomingAppointments: any[], dailyTasks?: any[] }) {
    const [activityFilter, setActivityFilter] = useState('Monthly')
    const [activityFilterOpen, setActivityFilterOpen] = useState(false)
    const normalizedPlan = plan || 'FREE'
    const planLabelMap: Record<string, string> = {
        FREE: 'Free',
        ESSENTIAL: 'Essential',
        PREMIUM: 'Premium',
        ORGANIZATION: 'Organization',
    }
    const chartData = [
        { month: "Jul", value: 30 },
        { month: "Aug", value: 45 },
        { month: "Sep", value: 65 },
        { month: "Oct", value: 35 },
        { month: "Nov", value: 60 },
        { month: "Dec", value: 85, active: true },
    ]

    const nextApt = upcomingAppointments && upcomingAppointments.length > 0 ? upcomingAppointments[0] : null

    // Add real date line tracker for timeline
    const currentHour = new Date().getHours() + new Date().getMinutes() / 60
    const timePercentage = Math.max(0, Math.min(100, ((currentHour - 9) / 12) * 100))

    return (
        <div className="flex-1 h-full overflow-y-auto w-full px-6 md:px-8 xl:px-10 py-8 md:py-10 bg-[#fafdfc] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {/* Header */}
            <header className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start w-full gap-8 mb-10 mt-4 relative">
                {/* Avatar Area */}
                <div className="relative shrink-0 group mb-2 md:mb-0">
                    <div className="w-28 h-28 md:w-36 md:h-36 relative z-10 flex items-center justify-center">
                        <img 
                            src="/new_bot/Ai%20icon.png" 
                            alt="Avatar" 
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>

                <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 max-w-3xl pt-2">
                    <h2 className="text-[14px] md:text-[16px] uppercase tracking-[0.2em] font-black text-gray-700 mb-3">
                        HELLO {displayName ? displayName.toUpperCase() : "THERE"} !
                    </h2>
                    <h1 className="text-[28px] md:text-[36px] font-bold text-gray-900 leading-tight mb-4">
                        I'm here to listen and support you between sessions.
                    </h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <span className="text-gray-500 font-medium tracking-wide">Let's track your health daily!</span>
                        <span className="inline-flex items-center rounded-full bg-orange-100 text-orange-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
                            {planLabelMap[normalizedPlan] ?? normalizedPlan.replace(/_/g, " ")}
                        </span>
                    </div>
                </div>
            </header>

            {normalizedPlan === 'FREE' && (
                <div className="mb-8 w-full">
                    <UpgradeOffersBanner />
                </div>
            )}

            {/* Upcoming Appointments */}
            <section className="mb-6 w-full">
                <div className="flex items-center justify-between mb-4 pr-10">
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight">Upcoming sessions</h3>
                    <Link
                        href="/patient/appointments"
                        className="text-[13px] font-bold text-orange-500 hover:text-orange-600 transition-colors"
                    >
                        View more →
                    </Link>
                </div>

                <div className="flex flex-row gap-6 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    {upcomingAppointments && upcomingAppointments.length > 0 ? (
                        upcomingAppointments.map((apt, index) => {
                            const aptTime = new Date(apt.appointmentDate).getTime();
                            const now = new Date().getTime();
                            const diffMinutes = (aptTime - now) / (1000 * 60);
                            const isJoinable = diffMinutes <= 15;
                            const isBlurred = index >= 2;

                            return (
                                <div key={apt.id || index} className="min-w-[440px] bg-white shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-[#f1f5f9] relative overflow-hidden group rounded-[20px] shrink-0 flex min-h-[250px]">
                                    {/* Left Content Area */}
                                    <div className={`flex-1 p-4 flex flex-col relative z-10 ${isBlurred ? 'blur-[3px] opacity-40 pointer-events-none' : ''}`}>
                                        {/* Status Label */}
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <div className="w-3.5 h-3.5 rounded-full bg-[#22c55e] flex items-center justify-center text-white shrink-0">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-[8px] h-[8px]"><polyline points="20 6 9 17 4 12" /></svg>
                                            </div>
                                            <span className="text-[#16a34a] font-extrabold text-[9px] tracking-wide uppercase">Confirmed</span>
                                        </div>

                                        <h2 className="text-[18px] font-black text-[#0f172a] mb-0.5 tracking-tight leading-tight">Session scheduled</h2>

                                        <div className="flex items-center gap-1 text-[#2563eb] mb-3">
                                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-[12px] h-[12px] shrink-0"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                                            <span className="font-bold text-[11px]">{apt.meetLink ? "Online Video" : "In-Person"}</span>
                                        </div>

                                        {/* Date & Time Block */}
                                        <div className="bg-[#f8fafd] rounded-xl p-2.5 flex items-center gap-3 mb-3 border border-[#f1f5f9]">
                                            <div className="w-7 h-7 rounded-lg bg-[#e0e7ff] flex items-center justify-center shrink-0">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[#3b82f6]">
                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                    <line x1="16" y1="2" x2="16" y2="6" />
                                                    <line x1="8" y1="2" x2="8" y2="6" />
                                                    <line x1="3" y1="10" x2="21" y2="10" />
                                                </svg>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[11px] text-[#0f172a] font-extrabold leading-tight">
                                                    {format(new Date(apt.appointmentDate), "MMM d, yyyy")}
                                                </span>
                                                <span className="text-[10px] text-[#2563eb] font-bold">
                                                    {new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' }).format(new Date(apt.appointmentDate))} (UTC)
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 mb-3">
                                            <div className="w-6 h-6 rounded-full bg-[#dbeafe] flex items-center justify-center">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 text-[#2563eb]"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                            </div>
                                            <span className="text-[11px] font-bold text-gray-500">with <span className="text-gray-900 font-extrabold">{apt.doctor?.user?.name || "Doctor"}</span></span>
                                        </div>

                                        {/* Buttons container */}
                                        <div className="mt-auto">
                                            <div className="flex items-center gap-2">
                                                {isJoinable && apt.meetLink ? (
                                                    <Link
                                                        href={apt.meetLink}
                                                        target="_blank"
                                                        className="px-4 py-2 bg-[#2563eb] text-white rounded-lg font-bold text-[11px] flex items-center gap-1.5 hover:bg-blue-700 shadow-md transition-all"
                                                    >
                                                        Join Session
                                                    </Link>
                                                ) : (
                                                    <button
                                                        disabled
                                                        className="px-4 py-2 bg-gray-50 text-gray-400 border border-gray-100 rounded-lg font-bold text-[11px] flex items-center gap-1.5 cursor-not-allowed"
                                                    >
                                                        Join Session
                                                    </button>
                                                )}
                                                <Link
                                                    href={`/patient/appointments/${apt.id}`}
                                                    className="px-4 py-2 border border-[#e0e7ff] text-[#2563eb] rounded-lg font-bold text-[11px] flex items-center gap-1.5 hover:bg-blue-50 transition-all"
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Image Pillar */}
                                    <div className={`w-[140px] relative hidden md:block shrink-0 ${isBlurred ? 'blur-[4px] opacity-30' : ''}`}>
                                        <Image
                                            src={apt.doctor?.user?.image || "/images/promo_doctor.png"}
                                            alt={apt.doctor?.user?.name || "Doctor"}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute top-2.5 left-2.5 w-4 h-4 bg-black/80 rounded flex items-center justify-center backdrop-blur-sm z-20">
                                            <svg viewBox="0 0 24 24" fill="white" className="w-2.5 h-2.5">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* View More Overlay for blurred cards */}
                                    {isBlurred && (
                                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[4px] group-hover:backdrop-blur-[6px] transition-all duration-300">
                                            <Link
                                                href="/patient/appointments"
                                                className="group/btn flex flex-col items-center gap-3"
                                            >
                                                <div className="w-14 h-14 bg-white rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex items-center justify-center border border-gray-100 group-hover/btn:scale-110 group-hover/btn:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-300">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3.5" className="w-5 h-5 transition-transform group-hover/btn:translate-x-0.5"><polyline points="9 18 15 12 9 6" /></svg>
                                                </div>
                                                <span className="text-[11px] font-black text-[#2563eb] tracking-tight uppercase opacity-80 group-hover/btn:opacity-100 transition-opacity">View all</span>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )
                        })
                    ) : (
                        <div className="bg-white border border-gray-100/50 p-10 text-center shadow-[0_2px_15px_rgba(0,0,0,0.02)] w-full max-w-3xl rounded-[32px] shrink-0 mx-auto lg:mx-0">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-gray-300">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                            </div>
                            <p className="text-[15px] font-bold text-gray-400">No upcoming sessions scheduled.</p>
                            <p className="text-[13px] text-gray-300 font-medium mt-1">Check back later or book a new appointment.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6 mb-10 w-full">

                {/* Daily Progress Card */}
                <div className="bg-white rounded-[32px] p-6 shadow-[0_2px_24px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col relative min-h-[400px]">
                    <h3 className="font-extrabold text-[22px] text-gray-900 mb-8">Daily Progress</h3>

                    <div className="flex flex-col gap-6 w-full">
                        {/* Daily Progress Bar */}
                        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-[24px] p-6 border border-orange-100 shadow-sm relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-orange-200/40 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                            
                            <div className="flex items-end justify-between mb-4 relative z-10">
                                <div>
                                    <h4 className="text-[15px] font-black text-orange-900 tracking-tight mb-1">Today's Journey</h4>
                                    <p className="text-[12px] font-semibold text-orange-700/70">You're making great progress!</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[24px] font-black text-orange-600 leading-none">2</span>
                                    <span className="text-[14px] font-bold text-orange-400"> / 4</span>
                                </div>
                            </div>
                            
                            <div className="w-full h-3 bg-white/60 rounded-full overflow-hidden border border-orange-100 relative z-10">
                                <div className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full w-[50%] relative">
                                    <div className="absolute inset-0 bg-white/20 w-full h-full rounded-full" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)', backgroundSize: '1rem 1rem' }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Task List */}
                        <div className="flex flex-col gap-3">
                            {[
                                { title: "Morning Check-in", time: "5 mins", completed: true, color: "blue" },
                                { title: "Mindful Breathing", time: "3 mins", completed: true, color: "teal" },
                                { title: "The Thoughts-Feelings Loop", time: "10 mins", completed: false, color: "amber" },
                                { title: "Evening Reflection", time: "5 mins", completed: false, color: "purple" },
                            ].map((task, i) => (
                                <div key={i} className={`flex items-center justify-between p-4 rounded-[20px] border transition-all ${task.completed ? 'bg-gray-50 border-gray-100 opacity-70' : 'bg-white border-gray-200 shadow-sm hover:border-orange-200 hover:shadow-md'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${task.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                            {task.completed ? (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><polyline points="20 6 9 17 4 12" /></svg>
                                            ) : (
                                                <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                                            )}
                                        </div>
                                        <div>
                                            <h5 className={`font-black text-[14px] ${task.completed ? 'text-gray-500 line-through decoration-gray-300' : 'text-gray-800'}`}>{task.title}</h5>
                                            <span className="text-[11px] font-bold text-gray-400">{task.time}</span>
                                        </div>
                                    </div>
                                    {!task.completed && (
                                        <button className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider text-${task.color}-600 bg-${task.color}-50 hover:bg-${task.color}-100 transition-colors`}>
                                            Start
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Quote & Mood Tracker */}
                <div className="flex flex-col gap-8">
                    {/* Journaling Card */}
                    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-[32px] p-8 shadow-[0_4px_30px_rgba(0,0,0,0.04)] border border-indigo-100/60 flex-col flex flex-1 min-h-[292px] relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-48 h-48 bg-indigo-200/30 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-indigo-300/30 transition-colors duration-500"></div>
                        <div className="absolute left-0 bottom-0 w-48 h-48 bg-purple-200/30 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none group-hover:bg-purple-300/30 transition-colors duration-500"></div>
                        
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-indigo-50 flex items-center justify-center">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-indigo-500">
                                    <path d="M12 20h9" />
                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                </svg>
                            </div>
                            <span className="bg-white/60 backdrop-blur-sm border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                                Daily Reflection
                            </span>
                        </div>

                        <div className="flex-1 flex flex-col pt-2 relative z-10">
                            <h3 className="font-black text-[22px] text-gray-900 mb-2">
                                Start today's journal
                            </h3>
                            <h4 className="text-[13px] font-bold text-indigo-600/80 mb-3 uppercase tracking-wide">
                                {format(new Date(), "EEEE, do MMMM, yyyy")}
                            </h4>
                            <p className="text-gray-500 font-medium text-[14px] leading-relaxed max-w-[90%]">
                                Write down your thoughts, clear your mind. <span className="font-bold text-gray-700">Ask for help with AI</span> if you need inspiration or guidance.
                            </p>
                        </div>

                        <div className="mt-auto flex justify-between items-center relative z-10">
                            <button className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors text-[13px] font-black group/btn">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                Ask AI
                            </button>
                            <Link href="/patient/journal">
                                <button className="px-7 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-[13px] rounded-full hover:shadow-lg hover:shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5">
                                    Start Journal
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Motivational Quote Card */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-[28px] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.02)] border border-orange-100/50 flex flex-col items-center justify-center relative overflow-hidden">
                        <svg className="absolute top-2 left-4 w-16 h-16 text-orange-200 opacity-40" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                            <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                        </svg>
                        <p className="text-orange-900/80 font-bold text-[16px] text-center leading-relaxed italic relative z-10 px-8 py-2">
                            "Your feelings are valid, and brighter days can begin with one small step."
                        </p>
                    </div>
                </div>
            </div>

        </div>
    )
}
