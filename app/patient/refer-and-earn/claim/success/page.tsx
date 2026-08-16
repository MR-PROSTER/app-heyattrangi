"use client"

import React from "react"
import Link from "next/link"

export default function ClaimSuccessPage() {
  // Estimated delivery value is configurable here
  const estimatedDelivery = "3 - 5 Business Days"

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] font-sans text-slate-800 flex flex-col justify-between px-6 py-12 select-none relative overflow-hidden">
      
      {/* Centered Main Content Area */}
      <div className="max-w-[380px] w-full mx-auto flex-grow flex flex-col justify-center items-center text-center my-auto pb-6">
        
        {/* Top Success Icon Badge */}
        <div className="w-[100px] h-[100px] sm:w-[110px] sm:h-[110px] rounded-full bg-[#EAF7EC] text-[#35C7A5] flex items-center justify-center shadow-[0_2px_12px_rgba(53,199,165,0.02)]">
          <svg className="w-10 h-10 sm:w-11 sm:h-11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Success Title */}
        <h2 className="text-[26px] sm:text-[28px] font-black text-slate-900 tracking-[-0.75px] leading-tight mt-8 mb-4 font-sans">
          You're all set!
        </h2>

        {/* Description Copy */}
        <p className="text-[#747E8A] font-semibold text-[13.5px] sm:text-[14.5px] leading-relaxed max-w-[280px] mx-auto tracking-[-0.3px] mb-8 font-sans">
          Your T-shirt is on its way. We've sent a tracking link to your registered email. Happy cooking & meditating!
        </p>

        {/* Estimated Delivery White Card */}
        <div className="w-full bg-white border border-slate-200/50 rounded-[20px] p-5 sm:p-6 text-left shadow-[0_2px_10px_rgba(15,23,42,0.01)]">
          <label className="block text-[11px] font-extrabold text-[#747E8A] uppercase tracking-wider mb-1.5 pl-0.5 font-sans">
            Estimated Delivery
          </label>
          <span className="block text-[16px] sm:text-[17px] font-black text-slate-900 tracking-tight font-sans">
            {estimatedDelivery}
          </span>
        </div>

      </div>

      {/* Done Button Footer Action */}
      <div className="w-full max-w-[380px] mx-auto pb-2">
        <Link href="/patient/refer-and-earn" className="w-full block">
          <button
            aria-label="Done"
            className="w-full bg-[#E08053] hover:bg-[#D07043] active:scale-98 text-white py-4.5 rounded-full font-bold text-[15px] sm:text-[16px] tracking-tight shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer text-center font-sans"
          >
            Done
          </button>
        </Link>
      </div>

    </div>
  )
}
