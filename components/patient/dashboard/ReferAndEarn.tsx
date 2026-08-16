"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

interface ReferAndEarnProps {
  referralCode?: string
  friendsInvited?: number
  friendsJoined?: number
  rewardProgress?: number
  isEligible?: boolean
}

export default function ReferAndEarn({
  referralCode = "",
  friendsInvited = 0,
  friendsJoined = 0,
  rewardProgress = 0,
  isEligible = false,
}: ReferAndEarnProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full relative pl-1 overflow-hidden rounded-[24px] min-[360px]:rounded-[28px] min-[390px]:rounded-[32px] sm:rounded-[32px] md:rounded-[32px] min-h-[145px] min-[360px]:min-h-[160px] min-[390px]:min-h-[175px] sm:min-h-[210px] md:min-h-[260px] flex items-center py-2 sm:py-3"
    >
      {/* Left Content (Text & CTA) - Pushed slightly down and right for visual alignment with the overall grid */}
      <div className="flex flex-col flex-1 z-10 pl-3 min-[360px]:pl-4 min-[390px]:pl-5 sm:pl-6 md:pl-8 pr-4 max-w-[55%] sm:max-w-[60%] md:max-w-[65%] pt-3 min-[360px]:pt-4 sm:pt-6 md:pt-8">
        <h3 className="text-[17px] font-black text-slate-800 tracking-[-0.5px] leading-none font-sans">
          Refer & Earn
        </h3>
        <p className="text-[12px] sm:text-[13px] md:text-[14px] font-semibold text-slate-500 leading-snug mt-2 font-sans tracking-[-0.5px] whitespace-nowrap max-w-none">
          Invite a friend and earn an Attrangi T-shirt
        </p>
        <div className="mt-4 md:mt-5">
          <Link
            href="/patient/refer-and-earn"
            className="inline-flex items-center justify-center bg-[#F99254] hover:bg-[#E87E3E] text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-full font-bold text-[12.5px] min-[360px]:text-[13px] min-[390px]:text-[14px] transition-all duration-200 active:scale-95 hover:scale-[1.02] shadow-sm tracking-[-0.3px] font-sans h-10 min-[390px]:h-11 cursor-pointer"
          >
            Invite a friend &rarr;
          </Link>
        </div>
      </div>

      {/* Right Content (T-shirt Image) - Perfectly sized, tilted, and clipped at right rounded content edge */}
      <div className="absolute right-[-38px] top-[6px] min-[360px]:right-[-44px] min-[360px]:top-[10px] min-[390px]:right-[-52px] min-[390px]:top-[12px] sm:right-[-70px] sm:top-[16px] md:right-[-92px] md:top-[20px] w-[180px] h-[155px] min-[360px]:w-[205px] min-[360px]:h-[175px] min-[390px]:w-[225px] min-[390px]:h-[195px] sm:w-[300px] sm:h-[260px] md:w-[420px] md:h-[365px] pointer-events-none select-none overflow-hidden z-0">
        <div 
          className="relative w-full h-full"
          style={{ transform: "rotate(-10deg)", transformOrigin: "center right" }}
        >
          <Image
            src="https://res.cloudinary.com/dxoiluua8/image/upload/v1786822205/T_shirt_opjody.png"
            alt="Attrangi T-shirt"
            fill
            sizes="(max-width: 360px) 180px, (max-width: 390px) 205px, (max-width: 640px) 225px, (max-width: 768px) 300px, 420px"
            className="object-contain object-right-top scale-[1.12]"
            priority
          />
        </div>
      </div>
    </motion.div>
  )
}
