"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

interface Referral {
  id: string
  inviteeName: string
  status: "PENDING" | "JOINED"
  createdAt: string
}

interface ReferralData {
  code: string
  referralUrl: string
  referrals: Referral[]
  joinedCount: number
  rewardClaimed: boolean
  claimInfo: {
    size: string | null
    address: string | null
    phone: string | null
    claimedAt: string | null
  } | null
}

const NEEDED_FOR_TSHIRT = 30

// Anonymise display name: "Priya Sharma" → "Priya S."
function anonymiseName(name: string): string {
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`
}

export default function ReferAndEarnPage() {
  const [data, setData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [successToast, setSuccessToast] = useState("")
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false)

  // Claim form state
  const [shirtSize, setShirtSize] = useState("M")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimSuccess, setClaimSuccess] = useState(false)

  const showToast = useCallback((message: string) => {
    setSuccessToast(message)
    setTimeout(() => setSuccessToast(""), 3000)
  }, [])

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/patient/referral")
      const json = await res.json()
      if (res.ok) {
        setData(json)
        if (json.claimInfo?.size) setShirtSize(json.claimInfo.size)
        if (json.claimInfo?.address) setAddress(json.claimInfo.address)
        if (json.claimInfo?.phone) setPhone(json.claimInfo.phone)
      }
    } catch (err) {
      console.error("Failed to fetch referral data:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-open claim modal from query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("claim") === "true") {
      setIsClaimModalOpen(true)
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const handleCopyLink = () => {
    if (!data) return
    navigator.clipboard.writeText(`https://${data.referralUrl}`).then(
      () => {
        setCopied(true)
        showToast("Invite link copied!")
        setTimeout(() => setCopied(false), 2000)
      },
      () => showToast("Failed to copy link.")
    )
  }

  const handleShare = async () => {
    if (!data) return
    const shareText = `Hey! I use Attrangi for my mental wellness journey. Sign up using my link and let's support each other 💛\n\nhttps://${data.referralUrl}`
    if (navigator.share) {
      try {
        await navigator.share({ title: "Join me on Attrangi", text: shareText, url: `https://${data.referralUrl}` })
      } catch {
        // user cancelled share — no-op
      }
    } else {
      navigator.clipboard.writeText(shareText)
      showToast("Share text copied!")
    }
  }

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address.trim() || !phone.trim()) return
    setIsClaiming(true)
    try {
      const res = await fetch("/api/patient/referral/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: address.trim(), phone: phone.trim(), size: shirtSize }),
      })
      if (res.ok) {
        setClaimSuccess(true)
        showToast("T-shirt reward claimed!")
        fetchData()
      } else {
        const err = await res.json()
        showToast(err.error || "Failed to claim reward.")
      }
    } catch (err) {
      console.error("Failed to claim:", err)
    } finally {
      setIsClaiming(false)
    }
  }

  const joinedCount = data?.joinedCount ?? 0
  const remainingCount = Math.max(NEEDED_FOR_TSHIRT - joinedCount, 0)
  const isRewardUnlocked = joinedCount >= NEEDED_FOR_TSHIRT
  const progressPct = Math.min((joinedCount / NEEDED_FOR_TSHIRT) * 100, 100)
  const joinedReferrals = (data?.referrals ?? []).filter((r) => r.status === "JOINED")

  return (
    <div className="flex-1 w-full h-full min-h-screen bg-[#FAF8F5] overflow-y-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 font-sans select-none relative">

      {/* Toast */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#1E1E2E] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-white/10"
          >
            <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-[13px] font-bold tracking-tight">{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[540px] mx-auto flex flex-col gap-6 md:gap-8 pb-16">

        {/* Header */}
        <header className="flex flex-col gap-6">
          <Link href="/patient/dashboard">
            <button aria-label="Go back" className="w-10 h-10 rounded-full bg-white border border-slate-200/80 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm text-slate-700 cursor-pointer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
          </Link>

          <div className="flex flex-col gap-3 pl-1">
            <h1 className="text-[25px] sm:text-[28px] font-extrabold text-slate-800 leading-[32px] sm:leading-[36px] tracking-[-0.75px] font-sans">
              Refer &amp; Earn 💛
            </h1>
            <p className="text-slate-400 font-semibold text-[13px] sm:text-[14.5px] leading-relaxed tracking-[-0.3px]">
              Share your link. When friends join Attrangi, they appear here.
            </p>
          </div>
        </header>

        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="bg-white rounded-[32px] h-[280px] border border-slate-100" />
            <div className="bg-white rounded-[32px] h-[200px] border border-slate-100" />
          </div>
        ) : (
          <>
            {/* How it works + Share card */}
            <section className="bg-white rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 md:p-8 border border-slate-100/90 shadow-[0_4px_24px_rgba(15,23,42,0.012)] flex flex-col gap-6">
              <h4 className="text-slate-400 text-[12px] font-black uppercase tracking-wider">How it works</h4>

              <div className="flex flex-col gap-5 pl-0.5">
                {[
                  { icon: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71", label: "Share your personal invite link below" },
                  { icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75", label: "Your friend downloads Attrangi and signs up using your link" },
                  { icon: "M12 8v13m0-13V6a2 2 0 1 1 2 2h-2zm0 0V5a2 2 0 1 0-2 2h2zm0 0h4l-1 5H9l-1-5h4z", label: "Reach 30 friends joined → get an Attrangi T-shirt!" },
                ].map(({ icon, label }, i) => (
                  <div key={i} className="flex items-start gap-3.5">
                    <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d={icon} />
                      </svg>
                    </div>
                    <span className="text-[13px] sm:text-[14px] font-semibold text-slate-700 leading-snug tracking-[-0.3px]">{label}</span>
                  </div>
                ))}
              </div>

              {/* Share link + buttons */}
              <div className="flex flex-col gap-3">
                <span className="text-[12px] font-bold text-slate-500">Your invite link</span>
                <div className="w-full bg-[#FAF8F5] border border-slate-200/60 rounded-2xl p-1.5 pl-4 flex items-center justify-between gap-3 min-w-0">
                  <span className="text-[12.5px] font-bold text-slate-600 truncate select-all flex-1">
                    {data?.referralUrl}
                  </span>
                  <button
                    onClick={handleCopyLink}
                    aria-label="Copy invite link"
                    className="bg-[#1E1E2E] hover:opacity-90 active:scale-95 text-white px-4 py-2.5 rounded-[12px] font-extrabold text-[12px] shrink-0 tracking-tight transition-all cursor-pointer"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>

                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 bg-[#F99254] hover:bg-[#E87E3E] text-white py-3 rounded-2xl font-bold text-[13.5px] shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                  Share with friends
                </button>
              </div>
            </section>

            {/* Progress + Joined users */}
            <section className="flex flex-col gap-4">
              {/* Progress bar */}
              <div className="flex flex-col gap-2 px-1">
                <div className="flex items-center justify-between">
                  <span className="text-[15px] sm:text-[16px] font-extrabold text-slate-800 tracking-[-0.4px]">
                    {joinedCount} / {NEEDED_FOR_TSHIRT} friends joined
                  </span>
                  <span className={`text-[12.5px] font-bold tracking-tight ${isRewardUnlocked ? "text-emerald-500" : "text-[#D97D43]"}`}>
                    {isRewardUnlocked
                      ? (data?.rewardClaimed ? "T-shirt claimed 👕" : "T-shirt unlocked 🎉")
                      : remainingCount === 1
                      ? "1 left!"
                      : `${remainingCount} left`}
                  </span>
                </div>
                <div className="w-full h-[6px] bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(to right, #F99254, #E87E3E)" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Reward unlocked banner */}
              {isRewardUnlocked && !data?.rewardClaimed && (
                <motion.div
                  initial={{ scale: 0.98, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-gradient-to-r from-[#FEF5ED] to-[#FAF8F5] border-2 border-[#F99254]/30 rounded-[20px] sm:rounded-[24px] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-full bg-[#F99254]/10 flex items-center justify-center shrink-0 text-[#F99254]">
                      <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm0 0h4l-1 5H9l-1-5h4z" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-extrabold text-[15px] text-slate-800 tracking-tight block">You earned a T-shirt! 🎉</span>
                      <span className="text-[11.5px] font-semibold text-slate-400">Reached {joinedCount} referrals — claim below.</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsClaimModalOpen(true)}
                    className="bg-[#F99254] hover:bg-[#E87E3E] text-white px-5 py-2.5 rounded-full font-bold text-[12.5px] shrink-0 tracking-tight transition-all active:scale-95 shadow-sm cursor-pointer"
                  >
                    Claim your T-shirt →
                  </button>
                </motion.div>
              )}

              {/* Joined users list */}
              <div className="bg-white rounded-[28px] sm:rounded-[32px] border border-slate-100/90 shadow-[0_4px_24px_rgba(15,23,42,0.012)] overflow-hidden">
                <div className="px-5 sm:px-6 pt-5 pb-3 border-b border-slate-100">
                  <h4 className="text-[14px] font-black text-slate-800 tracking-tight">
                    Friends who joined
                    {joinedCount > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center bg-[#F99254]/10 text-[#D97D43] text-[11px] font-extrabold px-2 py-0.5 rounded-full">
                        {joinedCount}
                      </span>
                    )}
                  </h4>
                </div>

                {joinedReferrals.length === 0 ? (
                  <div className="flex flex-col items-center text-center gap-4 px-6 py-10">
                    <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[14px] font-black text-slate-700 tracking-tight">No one has joined yet</p>
                      <p className="text-[12px] font-semibold text-slate-400 mt-1 max-w-[220px] leading-relaxed">
                        Share your link above and friends who sign up will appear here automatically.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {joinedReferrals.map((item, i) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-4 px-5 sm:px-6 py-4"
                      >
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F99254] to-[#E87E3E] flex items-center justify-center text-white font-extrabold text-[14px] shrink-0">
                          {anonymiseName(item.inviteeName)[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-extrabold text-[14px] sm:text-[15px] text-slate-800 truncate">
                            {anonymiseName(item.inviteeName)}
                          </p>
                          <p className="text-[11.5px] font-semibold text-slate-400 mt-0.5">
                            Joined {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-[#EAF7EC] flex items-center justify-center shrink-0">
                          <svg className="w-3.5 h-3.5 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>

      {/* Claim T-shirt Modal */}
      <AnimatePresence>
        {isClaimModalOpen && (
          <div className="fixed inset-0 z-50 bg-[#1E1E2E]/40 backdrop-blur-sm flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", damping: 24, stiffness: 300 }}
              className="bg-white rounded-[24px] p-6 max-w-[420px] w-full border border-slate-100 shadow-2xl flex flex-col gap-5"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-[17px] font-black text-slate-800 tracking-tight">Claim Attrangi T-shirt 👕</h3>
                <button
                  onClick={() => setIsClaimModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {claimSuccess || data?.rewardClaimed ? (
                <div className="text-center py-6 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-slate-800 text-[15px] font-black">Order submitted!</h4>
                    <p className="text-[12px] font-semibold text-slate-400 max-w-[240px] mx-auto mt-1 leading-relaxed">
                      Your Attrangi T-shirt (Size {shirtSize}) will be shipped to your address shortly.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleClaimSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-bold text-slate-500">T-shirt Size</label>
                    <div className="flex gap-2.5">
                      {["S", "M", "L", "XL"].map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setShirtSize(sz)}
                          className={`flex-1 py-2 rounded-xl font-extrabold text-[13px] border transition-all cursor-pointer ${
                            shirtSize === sz
                              ? "bg-[#00829B] border-[#00829B] text-white"
                              : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-slate-500">Delivery Address</label>
                    <textarea
                      required rows={3} value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter complete shipping address..."
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13.5px] font-semibold text-slate-700 focus:outline-none focus:border-[#00829B] resize-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-slate-500">Phone Number</label>
                    <input
                      type="tel" required value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13.5px] font-semibold text-slate-700 focus:outline-none focus:border-[#00829B]"
                    />
                  </div>
                  <button
                    type="submit" disabled={isClaiming}
                    className="w-full bg-[#F99254] hover:bg-[#E87E3E] text-white py-3 rounded-xl font-bold text-[13.5px] shadow-sm transition-all cursor-pointer mt-1 disabled:opacity-60"
                  >
                    {isClaiming ? "Submitting..." : "Submit Order"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
