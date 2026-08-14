"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { toast, Toaster } from "sonner"

export default function WriteToSandeshPage() {
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const charLimit = 2000
  const isEnabled = message.trim().length > 0

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push("/dashboard/founder-message")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEnabled || isSubmitting) return

    setIsSubmitting(true)

    try {
      const res = await fetch("/api/support/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit message")
      }

      toast.success("Thank you! Your message has been sent to Sandesh.")
      setMessage("") // Clear text area
      
      setTimeout(() => {
        router.push("/dashboard/founder-message")
      }, 1500)
    } catch (err: any) {
      toast.error(err.message || "Unable to send your message right now. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#FAF5F0] flex flex-col justify-between px-6 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] select-none animate-in fade-in duration-300">
      <Toaster position="top-center" richColors closeButton />

      {/* Header Row — Minimal ArrowLeft inside circular background */}
      <header className="w-full max-w-[430px] mx-auto flex justify-start shrink-0">
        <button
          onClick={handleBack}
          aria-label="Back to Founder Message"
          className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#1C2038] shadow-[0_2px_12px_rgba(0,0,0,0.015)] border border-zinc-100/50 active:scale-95 transition-all cursor-pointer shrink-0 animate-none"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[430px] mx-auto flex flex-col items-center justify-center py-6">
        
        {/* Envelope Vector Illustration */}
        <div className="relative w-[180px] h-[130px] flex items-center justify-center shrink-0 mb-6 mt-2">
          {/* Letter Sheet */}
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-[100px] h-[78px] bg-white border border-[#EDE6DF] rounded-[6px] shadow-sm flex flex-col items-center justify-center p-2 rotate-[-4deg] z-10">
            <span className="text-[10px] font-black text-[#1A6B6B] leading-[1.3] text-center tracking-tight font-sans">
              Share your<br />honest thoughts
            </span>
          </div>

          {/* Vector Envelope Flaps */}
          <svg className="absolute bottom-0 w-[140px] h-[90px] drop-shadow-md z-20" viewBox="0 0 140 90" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 15C5 12.2386 7.23858 10 10 10H130C132.761 10 135 12.2386 135 15V80C135 82.7614 132.761 85 130 85H10C7.23858 85 5 82.7614 5 80V15Z" fill="#D36018" />
            <path d="M5 15L70 52L5 80V15Z" fill="#E8722A" stroke="#C05C1A" strokeWidth="0.5" />
            <path d="M135 15L70 52L135 80V15Z" fill="#E8722A" stroke="#C05C1A" strokeWidth="0.5" />
            <path d="M5 80L70 45L135 80H5Z" fill="#F3853D" stroke="#C05C1A" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-[28px] min-[360px]:text-[30px] font-bold text-[#1C2038] text-center tracking-tight mb-2">
          Write to Sandesh
        </h1>

        {/* Supporting Subtitle */}
        <p className="text-[14px] font-semibold text-[#1C2038]/70 text-center leading-relaxed max-w-[340px] px-2 mb-6">
          No thought is too small. We're here to listen, and we read every word.
        </p>

        {/* Message Input Container Card */}
        <div className="relative bg-white rounded-[32px] border border-zinc-100 p-5 shadow-[0_4px_24px_rgba(0,0,0,0.015)] w-full flex-1 min-h-[260px] flex flex-col justify-between">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your thoughts..."
            maxLength={charLimit}
            disabled={isSubmitting}
            aria-label="Share your thoughts"
            className="w-full flex-1 text-[15px] font-semibold text-zinc-800 placeholder-zinc-400 bg-transparent resize-none focus:outline-none leading-relaxed"
          />
          {/* Live character counter positioned inside bottom right */}
          <div className="text-right text-[13px] font-bold text-zinc-400 mt-2 shrink-0">
            {message.length}/{charLimit}
          </div>
        </div>
      </main>

      {/* Bottom Share CTA Button */}
      <form onSubmit={handleSubmit} className="w-full max-w-[430px] mx-auto mt-4 shrink-0">
        <button
          type="submit"
          disabled={!isEnabled || isSubmitting}
          className={`flex items-center justify-center w-full h-14 font-bold text-sm rounded-[24px] shadow-sm select-none active:scale-[0.99] transition-all text-center cursor-pointer ${
            isSubmitting
              ? "bg-zinc-200 text-zinc-400 cursor-wait"
              : isEnabled
              ? "bg-[#E8722A] hover:bg-[#C05C1A] text-white"
              : "bg-[#E5E9EE] text-[#9CA5B4] cursor-not-allowed"
          }`}
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            "Share message"
          )}
        </button>
      </form>
    </div>
  )
}
