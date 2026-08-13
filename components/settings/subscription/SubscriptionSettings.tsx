"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface SubscriptionSettingsProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    plan?: string | null
    patient?: {
      id: string
    } | null
    updatedAt?: string | Date
  }
  isTestMode?: boolean
}

export default function SubscriptionSettings({ user, isTestMode = false }: SubscriptionSettingsProps) {
  const router = useRouter()
  const [currentPlan, setCurrentPlan] = useState<string>(user.plan || "FREE")
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [isMonthly, setIsMonthly] = useState(true)

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleSubscribe = async (plan: string, amount: number) => {
    if (plan === currentPlan) return
    setIsUpdating(plan)
    try {
      const isLoaded = await loadRazorpayScript()
      if (!isLoaded) {
        alert("Razorpay SDK failed to load. Are you online?")
        return
      }

      // Create Order
      const orderRes = await fetch("/api/payments/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          amount,
        }),
      })

      const orderData = await orderRes.json()
      if (!orderData.success) throw new Error(orderData.error)

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_T2HN6tpPOHf8Mw",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Hey Attrangi",
        description: `${plan} Plan Upgrade`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // Verify
          const verifyRes = await fetch("/api/payments/subscribe/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan,
              amount,
            }),
          })

          const verifyData = await verifyRes.json()
          if (verifyData.success) {
            setCurrentPlan(plan)
            alert(`Successfully upgraded to ${plan} plan!`)
            router.refresh()
          } else {
            alert(verifyData.error || "Payment verification failed.")
          }
        },
        prefill: {
          name: user.name || "",
          email: user.email || "",
        },
        theme: {
          color: "#f97316",
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.on("payment.failed", function (response: any) {
        const reason = response?.error?.description || "Payment was declined"
        void fetch("/api/payments/notify-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "FAILED",
            amount,
            description: `${plan === "PREMIUM" ? "Companion" : plan === "ESSENTIAL" ? "Listener" : plan} plan subscription`,
            paymentId: response?.error?.metadata?.payment_id || null,
            orderId: orderData.orderId,
            reason,
          }),
        }).catch(() => {})
        alert(`Payment Failed: ${reason}`)
      })
      rzp.open()
    } catch (error: any) {
      console.error("Subscription error:", error)
      alert(error.message || "Error initiating payment.")
    } finally {
      setIsUpdating(null)
    }
  }

  const handlePlanChange = async (targetPlan: string) => {
    if (targetPlan === currentPlan) return
    setIsUpdating(targetPlan)
    try {
      const res = await fetch("/api/profile/plan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: targetPlan }),
      })
      if (res.ok) {
        setCurrentPlan(targetPlan)
        alert(`Successfully switched to ${targetPlan} plan! (Test Mode)`)
        router.refresh()
      } else {
        alert("Failed to update plan. Please try again.")
      }
    } catch (err) {
      console.error("Error updating plan:", err)
      alert("Error updating plan. Please try again.")
    } finally {
      setIsUpdating(null)
    }
  }

  const getButtonState = (plan: string) => {
    const planHierarchy: Record<string, number> = {
      FREE: 0,
      ESSENTIAL: 1,
      PREMIUM: 2,
      ORGANIZATION: 3,
    }

    const currentRank = planHierarchy[currentPlan] ?? 0
    const targetRank = planHierarchy[plan] ?? 0

    if (currentPlan === plan) {
      return {
        text: "Current Plan",
        disabled: true,
        className: "bg-[#0c1421] text-white cursor-default border-transparent",
      }
    }

    if (!isTestMode && currentRank > targetRank) {
      return {
        text: "Already Bought",
        disabled: true,
        className: "bg-gray-100 text-gray-400 cursor-default border-transparent",
      }
    }

    if (plan === "FREE") {
      return {
        text: "Switch to Free",
        disabled: false,
        className: "bg-white hover:bg-gray-50 text-gray-800 border-gray-200 hover:border-gray-300 shadow-sm cursor-pointer",
      }
    } else if (plan === "ESSENTIAL") {
      return {
        text: isTestMode ? "Switch to Listener" : "Buy Now",
        disabled: false,
        className: "bg-white hover:bg-gray-50 text-gray-850 border-gray-250 hover:border-gray-350 shadow-sm cursor-pointer",
      }
    } else if (plan === "PREMIUM") {
      return {
        text: isTestMode ? "Switch to Companion" : "Upgrade to Premium",
        disabled: false,
        className: "bg-[#0c1421] hover:bg-[#1a2536] text-white shadow-sm cursor-pointer",
      }
    } else if (plan === "ORGANIZATION") {
      return {
        text: "Contact Sales",
        disabled: false,
        className: "bg-[#0c1421] hover:bg-[#1a2536] text-white shadow-sm cursor-pointer",
      }
    }

    return {
      text: "Switch",
      disabled: false,
      className: "bg-white hover:bg-gray-50 text-gray-850 border-gray-200 hover:border-gray-300 shadow-sm cursor-pointer",
    }
  }

  const handleButtonClick = (plan: string) => {
    const state = getButtonState(plan)
    if (state.disabled) return

    if (isTestMode) {
      handlePlanChange(plan)
    } else {
      if (plan === "ESSENTIAL") {
        handleSubscribe("ESSENTIAL", isMonthly ? 49 : 299)
      } else if (plan === "PREMIUM") {
        handleSubscribe("PREMIUM", isMonthly ? 149 : 699)
      } else if (plan === "ORGANIZATION") {
        window.location.href = "mailto:sales@heyattrangi.com?subject=Organization Plan Inquiry"
      } else if (plan === "FREE") {
        handlePlanChange("FREE")
      }
    }
  }

  return (
    <div className="w-full pt-0 pb-8 lg:pt-0 lg:pb-16 select-none animate-in fade-in duration-300">
      {/* Parent Card Container */}
      <div className="bg-white rounded-[24px] shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-gray-100 overflow-visible w-full mt-0">
        {/* Header & Toggle Switch inside the card */}
        <div className="p-[clamp(18px,5vw,32px)] border-b border-gray-50 flex flex-col items-center text-center">
          <h2 className="text-[clamp(26px,7.5vw,30px)] font-black text-gray-900 mb-2 leading-tight tracking-tight whitespace-nowrap">Compare plans</h2>
          <p className="text-[clamp(13px,3.5vw,14px)] text-gray-500 mb-[clamp(16px,4.8vw,24px)] font-medium leading-normal">
            Need more details before choosing?{" "}
            <a href="/pricing" className="font-extrabold text-gray-900 hover:underline">
              See feature breakdown &darr;
            </a>
          </p>
 
          {/* Toggle Switch */}
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-full border border-zinc-200 w-full max-w-[340px]">
            <button
              onClick={() => setIsMonthly(true)}
              className={`flex-1 px-[clamp(12px,3.2vw,24px)] py-2.5 rounded-full font-bold text-[clamp(10px,2.8vw,12px)] transition-all duration-300 whitespace-nowrap cursor-pointer ${
                isMonthly ? "bg-white text-[#0c1421] shadow-sm" : "text-gray-500 hover:text-[#0c1421]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsMonthly(false)}
              className={`flex-1 px-[clamp(12px,3.2vw,24px)] py-2.5 rounded-full font-bold text-[clamp(10px,2.8vw,12px)] transition-all duration-300 whitespace-nowrap cursor-pointer ${
                !isMonthly ? "bg-white text-[#0c1421] shadow-sm" : "text-gray-500 hover:text-[#0c1421]"
              }`}
            >
              6 Months (Save 20%)
            </button>
          </div>
        </div>
 
        {/* Plan Columns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 w-full items-stretch">
          
          {/* Listener Column */}
          <div className="p-[clamp(18px,5vw,24px)] xl:p-8 flex flex-col hover:bg-gray-50/20 transition-colors">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-xl">🎧</span> Listener
            </h3>
            
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs line-through text-gray-405 font-bold">
                {isMonthly ? "₹149" : "₹899"}
              </span>
              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                SAVE 67%
              </span>
            </div>
 
            <div className="flex items-baseline mb-1.5">
              <span className="text-[clamp(40px,11vw,48px)] font-black tracking-tight text-gray-900">
                {isMonthly ? "₹49" : "₹299"}
              </span>
              <span className="text-[clamp(12px,3.2vw,14px)] text-gray-500 font-bold ml-1">
                {isMonthly ? "/mo" : "/6mo"}
              </span>
            </div>
 
            <p className="text-xs font-black text-orange-500 mb-6">
              {isMonthly ? "or ₹299/6 months" : "or ₹49/month"}
            </p>
 
            <p className="text-xs text-gray-600 mb-8 min-h-[48px] leading-relaxed">
              Daily check-ins, basic mood tracking, and limited voice conversations.
            </p>
 
            <div className="border-t border-gray-100 my-6"></div>
 
            {/* Features */}
            <div className="space-y-4 mb-8 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Chats</span>
                <span className="font-extrabold text-gray-900">25 / day</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Voice</span>
                <span className="font-extrabold text-gray-900">30 min / day</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Memory</span>
                <span className="font-extrabold text-gray-900">7-Day</span>
              </div>
            </div>
 
            {/* Action button */}
            <div className="mt-auto">
              {(() => {
                const btn = getButtonState("ESSENTIAL")
                return (
                  <button
                    onClick={() => handleButtonClick("ESSENTIAL")}
                    disabled={btn.disabled || isUpdating !== null}
                    className={`w-full py-3.5 px-4 text-xs font-black rounded-full transition-all border flex items-center justify-center gap-2 select-none ${btn.className}`}
                  >
                    {isUpdating === "ESSENTIAL" ? (
                      <div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      btn.text
                    )}
                  </button>
                )
              })()}
              
              <div className="text-center mt-3">
                <span className="text-[10px] font-black text-orange-500 tracking-wide uppercase">
                  Exclusive Offers Inside
                </span>
              </div>
            </div>
          </div>
 
          {/* Companion Column (Recommended) */}
          <div className="p-[clamp(18px,5vw,24px)] xl:p-8 flex flex-col hover:bg-gray-50/20 transition-colors relative border-2 border-orange-500 rounded-[24px] shadow-sm bg-white mt-4 min-[360px]:mt-6 lg:mt-0 lg:-mt-[6px] lg:-mb-[6px] lg:-my-8 lg:py-10 z-10">
            <div className="absolute top-[-14px] left-1/2 -translate-x-1/2 bg-orange-50 border border-orange-200 text-orange-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm z-20 whitespace-nowrap flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              RECOMMENDED
            </div>
 
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-xl">🤝</span> Companion
            </h3>
 
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs line-through text-gray-400 font-bold">
                {isMonthly ? "₹599" : "₹2799"}
              </span>
              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                SAVE 75%
              </span>
            </div>
 
            <div className="flex items-baseline mb-1.5">
              <span className="text-[clamp(40px,11vw,48px)] font-black tracking-tight text-gray-900">
                {isMonthly ? "₹149" : "₹699"}
              </span>
              <span className="text-[clamp(12px,3.2vw,14px)] text-gray-500 font-bold ml-1">
                {isMonthly ? "/mo" : "/6mo"}
              </span>
            </div>
 
            <p className="text-xs text-gray-500 font-medium mb-6">
              {isMonthly ? "or ₹699/6 months" : "or ₹149/month"}
            </p>
 
            <p className="text-xs text-gray-600 mb-8 min-h-[48px] leading-relaxed">
              Unlimited AI support, real-time insights, and long-term memory.
            </p>
 
            <div className="border-t border-gray-100 my-6"></div>
 
            {/* Features */}
            <div className="space-y-4 mb-8 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Chats</span>
                <span className="font-extrabold text-gray-900">Unlimited</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Voice</span>
                <span className="font-extrabold text-gray-900">Unlimited</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Memory</span>
                <span className="font-extrabold text-gray-900">Long-Term</span>
              </div>
            </div>
 
            {/* Action button */}
            <div className="mt-auto">
              {(() => {
                const btn = getButtonState("PREMIUM")
                return (
                  <button
                    onClick={() => handleButtonClick("PREMIUM")}
                    disabled={btn.disabled || isUpdating !== null}
                    className={`w-full py-3.5 px-4 text-xs font-black rounded-full transition-all border flex items-center justify-center gap-2 select-none ${btn.className}`}
                  >
                    {isUpdating === "PREMIUM" ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      btn.text
                    )}
                  </button>
                )
              })()}
 
              <div className="text-center mt-3">
                <a href="/pricing" className="text-[10px] font-black text-gray-400 hover:text-gray-600">
                  View Premium pricing &rsaquo;
                </a>
              </div>
            </div>
          </div>
 
          {/* Organization Column */}
          <div className="p-[clamp(18px,5vw,24px)] xl:p-8 flex flex-col hover:bg-gray-50/20 transition-colors mt-4 min-[360px]:mt-6 lg:mt-0">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-xl">🏢</span> Organization
            </h3>
 
            <div className="flex items-baseline mb-1.5 mt-4">
              <span className="text-[clamp(40px,11vw,48px)] font-black tracking-tight text-gray-900 leading-none">Custom</span>
            </div>
 
            <p className="text-xs text-gray-500 font-bold mb-6 mt-2">
              Billed by institution
            </p>
 
            <p className="text-xs text-gray-600 mb-8 min-h-[48px] leading-relaxed">
              College or corporate plan with organization-managed billing.
            </p>
 
            <div className="border-t border-gray-100 my-6"></div>
 
            {/* Features */}
            <div className="space-y-4 mb-8 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Users</span>
                <span className="font-extrabold text-gray-900">Managed</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Admin</span>
                <span className="font-extrabold text-gray-900">Portal</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Billing</span>
                <span className="font-extrabold text-gray-900">Centralized</span>
              </div>
            </div>
 
            {/* Action button */}
            <div className="mt-auto">
              {(() => {
                const btn = getButtonState("ORGANIZATION")
                return (
                  <button
                    onClick={() => handleButtonClick("ORGANIZATION")}
                    disabled={btn.disabled || isUpdating !== null}
                    className={`w-full py-3.5 px-4 text-xs font-black rounded-full transition-all border flex items-center justify-center gap-2 select-none ${btn.className}`}
                  >
                    {isUpdating === "ORGANIZATION" ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      btn.text
                    )}
                  </button>
                )
              })()}
 
              <div className="text-center mt-3">
                <a href="/pricing" className="text-[10px] font-black text-gray-450 hover:text-gray-650">
                  View Org pricing &rsaquo;
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
