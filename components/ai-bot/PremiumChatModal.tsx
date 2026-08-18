"use client"

import React, { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"

interface PremiumChatModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PremiumChatModal({
  isOpen,
  onClose,
}: PremiumChatModalProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

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

  const handleContinue = () => {
    router.push("/dashboard/settings/subscription/plans?from=chat")
    onClose()
  }

  const benefits = [
    "150 AI messages every day",
    "Longer conversations",
    "4,500 messages every month",
    "All conversation modes",
  ]

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-[4px]"
          />

          {/* Premium Card Content Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="premium-chat-title"
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
              {/* Eyebrow */}
              <span className="text-[11px] font-black tracking-widest text-[#3d838c] bg-teal-50/50 px-2.5 py-1 rounded-md uppercase">
                GET PREMIUM
              </span>

              {/* Heading */}
              <h2
                id="premium-chat-title"
                className="font-extrabold text-[24px] sm:text-[28px] text-slate-800 tracking-tight leading-tight pt-1"
              >
                Keep the conversation
                <br />
                going.
              </h2>

              {/* Supporting Texts */}
              <div className="space-y-3 font-sans font-medium text-slate-600 text-sm sm:text-base leading-relaxed">
                <p>
                  You've reached today's free conversation limit. Premium gives you more room to talk, reflect, and work things through with Hey Attrangi.
                </p>
              </div>

              {/* Benefits Checklist */}
              <ul className="space-y-2.5 pt-2">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-sky-600" strokeWidth={3} />
                    </div>
                    <span className="font-semibold text-slate-700 text-[13px] sm:text-[14px]">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Divider */}
            <hr className="border-slate-200/60 my-1" />

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={onClose}
                className="text-slate-500 hover:text-slate-800 font-extrabold text-sm uppercase tracking-wider py-3 px-4 transition-colors select-none"
              >
                Not now
              </button>

              <button
                type="button"
                onClick={handleContinue}
                className="bg-[#1A1A1A] hover:bg-[#333333] active:scale-[0.97] text-white text-xs sm:text-sm font-black px-6 py-3.5 rounded-full shadow-md transition-all text-center whitespace-nowrap select-none"
              >
                ₹149/month
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  if (!mounted) return null
  return createPortal(modalContent, document.body)
}
