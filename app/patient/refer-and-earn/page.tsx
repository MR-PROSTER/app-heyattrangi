"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"

interface Invitation {
  id: string
  name: string
  status: "joined" | "pending"
  date: string
}

const defaultDummyInvitations: Invitation[] = [
  {
    id: "dummy-1",
    name: "Priya Sharma",
    status: "joined",
    date: "12 Aug 2026",
  },
  {
    id: "dummy-2",
    name: "Arjun Mehta",
    status: "joined",
    date: "10 Aug 2026",
  },
  {
    id: "dummy-3",
    name: "Kavya Nair",
    status: "pending",
    date: "8 Aug 2026",
  },
]

export default function ReferAndEarnPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [copied, setCopied] = useState(false)
  
  // Set default state directly to seed the populated layout immediately
  const [invitations, setInvitations] = useState<Invitation[]>(defaultDummyInvitations)
  
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false)
  const [inviteName, setInviteName] = useState("")
  const [inviteStatus, setInviteStatus] = useState<"joined" | "pending">("pending")
  const [loading, setLoading] = useState(true)
  const [successToast, setSuccessToast] = useState("")

  // Shipping form state for T-shirt claim
  const [shirtSize, setShirtSize] = useState("M")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [isClaimed, setIsClaimed] = useState(false)

  // Generate a dynamic, non-hardcoded invite link based on authenticated user session
  const referralCode = session?.user?.name
    ? `INVITE-${session.user.name.split(" ")[0].toUpperCase()}-${session.user.id?.slice(-4).toUpperCase() || "30"}`
    : "ATTRANGI-30X"
  const referralUrl = `heyattrangi.com/invite/${referralCode}`

  // Load and seed invitations
  useEffect(() => {
    const userId = session?.user?.id || "guest"
    const isInitialized = localStorage.getItem(`attrangi_referrals_init_v4_${userId}`)
    
    if (!isInitialized) {
      // Force seed the dummy data on first load so they see it right now
      localStorage.setItem(`attrangi_referrals_${userId}`, JSON.stringify(defaultDummyInvitations))
      localStorage.setItem(`attrangi_referrals_init_v4_${userId}`, "true")
      setInvitations(defaultDummyInvitations)
    } else {
      const saved = localStorage.getItem(`attrangi_referrals_${userId}`)
      if (saved) {
        try {
          setInvitations(JSON.parse(saved))
        } catch (e) {
          console.error(e)
        }
      }
    }

    // Load claimed reward status and info
    const claimedStatus = localStorage.getItem(`attrangi_referral_reward_status_${userId}`)
    setIsClaimed(claimedStatus === "claimed")
    if (claimedStatus === "claimed") {
      const savedClaim = localStorage.getItem(`attrangi_referrals_claim_${userId}`)
      if (savedClaim) {
        try {
          const parsed = JSON.parse(savedClaim)
          if (parsed.size) setShirtSize(parsed.size)
          if (parsed.address) setAddress(parsed.address)
        } catch (e) {
          console.error(e)
        }
      }
    }

    setLoading(false)
  }, [session])

  // Check query params to open claim modal automatically
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("claim") === "true") {
      setIsClaimModalOpen(true)
      // Clean up the URL query parameter for clean reload
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const saveInvitations = (newInvites: Invitation[]) => {
    setInvitations(newInvites)
    const userId = session?.user?.id || "guest"
    localStorage.setItem(`attrangi_referrals_${userId}`, JSON.stringify(newInvites))
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://${referralUrl}`).then(
      () => {
        setCopied(true)
        showToast("Invite link copied!")
        setTimeout(() => setCopied(false), 2000)
      },
      () => {
        showToast("Failed to copy link.")
      }
    )
  }

  const showToast = (message: string) => {
    setSuccessToast(message)
    setTimeout(() => setSuccessToast(""), 3000)
  }

  const handleAddInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteName.trim()) return

    const newInvite: Invitation = {
      id: `invite-${Date.now()}`,
      name: inviteName.trim(),
      status: inviteStatus,
      date: new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    }

    const updated = [newInvite, ...invitations]
    saveInvitations(updated)
    setInviteName("")
    setIsInviteModalOpen(false)
    showToast(`Invitation sent to ${newInvite.name}!`)
  }

  const handleDeleteInvite = (id: string) => {
    const updated = invitations.filter((item) => item.id !== id)
    saveInvitations(updated)
  }

  const handleToggleStatus = (id: string) => {
    const updated = invitations.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          status: item.status === "pending" ? "joined" : ("pending" as "joined" | "pending"),
        }
      }
      return item
    })
    saveInvitations(updated)
  }

  const handleSimulateBulk = (count: number) => {
    const names = ["Rohan Roy", "Kriti Sen", "Aman Jain", "Zara Sheikh", "Kabir Dev", "Nisha Roy", "Sneha Rao", "Ravi Teja", "Vijay K", "Diya Sharma"]
    let updated = [...invitations]
    for (let i = 0; i < count; i++) {
      const randomName = `${names[Math.floor(Math.random() * names.length)]} ${updated.length + 1}`
      const invite: Invitation = {
        id: `invite-${Date.now()}-${i}`,
        name: randomName,
        status: "joined",
        date: new Date().toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      }
      updated.unshift(invite)
    }
    saveInvitations(updated)
    showToast(`Added ${count} joined invitations!`)
  }

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!address.trim() || !phone.trim()) return
    setIsClaimed(true)
    setTimeout(() => {
      setIsClaimModalOpen(false)
      showToast("T-shirt reward claimed successfully!")
    }, 1500)
  }

  // Calculate dynamic stats
  const actualJoinedCount = invitations.filter((i) => i.status === "joined").length
  const isDefaultDummyState = invitations.length === 3 && invitations.some(i => i.id === "dummy-1")
  
  // Base offset of 28 is added to joined count under the default dummy list to get exactly 29, as requested
  const joinedOffset = isDefaultDummyState ? 28 : 0
  const joinedCount = actualJoinedCount + joinedOffset
  
  const neededForTshirt = 30
  const remainingCount = neededForTshirt - joinedCount
  const isRewardUnlocked = joinedCount >= neededForTshirt

  // Detect 30/30 dynamic status transition and navigate to reward celebration page automatically
  useEffect(() => {
    if (!loading && isRewardUnlocked && !isClaimed) {
      router.push("/patient/refer-and-earn/reward")
    }
  }, [isRewardUnlocked, isClaimed, loading, router])

  return (
    <div className="flex-1 w-full h-full min-h-screen bg-[#FAF8F5] overflow-y-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 font-sans select-none relative">
      
      {/* Toast Alert Notification */}
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
        
        {/* 1. Back Navigation Arrow */}
        <header className="flex flex-col gap-6">
          <Link href="/patient/dashboard">
            <button
              aria-label="Go back"
              className="w-10 h-10 rounded-full bg-white border border-slate-200/80 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm text-slate-700 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
          </Link>

          {/* 2. Hero Section */}
          <div className="flex flex-col gap-3 pl-1">
            <h1 className="text-[25px] sm:text-[28px] font-extrabold text-slate-800 leading-[32px] sm:leading-[36px] tracking-[-0.75px] font-sans whitespace-pre-line">
              {"Share a little support with\nsomeone you care about 💛"}
            </h1>
            <p className="text-slate-400 font-semibold text-[13px] sm:text-[14.5px] leading-relaxed tracking-[-0.3px]">
              Invite a friend and earn an Attrangi T-shirt when they join.
            </p>
          </div>
        </header>

        {loading ? (
          /* Loading Skeleton State */
          <div className="space-y-6 animate-pulse">
            <div className="bg-white rounded-[32px] h-[340px] border border-slate-100" />
            <div className="h-6 bg-slate-200 rounded w-40" />
            <div className="bg-white rounded-[32px] h-[220px] border border-slate-100" />
          </div>
        ) : (
          <>
            {/* 3. "How it works" Card */}
            <section className="bg-white rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 md:p-8 border border-slate-100/90 shadow-[0_4px_24px_rgba(15,23,42,0.012)] flex flex-col gap-6">
              <h4 className="text-slate-400 text-[12px] font-black uppercase tracking-wider pl-0.5">
                How it works:
              </h4>

              {/* Instructional Rows with standalone Vector Icons matching Figma specs exactly */}
              <div className="flex flex-col gap-5 sm:gap-6 pl-0.5">
                {/* Row 1: Vector 1 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5 relative">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.49104" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                  </div>
                  <span className="text-[13px] sm:text-[14px] font-semibold text-slate-700 leading-snug font-sans tracking-[-0.3px]">
                    Share your invite link
                  </span>
                </div>

                {/* Row 2: Vector 2 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5 relative">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.49104" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
                      <path d="M3 20h18" />
                    </svg>
                  </div>
                  <span className="text-[13px] sm:text-[14px] font-semibold text-slate-700 leading-snug font-sans tracking-[-0.3px]">
                    Your friend <strong className="font-extrabold text-slate-800">downloads</strong> Aatrangi and signs up
                  </span>
                </div>

                {/* Row 3: Vector 3 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5 relative">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.49104" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <span className="text-[13px] sm:text-[14px] font-semibold text-slate-700 leading-snug font-sans tracking-[-0.3px]">
                    Invite <strong className="font-extrabold text-slate-800">30 friends</strong>, and we&apos;ll send you an Attrangi <strong className="font-extrabold text-slate-800">T-shirt</strong>
                  </span>
                </div>
              </div>

              {/* 4. Invite Link Section */}
              <div className="flex flex-col gap-2 mt-2 pl-0.5">
                <span className="text-[12px] font-bold text-slate-500">
                  Your invite link:
                </span>
                <div className="w-full bg-[#FAF8F5] border border-slate-200/60 rounded-2xl p-1.5 pl-4 flex items-center justify-between gap-3 min-w-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span className="text-[12.5px] font-bold text-slate-600 truncate select-all">
                      {referralUrl}
                    </span>
                  </div>
                  <button
                    onClick={handleCopyLink}
                    aria-label="Copy invite link"
                    className="bg-[#1E1E2E] hover:opacity-90 active:scale-95 text-white px-4 py-2.5 rounded-[12px] font-extrabold text-[12px] shrink-0 tracking-tight transition-all cursor-pointer"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            </section>

            {/* 5. "YOUR INVITATIONS" Section - Pulled up to match spacing in Reference Image 2 */}
            <section className="flex flex-col gap-3 mt-[-4px] sm:mt-[-8px]">
              <div className="w-full pl-1">
                <h4 className="text-slate-800 text-[20px] sm:text-[22px] font-extrabold tracking-tight uppercase font-sans">
                  YOUR INVITATIONS
                </h4>
              </div>
              
              <div className="flex items-center justify-between w-full pl-1 pr-1 mt-1">
                <span className="text-[14px] sm:text-[15px] font-extrabold text-[#1A1A1A] tracking-[-0.3px]">
                  {joinedCount} / {neededForTshirt} friends joined
                </span>
                
                {/* Outlined Dynamic Reward text on the right matching Image 2 */}
                <span className="text-[13px] sm:text-[14px] font-bold text-[#D97D43] tracking-[-0.2px]">
                  {remainingCount === 1 ? "1 left for T-shirt!" : isRewardUnlocked ? "T-shirt unlocked!" : `${remainingCount} left for T-shirt!`}
                </span>
              </div>

              {/* State A / Empty State vs. State B / Invitation List */}
              {invitations.length === 0 ? (
                /* 6. Empty State Card */
                <div className="bg-white rounded-[28px] sm:rounded-[32px] p-8 border border-slate-100/90 shadow-[0_4px_24px_rgba(15,23,42,0.012)] flex flex-col items-center text-center gap-5 mt-2">
                  {/* Sprout Icon Visual */}
                  <svg className="w-14 h-14 text-[#9AD882]" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M32 54C32 40 32 30 32 20" stroke="#84CC16" strokeWidth="4.5" strokeLinecap="round" />
                    <path d="M32 38C22 34 16 20 20 14C26 10 32 22 32 38Z" fill="#84CC16" />
                    <path d="M32 30C42 26 48 12 44 6C38 2 32 14 32 30Z" fill="#A3E635" />
                  </svg>

                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-slate-800 text-[16px] font-black tracking-[-0.3px]">
                      No invitations sent yet
                    </h3>
                    <p className="text-[12px] sm:text-[13px] font-semibold text-slate-400 leading-relaxed font-sans max-w-[260px] mx-auto whitespace-pre-line">
                      {"Send your first invite above to start\nearning rewards."}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsInviteModalOpen(true)}
                    aria-label="Invite a friend"
                    className="w-full max-w-[260px] text-white px-6 py-3.5 rounded-full font-bold text-[14px] shadow-sm transition-all active:scale-95 hover:scale-[1.02] cursor-pointer"
                    style={{ backgroundColor: "#D97D43" }} // Coral Orange/Coral
                  >
                    Invite a friend
                  </button>

                  <span className="text-[11px] font-semibold text-slate-400 leading-snug max-w-[280px] font-sans">
                    You can invite friends through WhatsApp, Instagram or any other app.
                  </span>
                </div>
              ) : (
                /* State B / C - Populated Invitation Cards List rendered dynamically */
                <div className="flex flex-col gap-3 mt-2">
                  
                  {/* Reward Unlocked State (State D / 30/30 Reward Flow) */}
                  {isRewardUnlocked && (
                    <motion.div
                      initial={{ scale: 0.98, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-gradient-to-r from-[#FEF5ED] to-[#FAF8F5] border-2 border-[#F99254]/30 rounded-[20px] sm:rounded-[24px] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
                    >
                      <div className="flex items-center gap-3.5 text-center sm:text-left">
                        <div className="w-11 h-11 rounded-full bg-[#F99254]/10 flex items-center justify-center shrink-0 text-[#F99254]">
                          <svg className="w-5.5 h-5.5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm0 0h4l-1 5H9l-1-5h4z" />
                          </svg>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-extrabold text-[15px] text-slate-800 tracking-tight">
                            You earned a T-shirt! 🎉
                          </span>
                          <span className="text-[11.5px] font-semibold text-slate-400">
                            Congratulations on reaching {joinedCount} referrals.
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsClaimModalOpen(true)}
                        className="bg-[#F99254] hover:bg-[#E87E3E] text-white px-5 py-2.5 rounded-full font-bold text-[12.5px] sm:text-[13px] shrink-0 tracking-tight transition-all active:scale-95 shadow-sm cursor-pointer"
                      >
                        Claim your T-shirt &rarr;
                      </button>
                    </motion.div>
                  )}

                  {/* Populated Invitation Cards rendered dynamically */}
                  <div className="flex flex-col gap-3">
                    {invitations.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-[20px] p-4.5 sm:p-5 border border-[#EBF1F5] shadow-none flex items-center justify-between gap-4 w-full"
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          
                          {/* Centered Circle Icon Status Badges */}
                          {item.status === "joined" ? (
                            /* Green Circular check mark badge */
                            <div
                              onClick={() => handleToggleStatus(item.id)}
                              title="Click to toggle status (Demo)"
                              className="w-10 h-10 rounded-full bg-[#EAF7EC] text-[#22C55E] flex items-center justify-center shrink-0 cursor-pointer hover:opacity-90 transition-all"
                            >
                              <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          ) : (
                            /* Pale Yellow Hourglass status badge */
                            <div
                              onClick={() => handleToggleStatus(item.id)}
                              title="Click to toggle status (Demo)"
                              className="w-10 h-10 rounded-full bg-[#FFF9EE] text-[#D97D43] flex items-center justify-center shrink-0 cursor-pointer hover:opacity-90 transition-all"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 2h14" />
                                <path d="M5 22h14" />
                                <path d="M19 2v4c0 3-2 5-5 7 3 2 5 4 5 7v4" />
                                <path d="M5 2v4c0 3 2 5 5 7-3 2-5 4-5 7v4" />
                                <path d="M12 11.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
                              </svg>
                            </div>
                          )}

                          {/* Info Name and Muted Date Labels */}
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-extrabold text-[15px] sm:text-[16px] text-slate-800 leading-tight truncate">
                              {item.name}
                            </span>
                            <span className="text-[12px] sm:text-[12.5px] font-semibold text-slate-400 mt-1">
                              {item.status === "joined"
                                ? `Joined ${item.date}`
                                : `Invite sent ${item.date} • Waiting`}
                            </span>
                          </div>
                        </div>

                        {/* Actions (Toggle/Delete) */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleStatus(item.id)}
                            className="text-[11px] font-bold text-[#00829B] hover:underline cursor-pointer"
                          >
                            Toggle
                          </button>
                          <button
                            onClick={() => handleDeleteInvite(item.id)}
                            aria-label="Delete Invitation"
                            className="p-1 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Outlined Pill "+ Invite a friend" button at the bottom of the list */}
                  <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="w-full bg-[#FAF8F5] text-[#D97D43] border-2 border-[#D97D43]/60 hover:border-[#D97D43] py-3.5 rounded-full font-bold text-[14px] transition-all duration-200 active:scale-95 shadow-none flex items-center justify-center gap-1 cursor-pointer mt-3"
                  >
                    + Invite a friend
                  </button>

                  {/* Dev Simulation Helpers */}
                  <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200/60 mt-4 flex flex-col gap-2.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Developer Testing Panel
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleSimulateBulk(5)}
                        className="bg-[#00829B] hover:opacity-90 text-white px-3 py-1.5 rounded-lg text-[10.5px] font-bold cursor-pointer"
                      >
                        Simulate +5 Joined
                      </button>
                      <button
                        onClick={() => handleSimulateBulk(30)}
                        className="bg-amber-600 hover:opacity-90 text-white px-3 py-1.5 rounded-lg text-[10.5px] font-bold cursor-pointer"
                      >
                        Simulate 30 Joined (Unlock T-shirt)
                      </button>
                      <button
                        onClick={() => {
                          saveInvitations([])
                          const userId = session?.user?.id || "guest"
                          localStorage.setItem(`attrangi_referrals_init_v3_${userId}`, "true")
                        }}
                        className="bg-rose-600 hover:opacity-90 text-white px-3 py-1.5 rounded-lg text-[10.5px] font-bold cursor-pointer"
                      >
                        Reset/Empty State
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* Invitation Dialog Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1E1E2E]/40 backdrop-blur-sm flex items-center justify-center px-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[24px] p-6 max-w-[400px] w-full border border-slate-100 shadow-2xl flex flex-col gap-5"
          >
            <div className="flex justify-between items-center w-full">
              <h3 className="text-[17px] font-black text-slate-800 tracking-tight">
                Send Invitation
              </h3>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddInvite} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-slate-500">
                  Friend&apos;s Full Name
                </label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13.5px] font-semibold text-slate-700 focus:outline-none focus:border-[#00829B]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-slate-500">
                  Invitation Initial Status
                </label>
                <select
                  value={inviteStatus}
                  onChange={(e) => setInviteStatus(e.target.value as "joined" | "pending")}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13.5px] font-semibold text-slate-700 focus:outline-none focus:border-[#00829B]"
                >
                  <option value="pending">Pending (Waiting for signup)</option>
                  <option value="joined">Joined (Already active)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-[#FAF8F5] text-white py-3 rounded-xl font-bold text-[13.5px] shadow-sm hover:opacity-90 transition-all cursor-pointer mt-2"
                style={{ backgroundColor: "#D97D43" }}
              >
                Send Invite
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Claim T-shirt Reward Modal */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1E1E2E]/40 backdrop-blur-sm flex items-center justify-center px-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[24px] p-6 max-w-[400px] w-full border border-slate-100 shadow-2xl flex flex-col gap-5"
          >
            <div className="flex justify-between items-center w-full">
              <h3 className="text-[17px] font-black text-slate-800 tracking-tight">
                Claim Attrangi T-shirt
              </h3>
              <button
                onClick={() => setIsClaimModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {isClaimed ? (
              <div className="text-center py-6 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-slate-800 text-[15px] font-black">
                    Order Submitted!
                  </h4>
                  <p className="text-[12px] font-semibold text-slate-400 max-w-[260px] leading-relaxed">
                    Your claim for the Attrangi T-shirt (Size: {shirtSize}) has been placed. We will ship it to your address shortly.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleClaimSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-bold text-slate-500">
                    Select T-shirt Size
                  </label>
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
                  <label className="text-[12px] font-bold text-slate-500">
                    Delivery Address
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter complete shipping address..."
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13.5px] font-semibold text-slate-700 focus:outline-none focus:border-[#00829B] resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-500">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13.5px] font-semibold text-slate-700 focus:outline-none focus:border-[#00829B]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#F99254] hover:bg-[#E87E3E] text-white py-3 rounded-xl font-bold text-[13.5px] shadow-sm transition-all cursor-pointer mt-2"
                >
                  Submit Order
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}

    </div>
  )
}
