"use client"

import Link from "next/link"
import { Check, ChevronRight, User } from "lucide-react"

interface SubscriptionBillingDetailsProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    plan?: string | null
    updatedAt?: string | Date
  }
  nextPaymentDate?: string
}

export default function SubscriptionBillingDetails({ user, nextPaymentDate }: SubscriptionBillingDetailsProps) {
  const isPremium = user.plan === "PREMIUM"

  const premiumFeatures = [
    "Unlimited conversations",
    "Advanced wellbeing insights",
    "Longer recordings",
    "Premium wellness activities",
  ]

  // Calculate dynamic mock next payment date (e.g. 24 September 2026, or exactly 1 month from now)
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

  if (isPremium) {
    return (
      <div className="w-full space-y-6 select-none max-w-[430px] mx-auto animate-in fade-in duration-300">
        
        {/* Premium Plan Card */}
        <div className="bg-white rounded-[36px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.015)] border border-zinc-100 flex flex-col gap-6">
          <div className="space-y-1">
            <h2 className="text-[#FF6B4A] font-extrabold text-[clamp(28px,8.5vw,36px)] tracking-tight leading-none">
              Aatrangi Premium
            </h2>
            <div className="text-zinc-900 font-extrabold text-[clamp(24px,7.5vw,30px)] tracking-tight mt-2">
              ₹149 / month
            </div>
          </div>

          {/* Features list */}
          <div className="space-y-4 pt-2">
            {premiumFeatures.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-3.5 text-left">
                <Check className="w-5 h-5 text-[#FF6B4A] shrink-0 stroke-[3]" />
                <span className="text-zinc-800 text-[14px] font-bold leading-tight">
                  {feat}
                </span>
              </div>
            ))}
          </div>

          <hr className="border-zinc-100 my-1" />

          {/* Next payment info */}
          <div className="space-y-1 text-left">
            <span className="text-[11px] font-black text-zinc-400 tracking-[0.15em] uppercase">
              Next payment
            </span>
            <p className="text-zinc-800 text-[15px] font-extrabold">
              {getNextPaymentDate()}
            </p>
          </div>
        </div>

        {/* Manage Subscription Button */}
        <Link href="/dashboard/settings/subscription/plans?from=settings" className="block w-full">
          <button className="w-full h-14 min-[360px]:h-16 bg-[#FF6B4A] hover:bg-[#E85A3A] active:scale-[0.98] text-white text-[15px] font-black rounded-3xl shadow-sm transition-all text-center cursor-pointer">
            Manage subscription
          </button>
        </Link>

        {/* Billing History Card */}
        <Link href="/dashboard/settings/subscription/billing-history" className="block w-full">
          <div className="w-full flex items-center justify-between bg-white rounded-[24px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.01)] border border-zinc-100 hover:border-zinc-200 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#FFF5F2] text-[#FF6B4A] rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-orange-100/30">
                <User className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-[14px] font-black text-zinc-800 tracking-wide font-sans">
                Billing history
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-400 stroke-[2.5]" />
          </div>
        </Link>

      </div>
    )
  }

  // Free User State
  return (
    <div className="w-full space-y-6 select-none max-w-[430px] mx-auto animate-in fade-in duration-300">
      
      {/* Free Plan Card */}
      <div className="bg-white rounded-[36px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.015)] border border-zinc-100 text-left space-y-2">
        <h2 className="text-zinc-900 font-extrabold text-[clamp(28px,8.5vw,36px)] tracking-tight leading-none">
          Aatrangi Free
        </h2>
        <p className="text-zinc-500 text-[14px] font-bold leading-normal pt-1">
          You're currently on the free plan.
        </p>
      </div>

      {/* Explore Premium Button */}
      <Link href="/dashboard/settings/subscription/plans?from=settings" className="block w-full">
        <button className="w-full h-14 min-[360px]:h-16 bg-[#FF6B4A] hover:bg-[#E85A3A] active:scale-[0.98] text-white text-[15px] font-black rounded-3xl shadow-sm transition-all text-center cursor-pointer">
          Explore Premium
        </button>
      </Link>

    </div>
  )
}
