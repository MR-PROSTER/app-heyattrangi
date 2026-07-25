"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export default function UpgradeOffersBanner() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full relative overflow-hidden rounded-[24px] bg-gradient-to-r from-orange-500 via-orange-400 to-rose-400 p-6 shadow-[0_8px_30px_rgba(234,88,12,0.15)] flex flex-col md:flex-row items-center justify-between gap-6"
        >
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-600/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />
            
            <div className="relative z-10 flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full backdrop-blur-md border border-white/30">
                        Limited Time Offer
                    </span>
                    <span className="text-white/90 text-sm font-bold flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Upgrade to Premium
                    </span>
                </div>
                <h2 className="text-2xl md:text-[26px] font-black text-white leading-tight mb-2 tracking-tight">
                    Unlock unlimited AI chats <br className="hidden md:block" />& priority sessions.
                </h2>
                <p className="text-white/80 font-medium text-[13px] max-w-md leading-relaxed">
                    Elevate your mental health journey. Get unlimited access to Hey Attrangi Ai, deeper emotional insights, and priority booking with top therapists.
                </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
                <Link
                    href="/patient/billing"
                    className="w-full sm:w-auto px-6 py-3.5 bg-white text-orange-600 font-extrabold text-[14px] rounded-xl hover:scale-105 active:scale-95 transition-transform shadow-[0_4px_14px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2"
                >
                    View Premium Plans
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </Link>
            </div>
        </motion.div>
    )
}
