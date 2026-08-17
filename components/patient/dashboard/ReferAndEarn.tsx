"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"

const NEEDED_FOR_TSHIRT = 30

export default function ReferAndEarn() {
  const [joinedCount, setJoinedCount] = useState(0)
  const [rewardClaimed, setRewardClaimed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    fetch("/api/patient/referral", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (controller.signal.aborted) return
        if (typeof data.joinedCount === "number") {
          setJoinedCount(data.joinedCount)
        }
        if (typeof data.rewardClaimed === "boolean") {
          setRewardClaimed(data.rewardClaimed)
        }
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          console.error("Failed to fetch referral data:", err)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [])

  const progressPct = Math.min((joinedCount / NEEDED_FOR_TSHIRT) * 100, 100)
  const isUnlocked = joinedCount >= NEEDED_FOR_TSHIRT

  const ctaHref = rewardClaimed
    ? "/patient/refer-and-earn"
    : isUnlocked
    ? "/patient/refer-and-earn?claim=true"
    : "/patient/refer-and-earn"

  const ctaLabel = rewardClaimed
    ? "View details →"
    : isUnlocked
    ? "Claim your T-shirt →"
    : "Invite a friend →"

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full relative overflow-hidden rounded-[24px] min-[360px]:rounded-[28px] min-[390px]:rounded-[32px] sm:rounded-[32px] md:rounded-[32px] bg-white border border-slate-100/90 shadow-[0_4px_24px_rgba(15,23,42,0.015)] flex items-center py-4 min-h-[155px] min-[360px]:min-h-[170px] min-[390px]:min-h-[185px] sm:min-h-[210px] md:min-h-[240px]"
    >
      {/* Left Content */}
      <div className="flex flex-col flex-1 z-10 pl-4 min-[360px]:pl-5 min-[390px]:pl-6 sm:pl-6 md:pl-8 pr-4 max-w-[58%] sm:max-w-[62%] md:max-w-[65%] gap-2.5">
        <div>
          <h3 className="text-[16px] min-[360px]:text-[17px] font-black text-slate-800 tracking-[-0.5px] leading-none font-sans">
            Refer &amp; Earn
          </h3>
          <p className="text-[11.5px] min-[360px]:text-[12px] sm:text-[13px] font-semibold text-slate-500 leading-snug mt-1.5 font-sans tracking-[-0.3px]">
            {rewardClaimed
              ? "Your T-shirt is on its way! 👕"
              : "Invite friends, earn an Attrangi T-shirt"}
          </p>
        </div>

        {/* Progress bar */}
        {!loading && (
          <div className="flex flex-col gap-1.5 w-full pr-2">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] min-[360px]:text-[11px] font-bold text-slate-400 tracking-tight">
                {joinedCount} / {NEEDED_FOR_TSHIRT} joined
              </span>
              {isUnlocked && !rewardClaimed && (
                <span className="text-[9.5px] min-[360px]:text-[10px] font-black text-orange-500 uppercase tracking-tight">
                  Unlocked!
                </span>
              )}
            </div>
            <div className="w-full h-[5px] bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: isUnlocked
                    ? "linear-gradient(to right, #F99254, #E87E3E)"
                    : "linear-gradient(to right, #F99254, #FBBA8A)",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* CTA Button */}
        <Link
          href={ctaHref}
          className="inline-flex items-center justify-center bg-[#F99254] hover:bg-[#E87E3E] text-white px-4 py-2 min-[360px]:px-5 min-[360px]:py-2.5 rounded-full font-bold text-[11.5px] min-[360px]:text-[12.5px] min-[390px]:text-[13px] transition-all duration-200 active:scale-95 hover:scale-[1.02] shadow-sm tracking-[-0.3px] font-sans w-fit"
        >
          {ctaLabel}
        </Link>
      </div>

      {/* Right — T-shirt Image */}
      <div className="absolute right-[-36px] top-[4px] min-[360px]:right-[-42px] min-[360px]:top-[8px] min-[390px]:right-[-50px] min-[390px]:top-[10px] sm:right-[-65px] sm:top-[14px] md:right-[-88px] md:top-[18px] w-[175px] h-[150px] min-[360px]:w-[200px] min-[360px]:h-[172px] min-[390px]:w-[218px] min-[390px]:h-[188px] sm:w-[295px] sm:h-[255px] md:w-[405px] md:h-[355px] pointer-events-none select-none overflow-hidden z-0">
        <div
          className="relative w-full h-full"
          style={{ transform: "rotate(-10deg)", transformOrigin: "center right" }}
        >
          <Image
            src="https://res.cloudinary.com/dxoiluua8/image/upload/v1786822205/T_shirt_opjody.png"
            alt="Attrangi T-shirt"
            fill
            sizes="(max-width: 360px) 175px, (max-width: 390px) 200px, (max-width: 640px) 218px, (max-width: 768px) 295px, 405px"
            className="object-contain object-right-top scale-[1.12]"
            priority
          />
        </div>
      </div>
    </motion.div>
  )
}
