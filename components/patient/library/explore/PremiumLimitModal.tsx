"use client"

import React, { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

interface PremiumLimitModalProps {
  isOpen: boolean
  onClose: () => void
  activityCount: number
}

export default function PremiumLimitModal({
  isOpen,
  onClose,
  activityCount,
}: PremiumLimitModalProps) {
  const router = useRouter()

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  const handleExplorePremium = () => {
    router.push("/dashboard/settings/subscription/plans?from=explore")
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
          />

          {/* Premium Card Content Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="premium-limit-title"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
            className="relative w-full max-w-[460px] rounded-[32px] overflow-hidden border border-amber-200/50 shadow-2xl p-6 sm:p-8 flex flex-col gap-6"
            style={{
              backgroundImage: "url('https://res.cloudinary.com/dxoiluua8/image/upload/v1786789037/Banner_bg_rrixld.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="space-y-4 text-left">
              {/* Heading */}
              <h2
                id="premium-limit-title"
                className="font-extrabold text-[24px] sm:text-[28px] text-slate-800 tracking-tight leading-tight"
              >
                You&apos;ve made space for
                <br />
                yourself {activityCount} times today. 💛
              </h2>

              {/* Supporting Texts */}
              <div className="space-y-3 font-sans font-medium text-slate-600 text-sm sm:text-base leading-relaxed">
                <p className="font-bold text-slate-800">Want more?</p>
                <p>
                  With Premium, all wellness
                  <br />
                  activities are available
                  <br />
                  whenever you need them.
                </p>
              </div>

              {/* Pricing */}
              <div className="font-extrabold text-slate-800 text-base sm:text-lg">
                ₹149 / month
              </div>
            </div>

            {/* Divider */}
            <hr className="border-slate-200/60 my-1" />

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-between gap-4 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="text-slate-500 hover:text-slate-800 font-extrabold text-sm uppercase tracking-wider py-3 px-4 transition-colors select-none"
              >
                Not now
              </button>

              <button
                type="button"
                onClick={handleExplorePremium}
                className="bg-[#1A1A1A] hover:bg-[#333333] active:scale-[0.97] text-white text-xs sm:text-sm font-black px-6 py-3.5 rounded-full shadow-md transition-all text-center whitespace-nowrap select-none"
              >
                Explore Premium
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
