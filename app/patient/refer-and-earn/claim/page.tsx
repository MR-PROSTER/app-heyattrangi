"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default function ClaimTshirtPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Size Selector State
  const [shirtSize, setShirtSize] = useState("M")

  // Form Fields State
  const [name, setName] = useState("")
  const [rollNo, setRollNo] = useState("")
  const [address, setAddress] = useState("")

  // Fetch current user details from database on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile/patient")
        if (res.ok) {
          const data = await res.json()
          setName(data.name || session?.user?.name || "")
          setRollNo(data.rollNumber || "")
        } else {
          setName(session?.user?.name || "")
        }
      } catch (e) {
        console.error("Failed to load patient profile details:", e)
        setName(session?.user?.name || "")
      }

      // Load previously filled shipping address from local storage if exists
      const userId = session?.user?.id || "guest"
      const savedAddress = localStorage.getItem(`attrangi_claim_address_${userId}`)
      if (savedAddress) {
        setAddress(savedAddress)
      }
      setLoading(false)
    }

    if (session?.user) {
      loadProfile()
    } else {
      // If session is still loading or guest
      const timer = setTimeout(() => {
        loadProfile()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !rollNo.trim() || !address.trim() || !shirtSize) {
      return
    }

    setSubmitting(true)

    // Simulate backend api save delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const userId = session?.user?.id || "guest"

    // Save claim details to localStorage
    const claimData = {
      size: shirtSize,
      name: name.trim(),
      rollNo: rollNo.trim(),
      address: address.trim(),
      claimedAt: new Date().toISOString(),
    }
    localStorage.setItem(`attrangi_referrals_claim_${userId}`, JSON.stringify(claimData))
    localStorage.setItem(`attrangi_referral_reward_status_${userId}`, "claimed")
    localStorage.setItem(`attrangi_claim_address_${userId}`, address.trim())

    setSubmitting(false)
    
    // Redirect to claim success screen
    router.push("/patient/refer-and-earn/claim/success")
  }

  // Check form validation state
  const isFormValid = name.trim().length > 0 && rollNo.trim().length > 0 && address.trim().length > 0

  if (loading) {
    return (
      <div className="w-full h-full min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#E08053] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] font-sans text-slate-800 flex flex-col justify-start px-6 py-6 select-none">
      
      {/* Outer Max-Width Container */}
      <div className="w-full max-w-[430px] mx-auto flex flex-col gap-6 md:gap-8">
        
        {/* Header Navigation with Back Arrow and Title */}
        <header className="flex flex-col gap-5 pt-2">
          <Link href="/patient/refer-and-earn/reward">
            <button
              aria-label="Go back"
              className="w-10 h-10 rounded-full bg-white border border-slate-200/80 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm text-slate-700 cursor-pointer"
            >
              <ChevronLeft className="w-5.5 h-5.5 stroke-[2.5]" />
            </button>
          </Link>
          
          <h1 className="text-[26px] sm:text-[28px] font-extrabold text-slate-900 tracking-[-0.75px] leading-tight font-sans">
            Claim your T-shirt
          </h1>
        </header>

        {/* Claim Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Sizing Section */}
          <div className="flex flex-col gap-2.5">
            <label className="text-[11px] font-extrabold text-[#747E8A] uppercase tracking-wider pl-0.5 font-sans">
              Select T-shirt Size
            </label>
            
            {/* Horizontal size selector wrapping pill */}
            <div className="flex w-full items-center justify-between bg-white border border-slate-200/95 rounded-full p-1 shadow-[0_2px_8px_rgba(15,23,42,0.01)]">
              {["S", "M", "L", "XL"].map((sz) => {
                const isSelected = shirtSize === sz
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setShirtSize(sz)}
                    className={`flex-1 py-3 text-[14px] font-bold rounded-full transition-all cursor-pointer select-none text-center font-sans ${
                      isSelected
                        ? "bg-[#E08053] text-white shadow-sm font-extrabold"
                        : "text-slate-850 hover:text-slate-950 font-bold"
                    }`}
                  >
                    {sz}
                  </button>
                )
              })}
            </div>
          </div>

          {/* User Name Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="name-input" className="text-[11px] font-extrabold text-[#747E8A] uppercase tracking-wider pl-0.5 font-sans">
              Your Name
            </label>
            <input
              id="name-input"
              type="text"
              required
              placeholder="e.g. Priya Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-slate-200/80 rounded-2xl px-5 py-4 text-[14px] font-bold text-slate-850 placeholder-slate-400 focus:outline-none focus:border-[#E08053] focus:ring-1 focus:ring-[#E08053] transition-all shadow-[0_2px_8px_rgba(15,23,42,0.005)] font-sans"
            />
          </div>

          {/* Roll No. Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="roll-input" className="text-[11px] font-extrabold text-[#747E8A] uppercase tracking-wider pl-0.5 font-sans">
              Roll No.
            </label>
            <input
              id="roll-input"
              type="text"
              required
              placeholder="e.g. 26BCS001"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              className="w-full bg-white border border-slate-200/80 rounded-2xl px-5 py-4 text-[14px] font-bold text-slate-850 placeholder-slate-400 focus:outline-none focus:border-[#E08053] focus:ring-1 focus:ring-[#E08053] transition-all shadow-[0_2px_8px_rgba(15,23,42,0.005)] font-sans"
            />
          </div>

          {/* Delivery Address Textarea */}
          <div className="flex flex-col gap-2">
            <label htmlFor="address-input" className="text-[11px] font-extrabold text-[#747E8A] uppercase tracking-wider pl-0.5 font-sans">
              Delivery Address
            </label>
            <textarea
              id="address-input"
              required
              rows={3}
              placeholder="e.g. B435, IIIT Dharwad"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-white border border-slate-200/80 rounded-2xl px-5 py-4 text-[14px] font-bold text-slate-850 placeholder-slate-400 focus:outline-none focus:border-[#E08053] focus:ring-1 focus:ring-[#E08053] transition-all resize-none shadow-[0_2px_8px_rgba(15,23,42,0.005)] font-sans"
            />
          </div>

          {/* Confirm & Claim CTA Button */}
          <button
            type="submit"
            disabled={!isFormValid || submitting}
            className={`w-full py-4.5 rounded-full font-bold text-[15px] sm:text-[16px] tracking-tight shadow-md hover:shadow-lg active:scale-98 transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer mt-2 text-white font-sans ${
              !isFormValid
                ? "bg-slate-300 border-slate-300 text-slate-400 cursor-not-allowed shadow-none hover:shadow-none active:scale-100"
                : "bg-[#E08053] hover:bg-[#D07043]"
            }`}
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Confirming...</span>
              </div>
            ) : (
              "Confirm & claim"
            )}
          </button>

        </form>
      </div>

    </div>
  )
}
