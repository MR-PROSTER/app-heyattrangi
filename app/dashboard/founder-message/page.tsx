"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function FounderMessagePage() {
  const router = useRouter()

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push("/dashboard/profile")
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#FAF5F0] flex flex-col justify-between px-6 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] select-none animate-in fade-in duration-300">
      
      {/* Header Area — Only Back Button */}
      <header className="w-full max-w-[430px] mx-auto flex justify-start shrink-0">
        <button
          onClick={handleBack}
          aria-label="Back to Profile"
          className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#1C2038] shadow-[0_2px_12px_rgba(0,0,0,0.015)] border border-zinc-100/50 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[430px] mx-auto flex flex-col justify-center items-center py-6">
        
        {/* Founder Illustration */}
        <div className="relative w-44 h-44 mb-[-32px] z-10 flex items-center justify-center shrink-0">
          <img
            src="https://res.cloudinary.com/dxoiluua8/image/upload/v1786739384/Founder_yqsoqz.png"
            alt="Sandesh - Founder of Attrangi"
            onError={(e) => {
              // Fallback to the real photo of Sandesh if illustration is missing
              e.currentTarget.src = "/images/founder2.png"
            }}
            className="w-full h-full object-contain rounded-full bg-transparent"
          />
        </div>

        {/* Message Card */}
        <div className="bg-white rounded-[32px] border border-zinc-100 shadow-[0_4px_24px_rgba(0,0,0,0.015)] p-8 pt-16 flex flex-col gap-5 w-full text-left">
          
          <h2 className="text-[#1C2038] font-bold text-[24px] min-[360px]:text-[26px] leading-[1.3] tracking-tight">
            Hi, I'm Sandesh<br />
            I started Attrangi, and I still read everything that comes through here myself.
          </h2>

          <p className="text-[14px] min-[360px]:text-[15px] font-semibold text-zinc-500 leading-relaxed">
            If something felt confusing, or just didn't sit right while using Attrangi, I'd like to know. Not because we need to hear nice things — because we're building this for people who are already carrying a lot, and getting the small things right matters more here than it does for most apps.
          </p>

          <p className="text-[14px] min-[360px]:text-[15px] font-semibold text-zinc-500 leading-relaxed">
            For everything else, take your time. I read every word.
          </p>

          <hr className="border-t border-zinc-100 my-1" />

          <div className="space-y-0.5">
            <p className="text-[14px] min-[360px]:text-[15px] font-semibold text-zinc-400">— Sandesh</p>
            <p className="text-[14px] min-[360px]:text-[15px] font-bold text-[#1C2038]">Founder, Attrangi</p>
          </div>
        </div>

      </main>

      {/* Action CTA Button */}
      <div className="w-full max-w-[430px] mx-auto mt-2 shrink-0">
        <Link
          href="/dashboard/founder-message/write"
          className="flex items-center justify-center w-full bg-[#E8722A] hover:bg-[#C05C1A] text-white font-bold text-[16px] py-4.5 rounded-[32px] shadow-sm active:scale-[0.98] transition-all text-center cursor-pointer select-none"
        >
          Write to Sandesh
        </Link>
      </div>

    </div>
  )
}
