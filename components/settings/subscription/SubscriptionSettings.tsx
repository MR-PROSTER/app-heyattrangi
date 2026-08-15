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
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "semester" | "annual">("monthly")

  const changeBillingPeriod = (period: "monthly" | "semester" | "annual") => {
    setBillingPeriod(period)
    setIsMonthly(period === "monthly")
  }

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
        if (billingPeriod === "monthly") {
          handleSubscribe("PREMIUM", 149)
        } else if (billingPeriod === "semester") {
          handleSubscribe("PREMIUM", 805)
        } else {
          handleSubscribe("PREMIUM", 1430)
        }
      } else if (plan === "ORGANIZATION") {
        window.location.href = "mailto:sales@heyattrangi.com?subject=Organization Plan Inquiry"
      } else if (plan === "FREE") {
        handlePlanChange("FREE")
      }
    }
  }

  return (
    <div className="w-full select-none animate-in fade-in duration-300 pb-1">
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center py-0 sm:py-1 px-1 sm:px-3">
        {/* Two cards container */}
        <div className="w-full flex flex-col md:flex-row items-stretch justify-center gap-4 sm:gap-6 mt-1">
          
          {/* Card 1: FREE */}
          <div className="hidden md:flex bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-zinc-100/60 p-4 sm:p-5 flex-col gap-4 w-full max-w-[420px] mx-auto md:mx-0">
            {/* Nested Rounded Box */}
            <div className="bg-[#F4F4F5] rounded-[24px] p-4 sm:p-5 flex flex-col justify-between min-h-[295px] sm:min-h-[305px] md:min-h-[310px]">
              <div className="flex flex-col gap-2.5">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-500 font-sans">
                  FREE
                </h3>
                 {/* Spacer to align price vertically with the Premium card's price on desktop */}
                <div className="hidden md:block h-[30px]" />
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[36px] sm:text-[40px] font-black tracking-tight text-zinc-950 leading-none font-sans">
                      ₹0
                    </span>
                    <span className="text-xs text-zinc-500 font-bold font-sans">
                      forever
                    </span>
                  </div>
                  {/* Invisible spacer matching the height of Premium price's subtext */}
                  <span className="text-[9px] text-transparent select-none font-bold font-sans">
                    Billed monthly
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] text-zinc-600 font-medium leading-relaxed font-sans min-h-[36px] md:min-h-[48px]">
                  A simple way to check in, reflect and take care of yourself.
                </p>
              </div>
              
              {/* Action Button */}
              <button
                onClick={() => handleButtonClick("FREE")}
                disabled={currentPlan === "FREE" || isUpdating !== null}
                className={`w-full py-2.5 px-4 text-xs sm:text-[13px] font-extrabold rounded-full transition-all border flex items-center justify-center gap-2 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 ${
                  currentPlan === "FREE"
                    ? "border-zinc-200 bg-zinc-50 text-zinc-400 cursor-default"
                    : "border-zinc-950 bg-white hover:bg-zinc-50 text-zinc-950 cursor-pointer"
                }`}
              >
                {isUpdating === "FREE" ? (
                  <div className="w-4 h-4 border-2 border-zinc-450 border-t-transparent rounded-full animate-spin" />
                ) : (
                  currentPlan === "FREE" ? "Current Plan" : "Continue with Free"
                )}
              </button>
            </div>

            {/* Features section */}
            <div className="flex-1 flex flex-col gap-2.5 px-1">
              <h4 className="text-xs sm:text-sm font-extrabold text-zinc-900 font-sans">
                Includes
              </h4>
              <ul className="space-y-2 text-xs sm:text-[13px] font-bold text-zinc-700">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-zinc-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>30 Ai Messages / Day</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-zinc-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>10 voice messages/day</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-zinc-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>All wellness activities</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-zinc-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>7 days of history</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-zinc-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Unlimited mood tracking</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 2: PREMIUM */}
          <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-zinc-100/60 p-4 sm:p-5 flex flex-col gap-4 w-full max-w-[420px] mx-auto md:mx-0">
            {/* Nested Rounded Gradient Box */}
            <div 
              className="rounded-[24px] p-4 sm:p-5 flex flex-col justify-between min-h-[295px] sm:min-h-[305px] md:min-h-[310px] relative overflow-hidden bg-cover bg-center"
              style={{
                backgroundImage: "url('https://res.cloudinary.com/dxoiluua8/image/upload/v1786789037/Banner_bg_rrixld.png')",
              }}
            >
              <div className="flex flex-col gap-2.5">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-800 flex items-center gap-1 font-sans">
                  ✦ PREMIUM
                </h3>
                
                {/* Segmented control billing toggle */}
                <div className="flex items-center bg-zinc-950/5 p-1 rounded-full w-full max-w-[340px] select-none">
                  <button
                    type="button"
                    onClick={() => changeBillingPeriod("monthly")}
                    className={`flex-1 py-1 rounded-full font-extrabold text-[10px] sm:text-[11px] transition-all duration-300 cursor-pointer ${
                      billingPeriod === "monthly" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-600 hover:text-zinc-950"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => changeBillingPeriod("semester")}
                    className={`flex-1 py-1 rounded-full font-extrabold text-[10px] sm:text-[11px] transition-all duration-300 cursor-pointer flex items-center justify-center ${
                      billingPeriod === "semester" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-600 hover:text-zinc-950"
                    }`}
                  >
                    Semester
                    <span className="bg-emerald-100 text-emerald-700 text-[8px] px-1 py-0.5 rounded-full font-black ml-1 scale-90 sm:scale-100">
                      10%
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => changeBillingPeriod("annual")}
                    className={`flex-1 py-1 rounded-full font-extrabold text-[10px] sm:text-[11px] transition-all duration-300 cursor-pointer flex items-center justify-center ${
                      billingPeriod === "annual" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-600 hover:text-zinc-950"
                    }`}
                  >
                    Annual
                    <span className="bg-emerald-100 text-emerald-700 text-[8px] px-1 py-0.5 rounded-full font-black ml-1 scale-90 sm:scale-100">
                      20%
                    </span>
                  </button>
                </div>

                {/* Price displays */}
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[36px] sm:text-[40px] font-black tracking-tight text-zinc-950 leading-none font-sans">
                      {billingPeriod === "monthly" ? "₹149" : billingPeriod === "semester" ? "₹134" : "₹119"}
                    </span>
                    <span className="text-xs text-zinc-500 font-bold font-sans">
                      / month
                    </span>
                  </div>
                  <span className="text-[9px] text-zinc-500 font-bold font-sans">
                    {billingPeriod === "semester" ? "Billed ₹805 every 6 months" : billingPeriod === "annual" ? "Billed ₹1430 every year" : "Billed monthly"}
                  </span>
                </div>

                <p className="text-xs sm:text-[12px] text-zinc-700 font-medium leading-relaxed font-sans min-h-[36px] md:min-h-[48px]">
                  More space to understand yourself - with longer continuity and personalized support.
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleButtonClick("PREMIUM")}
                disabled={currentPlan === "PREMIUM" || isUpdating !== null}
                className={`w-full py-2.5 px-4 text-xs sm:text-[13px] font-extrabold rounded-full transition-all flex items-center justify-center gap-2 select-none shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 ${
                  currentPlan === "PREMIUM"
                    ? "bg-zinc-100 text-zinc-400 border border-zinc-250 cursor-default"
                    : "bg-zinc-950 hover:bg-zinc-900 text-white cursor-pointer"
                }`}
              >
                {isUpdating === "PREMIUM" ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  currentPlan === "PREMIUM" ? "Current Plan" : "Get Premium"
                )}
              </button>
            </div>

            {/* Features section */}
            <div className="flex-1 flex flex-col gap-2.5 px-1">
              <h4 className="text-xs sm:text-sm font-extrabold text-zinc-900 font-sans">
                Includes
              </h4>
              <ul className="space-y-2 text-xs sm:text-[13px] font-bold text-zinc-700">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>150 AI messages/day</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Full listening library</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Unlimited assessments</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>1 year of history</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Personalized reminders</span>
                </li>
              </ul>

              <div className="text-center mt-2.5">
                <span className="text-[11px] font-bold text-zinc-400 font-sans">
                  Cancel anytime.
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
