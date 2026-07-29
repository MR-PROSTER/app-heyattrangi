"use client"

import Link from "next/link"
import Image from "next/image"
import { format, formatDistanceToNow } from "date-fns"
import { useState, useEffect } from "react"
import UpgradeOffersBanner from "./UpgradeOffersBanner"
import { useRouter } from "next/navigation"
import BreathingModule from "./BreathingModule"
import { DEFAULT_AVATAR } from "@/lib/avatar"

export default function CenterColumn({ displayName, plan, upcomingAppointments, dailyTasks = [] }: { displayName: string, plan?: string, upcomingAppointments: any[], dailyTasks?: any[] }) {
    const router = useRouter()
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

    const moodOptions = [
        { name: "Great", score: 5, emoji: "🤩" },
        { name: "Good", score: 4, emoji: "😊" },
        { name: "Happy", score: 5, emoji: "😄" },
        { name: "Calm", score: 4, emoji: "😌" },
        { name: "Neutral", score: 3, emoji: "😐" },
        { name: "Tired", score: 3, emoji: "🥱" },
        { name: "Sad", score: 2, emoji: "😔" },
        { name: "Anxious", score: 2, emoji: "😟" },
        { name: "Stressed", score: 1, emoji: "😵‍💫" },
        { name: "Angry", score: 1, emoji: "😠" }
    ];

    const [moodData, setMoodData] = useState<{ happy: number, calm: number, sad: number, score: number, message: string, lastUpdated?: string | null }>({ happy: 30, calm: 40, sad: 30, score: 60, message: "AI Mood Analysis Summary." })
    const [isLoadingMood, setIsLoadingMood] = useState(true)
    const [timeFilter, setTimeFilter] = useState("All")
    const [selectedMood, setSelectedMood] = useState<string>("Good")
    const [isBreathingOpen, setIsBreathingOpen] = useState(false)

    useEffect(() => {
        setIsLoadingMood(true)
        fetch(`/api/patient/analytics/mood?filter=${timeFilter}`)
            .then(res => res.json())
            .then(data => {
                if (data && typeof data.score === 'number') {
                    setMoodData(data)
                }
                setIsLoadingMood(false)
            })
            .catch(() => setIsLoadingMood(false))
    }, [timeFilter])

    const c = 251.2;
    const happyLen = (moodData.happy / 100) * c;
    const calmLen = (moodData.calm / 100) * c;
    const sadLen = (moodData.sad / 100) * c;
    
    const calmOffset = -happyLen;
    const sadOffset = -(happyLen + calmLen);

    const nextApt = upcomingAppointments && upcomingAppointments.length > 0 ? upcomingAppointments[0] : null

    // Add real date line tracker for timeline
    const currentHour = new Date().getHours() + new Date().getMinutes() / 60
    const timePercentage = Math.max(0, Math.min(100, ((currentHour - 9) / 12) * 100))

    return (
        <div className="flex-1 h-full overflow-y-auto w-full px-4 sm:px-6 md:px-8 xl:px-10 pt-14 pb-6 sm:pb-8 md:pt-10 md:pb-10 bg-[#fafdfc] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {/* Header */}
            <header className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start w-full gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 md:mb-10 mt-2 md:mt-4 relative">
                {/* Avatar Area */}
                <div className="relative shrink-0 group mb-1 md:mb-0">
                    <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 relative z-10 flex items-center justify-center">
                        <img
                            src={DEFAULT_AVATAR}
                            alt="Avatar"
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>

                <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 max-w-3xl pt-0 md:pt-2 min-w-0 w-full">
                    <h2 className="text-[12px] sm:text-[14px] md:text-[16px] uppercase tracking-[0.14em] sm:tracking-[0.2em] font-black text-gray-700 mb-2 sm:mb-3 max-w-full break-words px-1">
                        HELLO {displayName ? displayName.toUpperCase() : "THERE"} !
                    </h2>
                    <h1 className="text-[22px] sm:text-[28px] md:text-[36px] font-bold text-gray-900 leading-snug sm:leading-tight mb-3 sm:mb-4 px-1">
                        I'm here to listen and support you between sessions.
                    </h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3">
                        <span className="text-gray-500 font-medium tracking-wide text-[13px] sm:text-base">Let's track your health daily!</span>
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
                <div className="flex items-center justify-between mb-4 pr-0 sm:pr-4 md:pr-10">
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
                                <div key={apt.id || index} className="min-w-[280px] sm:min-w-[340px] md:min-w-[440px] bg-white shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-[#f1f5f9] relative overflow-hidden group rounded-[20px] shrink-0 flex min-h-[250px]">
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
                                                    {format(new Date(apt.appointmentDate), "h:mm a")}
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

                {/* AI Mood Analysis Card */}
                <div className="bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 shadow-[0_2px_24px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col relative min-h-0 sm:min-h-[400px]">
                    <div className="flex justify-between items-start mb-4 sm:mb-6">
                        <div>
                            {isLoadingMood ? (
                                <div className="h-10 w-24 bg-gray-100 rounded animate-pulse mb-2"></div>
                            ) : (
                                <h3 className="font-extrabold text-[32px] sm:text-[42px] text-gray-900 leading-none mb-1">{moodData.score}%</h3>
                            )}
                            <p className="text-[13px] sm:text-[14px] font-bold text-gray-500">{moodData.message}</p>
                        </div>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex gap-2 mb-8">
                        {['All', 'Today', 'Week'].map(filter => (
                            <button 
                                key={filter}
                                onClick={() => setTimeFilter(filter)}
                                className={`px-5 py-2 rounded-full text-xs transition-all ${
                                    timeFilter === filter 
                                        ? "bg-[#ff8b59] text-white font-black shadow-md shadow-orange-200" 
                                        : "bg-gray-50 text-gray-500 hover:bg-gray-100 font-bold"
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    {/* Donut Chart Section */}
                    <div className="flex items-center justify-between mb-8 px-2">
                        {/* Legend */}
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff8b59]"></div>
                                    <span className="text-[13px] font-black text-gray-800">Happy</span>
                                </div>
                                <span className="text-[11px] font-bold text-gray-400 ml-4.5">{isLoadingMood ? '...' : `${moodData.happy}%`}</span>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#9f85ff]"></div>
                                    <span className="text-[13px] font-black text-gray-800">Calm</span>
                                </div>
                                <span className="text-[11px] font-bold text-gray-400 ml-4.5">{isLoadingMood ? '...' : `${moodData.calm}%`}</span>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#82b863]"></div>
                                    <span className="text-[13px] font-black text-gray-800">Sad</span>
                                </div>
                                <span className="text-[11px] font-bold text-gray-400 ml-4.5">{isLoadingMood ? '...' : `${moodData.sad}%`}</span>
                            </div>
                        </div>

                        {/* SVG Donut Chart */}
                        <div className="relative w-36 h-36">
                            <svg viewBox="0 0 100 100" className={`w-full h-full transform -rotate-90 drop-shadow-md transition-opacity duration-500 ${isLoadingMood ? 'opacity-50' : 'opacity-100'}`}>
                                {/* Happy Segment */}
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#ff8b59" strokeWidth="16" strokeDasharray={`${happyLen} ${c}`} className="drop-shadow-sm transition-all duration-1000 ease-out" />
                                {/* Calm Segment */}
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#9f85ff" strokeWidth="16" strokeDasharray={`${calmLen} ${c}`} strokeDashoffset={calmOffset} className="transition-all duration-1000 ease-out" />
                                {/* Sad Segment */}
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#82b863" strokeWidth="16" strokeDasharray={`${sadLen} ${c}`} strokeDashoffset={sadOffset} className="transition-all duration-1000 ease-out" />
                            </svg>
                            {/* Inner cut-out to make it a donut and match aesthetics */}
                            <div className="absolute inset-0 m-auto w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-inner">
                                <span className="text-3xl">😊</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-auto">
                        {/* Breathing Exercise Card */}
                        <div 
                            onClick={() => setIsBreathingOpen(true)}
                            className="bg-[#e8f6f0] rounded-[24px] p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between group hover:scale-[1.02] transition-transform cursor-pointer shadow-sm min-h-[120px] sm:min-h-[140px]">
                            <div className="flex gap-4 items-center">
                                {/* Red Character Blob */}
                                <div className="w-14 h-14 bg-[#f47b85] rounded-full shrink-0 flex items-center justify-center relative shadow-sm">
                                    <span className="text-2xl drop-shadow-sm">😵‍💫</span>
                                </div>
                                <div>
                                    <h4 className="font-black text-[15px] text-[#2c4c3b] leading-tight mb-1">Relieve stress</h4>
                                    <p className="text-[10px] font-bold text-[#558268]">Breathing practice</p>
                                </div>
                            </div>
                            <div className="mt-4 flex">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/60 text-[#2c4c3b] text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm backdrop-blur-sm">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3"><path d="M4 4h16c.3 0 .5.2.5.5v2.3c0 .5-.2.9-.5 1.3l-5 4.9c-.3.3-.5.7-.5 1.1s.2.8.5 1.1l5 4.9c.3.4.5.8.5 1.3v2.3c0 .3-.2.5-.5.5H4c-.3 0-.5-.2-.5-.5v-2.3c0-.5.2-.9.5-1.3l5-4.9c.3-.3.5-.7.5-1.1s-.2-.8-.5-1.1l-5-4.9c-.3-.4-.5-.8-.5-1.3V4.5c0-.3.2-.5.5-.5z"/></svg>
                                    15 min
                                </span>
                            </div>
                        </div>

                        {/* Mood Selector Card */}
                        <div className="bg-gradient-to-b from-[#fff5e0] to-[#ffe5be] rounded-[24px] p-5 relative overflow-hidden flex flex-col justify-between shadow-sm min-h-[140px] items-center text-center">
                            <h4 className="font-black text-[13px] text-[#a04e22] leading-tight mb-0.5">How are you really feeling today?</h4>
                            {moodData.lastUpdated && (
                                <p className="text-[9px] font-bold text-[#d67240]/80">
                                    Last updated {formatDistanceToNow(new Date(moodData.lastUpdated), { addSuffix: true })}
                                </p>
                            )}
                            
                            {/* Big Blob Face & Soundwave */}
                            <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10 py-3">
                                <div className="w-20 h-20 bg-[#fbbd57] rounded-[40%] flex items-center justify-center text-5xl shadow-md transition-transform hover:scale-105 cursor-pointer relative">
                                    <span className="relative z-10">{moodOptions.find(m => m.name === selectedMood)?.emoji || "😊"}</span>
                                </div>
                                {/* Abstract wave under the face */}
                                <div className="flex items-end justify-center gap-0.5 mt-3 h-5 opacity-40">
                                    {[2, 4, 6, 8, 12, 16, 20, 16, 12, 8, 6, 4, 2].map((h, i) => (
                                        <div key={i} className="w-[1.5px] bg-[#a04e22] rounded-full" style={{ height: `${h}px` }}></div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Horizontal scroll picker */}
                            <div className="w-[calc(100%+2rem)] -ml-4 -mr-4 overflow-x-auto pb-1 px-4 flex items-center justify-start gap-1 custom-scrollbar snap-x no-scrollbar">
                                <div className="shrink-0 w-4"></div> {/* Spacer */}
                                {moodOptions.map(mood => (
                                    <button 
                                        key={mood.name}
                                        onClick={async () => {
                                            setSelectedMood(mood.name);
                                            await fetch('/api/patient/journal', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ content: `Feeling ${mood.name.toLowerCase()} today.`, moodScore: mood.score })
                                            });
                                            router.refresh();
                                        }}
                                        className={`snap-center shrink-0 px-4 py-2 rounded-full text-[11px] font-black shadow-sm transition-all hover:scale-105 ${selectedMood === mood.name ? 'bg-white text-[#a04e22]' : 'bg-transparent text-[#d67240] hover:text-[#a04e22] shadow-none'}`}>
                                        {mood.name}
                                    </button>
                                ))}
                                <div className="shrink-0 w-4"></div> {/* Spacer */}
                            </div>
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

            <BreathingModule isOpen={isBreathingOpen} onClose={() => setIsBreathingOpen(false)} />
        </div>
    )
}
