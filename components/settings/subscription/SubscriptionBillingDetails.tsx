"use client"

import Link from "next/link"
import { ChevronRight, User } from "lucide-react"

interface SubscriptionBillingDetailsProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    plan?: string | null
    updatedAt?: string | Date
  }
  nextPaymentDate?: string
  latestTxn?: {
    amount: number
    createdAt: Date | string
  } | null
}

export default function SubscriptionBillingDetails({ 
  user, 
  nextPaymentDate,
  latestTxn
}: SubscriptionBillingDetailsProps) {
  const isPremium = user.plan === "PREMIUM"

  const premiumFeatures = [
    "150 AI messages/day",
    "Full listening library",
    "Unlimited assessments",
    "1 year of history",
    "Personalized reminders",
  ]

  const freeFeatures = [
    "30 AI messages/day",
    "10 voice messages/day",
    "All wellness activities",
    "7 days of history",
    "Unlimited mood tracking",
  ]

  // Dynamic Pricing based on transaction amount
  const getPricingInfo = () => {
    if (latestTxn) {
      if (latestTxn.amount === 805) {
        return {
          priceDisplay: "₹134",
          periodDisplay: "/ month",
        }
      } else if (latestTxn.amount === 1430) {
        return {
          priceDisplay: "₹119",
          periodDisplay: "/ month",
        }
      }
    }
    return {
      priceDisplay: "₹149",
      periodDisplay: "/ month",
    }
  }

  const { priceDisplay, periodDisplay } = getPricingInfo()

  const getNextPaymentDate = () => {
    if (nextPaymentDate) return nextPaymentDate
    if (user.updatedAt) {
      const date = new Date(user.updatedAt)
      date.setMonth(date.getMonth() + 1)
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    }
    return "24 September 2026"
  }

  return (
    <div className="w-full select-none max-w-[430px] mx-auto animate-in fade-in duration-300 flex flex-col gap-5 pt-2">
      {/* Current Plan Label Header */}
      <div className="w-full text-left pl-1">
        <span className="text-[11px] font-black text-zinc-400 tracking-[0.15em] uppercase">
          CURRENT PLAN
        </span>
      </div>

      {isPremium ? (
        <>
          {/* Premium Plan Card */}
          <div className="bg-white rounded-[32px] p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-zinc-100/80 flex flex-col gap-5">
            {/* Subtle Premium Gradient Area */}
            <div 
              className="rounded-[24px] p-5 sm:p-6 flex flex-col gap-4 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #FFFDF5 0%, #FFF5F7 35%, #F6F1FF 70%, #EAF5FF 100%)"
              }}
            >
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-800 flex items-center gap-1 font-sans">
                ✦ PREMIUM
              </h3>

              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-[38px] sm:text-[44px] font-black tracking-tight text-zinc-950 leading-none font-sans">
                  {priceDisplay}
                </span>
                <span className="text-xs text-zinc-500 font-bold font-sans">
                  {periodDisplay}
                </span>
              </div>

              {/* Features list */}
              <div className="space-y-3 pt-2 text-left">
                <h4 className="text-xs sm:text-[13px] font-extrabold text-zinc-900 font-sans">
                  Includes
                </h4>
                <ul className="space-y-3.5 text-xs sm:text-[13.5px] font-bold text-zinc-700">
                  {premiumFeatures.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-blue-400 bg-blue-50/20 flex items-center justify-center shrink-0 text-blue-500">
                        <svg className="w-2.5 h-2.5 text-blue-500 stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cancel anytime info */}
              <div className="text-center mt-4">
                <span className="text-[11px] font-bold text-zinc-400 font-sans">
                  Cancel anytime.
                </span>
              </div>
            </div>

            <hr className="border-zinc-100" />

            {/* Next payment info */}
            <div className="space-y-1.5 text-left px-1">
              <span className="text-[10px] font-black text-zinc-400 tracking-[0.15em] uppercase">
                NEXT PAYMENT
              </span>
              <p className="text-zinc-950 text-[15px] sm:text-[17px] font-black font-sans leading-none">
                {getNextPaymentDate()}
              </p>
            </div>
          </div>

          {/* Manage Subscription Button */}
          <Link href="/dashboard/settings/subscription/plans?from=settings" className="block w-full">
            <button className="w-full h-14 min-[360px]:h-15 bg-[#FF6B4A] hover:bg-[#E85A3A] active:scale-[0.98] text-white text-[15px] font-black rounded-3xl shadow-sm transition-all text-center cursor-pointer select-none">
              Manage subscription
            </button>
          </Link>

          {/* Billing History Card */}
          <Link href="/dashboard/settings/subscription/billing-history" className="block w-full">
            <div className="w-full flex items-center justify-between bg-white rounded-[24px] p-4.5 shadow-[0_2px_12px_rgba(0,0,0,0.01)] border border-zinc-100 hover:border-zinc-200 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FFF5F2] text-[#FF6B4A] rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-orange-100/30">
                  <User className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-[14px] font-black text-zinc-950 tracking-wide font-sans">
                  Billing history
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-400 stroke-[2.5]" />
            </div>
          </Link>
        </>
      ) : (
        <>
          {/* Free Plan Card */}
          <div className="bg-white rounded-[32px] p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-zinc-100/80 flex flex-col gap-5">
            {/* Gray header section matching Image 4 */}
            <div className="bg-[#F4F4F5] rounded-[24px] p-5 flex flex-col gap-4">
              <span className="text-xs font-black tracking-widest text-zinc-500 font-sans uppercase">
                FREE
              </span>
              
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Price block */}
                <div className="flex items-baseline gap-1 shrink-0">
                  <span className="text-[38px] sm:text-[44px] font-black tracking-tight text-zinc-950 leading-none font-sans">
                    ₹0
                  </span>
                  <span className="text-xs text-zinc-500 font-bold font-sans">
                    forever
                  </span>
                </div>
                
                {/* Description block */}
                <p className="text-xs sm:text-[13px] text-zinc-600 font-medium leading-relaxed font-sans max-w-[200px]">
                  A simple way to check in, reflect and take care of yourself.
                </p>
              </div>

              {/* Continue with Free button */}
              <button className="w-full py-3 px-4 text-xs sm:text-[13px] font-extrabold rounded-full transition-all border border-zinc-200 bg-zinc-50 text-zinc-400 cursor-default select-none mt-1">
                Continue with Free
              </button>
            </div>

            {/* Free features checklist */}
            <div className="space-y-3 pt-1 text-left px-1">
              <h4 className="text-xs sm:text-[13px] font-extrabold text-zinc-900 font-sans">
                Includes
              </h4>
              <ul className="space-y-3.5 text-xs sm:text-[13.5px] font-bold text-zinc-700">
                {freeFeatures.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-zinc-300 bg-zinc-50 flex items-center justify-center shrink-0 text-zinc-655">
                      <svg className="w-2.5 h-2.5 text-zinc-600 stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Explore Premium Button */}
          <Link href="/dashboard/settings/subscription/plans?from=settings" className="block w-full">
            <button className="w-full h-14 min-[360px]:h-15 bg-[#FF6B4A] hover:bg-[#E85A3A] active:scale-[0.98] text-white text-[15px] font-black rounded-3xl shadow-sm transition-all text-center cursor-pointer select-none">
              Explore Premium
            </button>
          </Link>
        </>
      )}
    </div>
  )
}
