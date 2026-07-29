"use client"

import Link from "next/link"
import Image from "next/image"
import { DEFAULT_AVATAR } from "@/lib/avatar"

export default function PragyaSidebarCard() {
    return (
        <Link
            href="/patient/ai-bot"
            className="block mt-6 group relative"
        >
            <div className="bg-[#f8fafb] rounded-[24px] px-4 py-4 flex flex-col items-center relative max-w-[280px] mx-auto">

                {/* Speech Bubble - Final refined position */}
                <div className="absolute -left-35 top-0 z-30 transform -rotate-1">
                    <div className="bg-[#f97316] text-white text-[13px] font-bold px-6 py-3 rounded-full rounded-br-sm shadow-xl shadow-orange-500/30 whitespace-nowrap relative">
                        Hi, I'm Pragya your mental health buddy
                        {/* Little tail on the right side of the bubble pointing to the bot */}
                        <div className="absolute bottom-[2px] right-4 w-4 h-4 bg-[#f97316] rounded-sm transform rotate-45 z-[-1]" />
                    </div>
                </div>

                {/* Avatar Container */}
                <div className="relative w-full aspect-square rounded-[32px] overflow-hidden bg-white shadow-inner border border-white/50 z-10">
                    <Image
                        src={DEFAULT_AVATAR}
                        alt="Pragya AI"
                        fill
                        className="object-cover w-full h-full"
                    />

                    {/* Soft Vignette Overlay for premium look */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none" />

                    {/* Cursor Pointer Indicator */}
                    <div className="absolute bottom-2 right-2 z-20 ">
                        <div className="relative group/cursor">
                            {/* Click lines/rays */}
                            <div className="absolute -top-3 -left-1 flex gap-1 opacity-100 transition-opacity">
                                <div className="w-0.5 h-2 bg-gray-800 rotate-[-45deg] origin-bottom" />
                                <div className="w-0.5 h-2 bg-gray-800 rotate-[0deg] origin-bottom" />
                                <div className="w-0.5 h-2 bg-gray-800 rotate-[45deg] origin-bottom" />
                            </div>

                            {/* Cursor SVG */}
                            <svg className="w-10 h-10 drop-shadow-md" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M5.5,3.5l14,10l-6.5,1.5l5.5,6l-2,1.5l-5.5-6l-5.5,7V3.5z"
                                    fill="white"
                                    stroke="black"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}
