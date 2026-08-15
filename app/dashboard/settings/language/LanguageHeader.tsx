"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"

export default function LanguageHeader() {
  const router = useRouter()

  const handleBack = () => {
    router.push("/dashboard/settings")
  }

  return (
    <header className="flex items-center w-full max-w-[430px] mx-auto px-6 py-4 gap-2 shrink-0 text-left">
      <button
        onClick={handleBack}
        aria-label="Back to Settings"
        className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-zinc-950 active:scale-90 transition-all cursor-pointer"
      >
        <ChevronLeft className="w-8 h-8 stroke-[2.5]" />
      </button>
      <h1 className="text-[clamp(28px,8vw,32px)] font-bold text-[#1C2038] tracking-tight leading-none">
        Language
      </h1>
    </header>
  )
}
