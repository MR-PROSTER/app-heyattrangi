"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"

interface Activity {
    id: string
    type: "mood" | "activity" | "assessment" | "journal"
    title: string
    description: string
    timestamp: string
}

function formatRelativeDate(dateString: string): string {
    try {
        const date = new Date(dateString)
        const today = new Date()
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)

        const dateStr = date.toDateString()
        if (dateStr === today.toDateString()) {
            return "Today"
        }
        if (dateStr === yesterday.toDateString()) {
            return "Yesterday"
        }

        return format(date, "MMM d")
    } catch (e) {
        return ""
    }
}

export default function RecentActivity() {
    const [activities, setActivities] = useState<Activity[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let isMounted = true

        fetch("/api/patient/activity")
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to load activity log")
                }
                return res.json()
            })
            .then((data) => {
                if (isMounted) {
                    setActivities(data.activities || [])
                    setLoading(false)
                }
            })
            .catch((err) => {
                if (isMounted) {
                    console.error("RecentActivity fetch error:", err)
                    setError("Unable to load recent activity.")
                    setLoading(false)
                }
            })

        return () => {
            isMounted = false
        }
    }, [])

    const getIconDetails = (type: Activity["type"]) => {
        switch (type) {
            case "mood":
                return {
                    bg: "bg-[#FEF5ED] text-[#D97736]",
                    svg: (
                        <svg className="w-5 h-5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    )
                }
            case "assessment":
                return {
                    bg: "bg-[#E6F4F8] text-[#00829B]",
                    svg: (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                    )
                }
            case "activity":
                return {
                    bg: "bg-[#FDF2F2] text-[#E05252]",
                    svg: (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    )
                }
            case "journal":
                return {
                    bg: "bg-[#EAF6EC] text-[#1E8A37]",
                    svg: (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    )
                }
            default:
                return {
                    bg: "bg-slate-50 text-slate-400",
                    svg: (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )
                }
        }
    }

    if (error) {
        return (
            <div className="w-full text-left pl-1">
                <span className="text-[12px] font-medium text-red-500 font-sans">{error}</span>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full flex flex-col gap-3"
        >
            {/* Header Text */}
            <div className="w-full text-left pl-1">
                <h3 className="text-[17px] font-black text-slate-800 tracking-[-0.5px] leading-none font-sans">
                    Recent activity
                </h3>
            </div>

            {/* White Rounded Card container */}
            <div className="bg-white rounded-[24px] min-[360px]:rounded-[28px] min-[390px]:rounded-[32px] p-4 min-[360px]:p-5 min-[390px]:p-6 border border-slate-100/90 shadow-[0_4px_24px_rgba(15,23,42,0.015)] w-full">
                {loading ? (
                    /* Loading/Skeleton State */
                    <div className="space-y-4 py-1.5" aria-hidden="true">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center justify-between gap-4 animate-pulse">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-slate-100 rounded w-28" />
                                        <div className="h-3 bg-slate-50 rounded w-20" />
                                    </div>
                                </div>
                                <div className="h-3 bg-slate-50 rounded w-10 shrink-0" />
                            </div>
                        ))}
                    </div>
                ) : activities.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-8 px-4 flex flex-col gap-2">
                        <span className="text-[14px] font-bold text-slate-700 font-sans">
                            No recent activity yet
                        </span>
                        <span className="text-[12px] font-semibold text-slate-400 leading-relaxed font-sans max-w-[260px] mx-auto">
                            Your completed check-ins and activities will appear here.
                        </span>
                    </div>
                ) : (
                    /* Activity List */
                    <div className="flex flex-col">
                        {activities.map((item, idx) => {
                            const { bg, svg } = getIconDetails(item.type)
                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.25, delay: idx * 0.05 }}
                                    className={`flex items-center justify-between gap-4 py-3.5 ${
                                        idx === 0 ? "pt-0.5" : "border-t border-slate-50"
                                    } ${idx === activities.length - 1 ? "pb-0.5" : ""}`}
                                >
                                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                        {/* Icon Container */}
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bg}`}>
                                            {svg}
                                        </div>

                                        {/* Activity Info */}
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <span className="font-extrabold text-[14px] min-[390px]:text-[15px] sm:text-[16px] text-slate-900 leading-tight truncate font-sans tracking-[-0.5px]">
                                                {item.title}
                                            </span>
                                            <span className="text-[11.5px] min-[390px]:text-[12px] font-medium text-slate-400 leading-snug mt-0.5 min-[390px]:mt-1 truncate font-sans tracking-[-0.5px]">
                                                {item.description}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Relative Date Label */}
                                    <span className="text-[12px] sm:text-[13px] font-bold text-slate-400 shrink-0">
                                        {formatRelativeDate(item.timestamp)}
                                    </span>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>
        </motion.div>
    )
}
