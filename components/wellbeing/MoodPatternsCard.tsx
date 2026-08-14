"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"

export default function MoodPatternsCard() {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-[32px] sm:rounded-[36px] p-5 sm:p-9 border border-slate-200/50 shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex flex-row justify-between items-center gap-4 sm:gap-8 relative select-none overflow-hidden h-[180px] sm:h-[250px]">
      
      {/* Left Content Area (55-60% width) */}
      <div className="flex flex-col gap-3 sm:gap-5 items-start flex-1 min-w-0 z-10 py-1 sm:py-2">
        <h2 className="text-[22px] sm:text-[32px] md:text-[34px] font-bold text-[#1E1E2E] tracking-tight leading-none">
          Your mood patterns
        </h2>
        
        <p className="text-[12.5px] sm:text-[18px] md:text-[19px] text-[#4B5563] font-medium leading-tight sm:leading-relaxed max-w-[300px] sm:max-w-[420px] text-left">
          Look back at your mood and see<br className="hidden sm:inline" /> what’s changed over time.
        </p>
        
        <Link href="/patient/wellbeing/trends">
          <button
            aria-label="See mood patterns"
            className="bg-[#1E1E2E] hover:bg-[#2A2A3F] text-white flex items-center justify-center gap-2 sm:gap-3 transition-all duration-200 active:scale-95 shadow-md shadow-black/5 cursor-pointer rounded-full h-[44px] sm:h-[60px] w-[170px] sm:w-[240px] text-xs sm:text-base font-extrabold"
          >
            See patterns <span className="text-sm sm:text-lg font-medium">→</span>
          </button>
        </Link>
      </div>

      {/* Right Content Area Image */}
      <div className="relative w-36 h-28 sm:w-56 sm:h-40 shrink-0 select-none pointer-events-none mr-[-10px] sm:mr-0">
        <Image
          src="https://res.cloudinary.com/dxoiluua8/image/upload/v1786729102/Your_mood_patterns_r4d34p.png"
          alt="Your mood patterns illustration"
          width={224}
          height={160}
          className="object-contain w-full h-full animate-fade-in"
          priority
        />
      </div>

    </div>
  )
}
