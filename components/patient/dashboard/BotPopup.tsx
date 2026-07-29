"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { DEFAULT_AVATAR } from "@/lib/avatar"

export default function BotPopup() {
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        // Auto-minimize after 3 seconds
        const timer = setTimeout(() => {
            setIsVisible(false)
        }, 3000)
        return () => clearTimeout(timer)
    }, [])

    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-orange-500 hover:bg-orange-400 rounded-full shadow-[0_4px_14px_rgba(249,115,22,0.4)] flex items-center justify-center transition-transform hover:scale-110 active:scale-95 animate-in zoom-in duration-300"
                aria-label="Open Pragya AI Bot"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </button>
        )
    }

    return (
        <div className="fixed bottom-8 right-8 z-50 w-[310px] animate-in slide-in-from-bottom-5 fade-in duration-500">
            {/* Soft background glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-orange-400/30 to-rose-200/20 rounded-[48px] blur-2xl -z-10 pointer-events-none" />

            <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-2 border-white relative overflow-hidden group">
                {/* Close Button */}
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-4 right-4 text-white bg-black/25 hover:bg-black/50 backdrop-blur-md w-7 h-7 flex items-center justify-center rounded-full transition-colors z-20"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[14px] h-[14px]">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {/* Big Hero Image */}
                <div className="relative w-full h-[180px] bg-gray-100 overflow-hidden rounded-t-[30px]">
                    <img
                        src={DEFAULT_AVATAR}
                        alt="Pragya AI"
                        className="object-cover w-full h-full"
                        onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=600" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-4 left-5 flex items-center gap-2 z-10">
                        <div className="w-2.5 h-2.5 bg-[#4ade80] rounded-full border-2 border-white shadow-sm" />
                        <span className="text-white text-[13px] font-extrabold tracking-wide drop-shadow-md">Online</span>
                    </div>
                </div>

                <div className="px-6 py-7 relative z-10 bg-white">
                    <h4 className="font-extrabold text-[#0f172a] text-[20px] mb-2 tracking-tight">Hey, I'm Pragya!</h4>
                    <p className="text-[13px] text-[#475569] font-medium leading-[1.6] mb-6">
                        Need someone to talk to or vent your feelings? I'm here 24/7. Let's chat!
                    </p>

                    <Link
                        href="/patient/ai-bot"
                        className="w-full bg-orange-500 hover:bg-orange-400 text-white text-[14px] font-bold py-3.5 rounded-full flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(249,115,22,0.4)] transition-transform hover:scale-[1.02] active:scale-95 relative z-10"
                    >
                        Chat with Pragya <span>→</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
