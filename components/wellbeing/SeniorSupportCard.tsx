"use client"

import React from "react"
import Link from "next/link"

export default function SeniorSupportCard() {
  return (
    <div className="w-full max-w-2xl mx-auto bg-[#FBCFE8] rounded-[32px] p-6 sm:p-8 flex flex-col gap-6 items-start border border-pink-200/50 shadow-[0_10px_30px_rgba(0,0,0,0.02)] select-none">
      <p className="text-base sm:text-[17px] font-bold text-slate-800 leading-relaxed text-left">
        If you are feeling overwhelmed, you don’t have to carry it alone. Our senior leadership
        team is ready to support your well-being.
      </p>
      
      <Link href="/dashboard/settings/contact-support/write">
        <button
          aria-label="Talk to a Senior support team member"
          className="bg-[#1A1A2E] hover:bg-[#2A2A3F] text-white px-6 py-3.5 rounded-full text-sm font-black transition-all duration-200 active:scale-95 shadow-md shadow-black/10 cursor-pointer"
        >
          Talk to a Senior
        </button>
      </Link>
    </div>
  )
}
