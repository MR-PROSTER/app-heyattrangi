"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

interface Invitation {
  id: string
  name: string
  status: "joined" | "pending"
  date: string
}



export default function RewardCelebrationPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userId = session?.user?.id || "guest"
    const saved = localStorage.getItem(`attrangi_referrals_${userId}`)
    
    let joinedCount = 0
    if (saved) {
      try {
        const invitations: Invitation[] = JSON.parse(saved)
        const actualJoinedCount = invitations.filter((i) => i.status === "joined").length
        const isDefaultDummyState = invitations.length === 3 && invitations.some(i => i.id === "dummy-1")
        const joinedOffset = isDefaultDummyState ? 28 : 0
        joinedCount = actualJoinedCount + joinedOffset
      } catch (e) {
        console.error(e)
      }
    } else {
      // Default dummy list has Priya Sharma (joined) + 28 offset = 29 joined
      joinedCount = 29
    }

    // Direct Access Protection: Redirect if requirements are not met (joinedCount < 30)
    if (joinedCount < 30) {
      router.replace("/patient/refer-and-earn")
      return
    }

    setLoading(false)

    // Controlled multi-wave falling paper/petal animation starting after 200ms delay
    let startTimeout: NodeJS.Timeout
    let animationFrameId: number

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    
    if (!mediaQuery.matches) {
      startTimeout = setTimeout(async () => {
        try {
          const confetti = (await import("canvas-confetti")).default
          const end = Date.now() + 1000
          const colors = ["#FF6B35", "#FFD166", "#EF476F", "#9B5DE5", "#00B4D8", "#06D6A0"]

          const frame = () => {
            // Left side shoot (angles up-right then floats down gracefully)
            confetti({
              particleCount: 3,
              angle: 60,
              spread: 55,
              startVelocity: 30,
              gravity: 1.1,
              drift: 0.15,
              ticks: 180,
              scalar: 0.95,
              origin: { x: 0, y: 0.05 },
              colors,
            })

            // Right side shoot (angles up-left then floats down gracefully)
            confetti({
              particleCount: 3,
              angle: 120,
              spread: 55,
              startVelocity: 30,
              gravity: 1.1,
              drift: -0.15,
              ticks: 180,
              scalar: 0.95,
              origin: { x: 1, y: 0.05 },
              colors,
            })

            if (Date.now() < end) {
              animationFrameId = requestAnimationFrame(frame)
            }
          }

          frame()
        } catch (err) {
          console.error("Failed to load canvas-confetti dynamically on client side:", err)
        }
      }, 200) // 200ms delay after render entry
    }

    // Component destruction cleanup to prevent memory leaks
    return () => {
      if (startTimeout) clearTimeout(startTimeout)
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [session, router])

  if (loading) {
    return (
      <div className="w-full h-full min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#E08053] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-grow w-full min-h-screen flex flex-col justify-between items-center px-6 py-12 md:py-16 relative overflow-hidden select-none">
      
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <Image
          src="https://res.cloudinary.com/dxoiluua8/image/upload/v1786789037/Banner_bg_rrixld.png"
          alt="Celebratory Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Main Content Area */}
      <div className="max-w-[420px] w-full flex-grow flex flex-col justify-center items-center gap-8 z-10 my-auto">
        
        {/* Floating animated T-shirt reward visual */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="relative w-[280px] h-[245px] sm:w-[325px] sm:h-[285px] drop-shadow-[0_12px_24px_rgba(249,146,84,0.06)] hover:scale-[1.03] transition-transform duration-300 z-10"
        >
          <Image
            src="https://res.cloudinary.com/dxoiluua8/image/upload/v1786822205/T_shirt_opjody.png"
            alt="Attrangi T-shirt reward"
            fill
            priority
            sizes="(max-width: 640px) 280px, 325px"
            className="object-contain"
          />
        </motion.div>

        {/* Text Details Area */}
        <div className="flex flex-col items-center text-center gap-3">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-[26px] sm:text-[30px] font-black text-slate-800 tracking-[-0.75px] leading-tight font-sans"
          >
            You earned a T-shirt! ✨
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-[#747E8A] font-semibold text-[13.5px] sm:text-[15.5px] leading-relaxed max-w-[320px] font-sans tracking-[-0.3px]"
          >
            Your friend joined Aatrangi. Your T-shirt is ready to claim.
          </motion.p>
        </div>
      </div>

      {/* Outlined bottom safe area padding container for Claim CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="w-full max-w-[420px] z-10 mt-8 sm:mt-12 pb-2"
      >
        <Link href="/patient/refer-and-earn/claim" className="w-full block">
          <button
            aria-label="Claim your T-shirt"
            className="w-full bg-[#E08053] hover:bg-[#D07043] active:scale-98 text-white py-4.5 rounded-full font-bold text-[15px] sm:text-[16px] tracking-tight shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 font-sans"
          >
            Claim your T-shirt &rarr;
          </button>
        </Link>
      </motion.div>

    </div>
  )
}
