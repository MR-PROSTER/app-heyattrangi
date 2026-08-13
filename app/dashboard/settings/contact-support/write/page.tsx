"use client"
 
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { toast, Toaster } from "sonner"
 
export default function WriteToSandeshPage() {
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
 
  const charLimit = 2000
  const isEnabled = message.trim().length > 0
 
  const handleBack = () => {
    // Navigate back to the founder letter page
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push("/dashboard/settings/contact-support")
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
        router.push("/dashboard/settings/contact-support")
      }, 1500)
    } catch (err: any) {
      toast.error(err.message || "Unable to send your message right now. Please try again.")
      setIsSubmitting(false)
    }
  }
 
  return (
    <div className="min-h-screen w-full bg-[#FAF5F0] flex flex-col justify-between px-4 min-[360px]:px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] select-none animate-in fade-in duration-300">
      <Toaster position="top-center" richColors closeButton />
 
      {/* Top Header Row */}
      <header className="flex items-center w-full max-w-[430px] mx-auto py-2 shrink-0">
        <button
          onClick={handleBack}
          aria-label="Go back"
          className="w-11 h-11 flex items-center justify-start text-zinc-800 active:scale-95 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
        </button>
      </header>
 
      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[430px] mx-auto flex flex-col items-center justify-center py-4">
        {/* Envelope Vector Illustration */}
        <div className="relative w-[180px] h-[130px] flex items-center justify-center shrink-0 mb-4">
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
        <h1 className="text-[clamp(24px,7vw,28px)] font-black text-zinc-900 text-center tracking-tight mb-2">
          Write to Sandesh
        </h1>
 
        {/* Supporting Subtitle */}
        <p className="text-[clamp(13px,3.8vw,14px)] font-semibold text-zinc-450 text-center leading-relaxed px-4 mb-6">
          No thought is too small. We're here to listen, and we read every word.
        </p>
 
        {/* Message Input Container */}
        <div className="relative bg-white rounded-3xl border border-[#EDE6DF]/80 p-4 shadow-[0_2px_15px_-6px_rgba(0,0,0,0.02)] w-full">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your thoughts..."
            maxLength={charLimit}
            disabled={isSubmitting}
            aria-label="Share your thoughts"
            className="w-full h-[clamp(220px,60vw,300px)] text-[clamp(14px,4vw,15.5px)] font-semibold text-zinc-800 placeholder-zinc-400 bg-transparent resize-none focus:outline-none leading-relaxed pr-2"
          />
          {/* Live character counter */}
          <div className="absolute bottom-4 right-4 text-xs font-bold text-zinc-400">
            {message.length}/{charLimit}
          </div>
        </div>
      </main>
 
      {/* Bottom Share CTA Button */}
      <form onSubmit={handleSubmit} className="w-full max-w-[430px] mx-auto mt-4 shrink-0">
        <button
          type="submit"
          disabled={!isEnabled || isSubmitting}
          className={`flex items-center justify-center w-full h-[52px] font-black text-sm rounded-[24px] shadow-sm select-none active:scale-[0.99] transition-all text-center cursor-pointer ${
            isSubmitting
              ? "bg-zinc-200 text-zinc-400 cursor-wait"
              : isEnabled
              ? "bg-[#E8722A] hover:bg-[#C05C1A] text-white"
              : "bg-[#E6ECF0] text-zinc-400 cursor-not-allowed"
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
