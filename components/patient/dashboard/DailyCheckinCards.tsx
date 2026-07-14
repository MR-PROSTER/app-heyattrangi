"use client"

import React from "react"
import Link from "next/link"

export default function DailyCheckinCards() {
    return (
        <div className="relative pl-6 py-4 flex flex-col gap-6">
            {/* Roadmap Line */}
            <div className="absolute left-[11px] top-8 bottom-8 w-1 bg-gradient-to-b from-blue-400 via-amber-400 to-purple-400 rounded-full opacity-30"></div>

            {/* Morning Check-in */}
            <div className="relative">
                {/* Node Dot */}
                <div className="absolute -left-[30px] top-6 w-5 h-5 rounded-full border-4 border-white bg-blue-500 shadow-md shadow-blue-500/30 z-10"></div>
                
                <div className="rounded-[24px] p-5 bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-blue-100 text-gray-800 shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 hover:shadow-md hover:border-blue-200">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/40 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-blue-200/40 transition-colors"></div>
                    <div className="flex items-center justify-between gap-3 mb-3 relative z-10">
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] bg-white border border-blue-100 text-blue-600 px-2.5 py-1 rounded-full shadow-sm">5 mins</span>
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-blue-100 shadow-sm">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 text-blue-500"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                    </div>
                    <h4 className="text-[18px] font-black leading-tight mb-1 relative z-10 text-gray-800">Morning Check-in</h4>
                    <p className="text-xs text-gray-500 leading-relaxed mb-4 relative z-10">Let's figure out what matters today.</p>
                    <button className="w-full inline-flex items-center justify-center rounded-[14px] bg-gray-50 border border-gray-200 text-gray-400 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] transition relative z-10">
                        Completed
                    </button>
                </div>
            </div>

            {/* Talk to AI */}
            <div className="relative">
                {/* Node Dot */}
                <div className="absolute -left-[30px] top-6 w-5 h-5 rounded-full border-4 border-white bg-orange-500 shadow-md shadow-orange-500/30 z-10 ring-4 ring-orange-500/20"></div>
                
                <div className="rounded-[24px] p-5 bg-gradient-to-br from-orange-50 via-white to-amber-50 border border-orange-100 text-gray-800 shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 hover:shadow-md hover:border-orange-200">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/40 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-orange-200/40 transition-colors"></div>
                    <div className="flex items-center justify-between gap-3 mb-3 relative z-10">
                        <div className="flex gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] bg-white border border-orange-100 text-orange-600 px-2.5 py-1 rounded-full shadow-sm">10 mins</span>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-gradient-to-r from-orange-400 to-amber-500 text-white px-2 py-0.5 rounded-full shadow-sm flex items-center">Recommended</span>
                        </div>
                    </div>
                    <h4 className="text-[18px] font-black leading-tight mb-1 text-gray-800 relative z-10">Talk to AI</h4>
                    <p className="text-xs text-gray-500 leading-relaxed mb-4 relative z-10">Talk to Pragya AI about what happened today.</p>
                    <Link href="/patient/ai-bot" className="w-full inline-flex items-center justify-center rounded-[14px] bg-white border border-orange-200 text-orange-600 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] shadow-sm transition hover:bg-orange-50 hover:border-orange-300 relative z-10">
                        Start Chat
                    </Link>
                </div>
            </div>

            {/* Journal Entry */}
            <div className="relative">
                {/* Node Dot */}
                <div className="absolute -left-[30px] top-6 w-5 h-5 rounded-full border-4 border-white bg-purple-500 shadow-md shadow-purple-500/30 z-10 ring-4 ring-purple-500/20"></div>
                
                <div className="rounded-[24px] p-5 bg-gradient-to-br from-purple-50 via-white to-pink-50 border border-purple-100 text-gray-800 shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 hover:shadow-md hover:border-purple-200">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/40 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-purple-200/40 transition-colors"></div>
                    <div className="flex items-center justify-between gap-3 mb-3 relative z-10">
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] bg-white border border-purple-100 text-purple-600 px-2.5 py-1 rounded-full shadow-sm">5 mins</span>
                    </div>
                    <h4 className="text-[18px] font-black leading-tight mb-1 text-gray-800 relative z-10">Daily Journal</h4>
                    <p className="text-xs text-gray-500 leading-relaxed mb-4 relative z-10">Write your journal entry for today.</p>
                    <Link href="/patient/journal" className="w-full inline-flex items-center justify-center rounded-[14px] bg-white border border-purple-200 text-purple-600 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] shadow-sm transition hover:bg-purple-50 hover:border-purple-300 relative z-10">
                        Write Entry
                    </Link>
                </div>
            </div>
        </div>
    )
}
