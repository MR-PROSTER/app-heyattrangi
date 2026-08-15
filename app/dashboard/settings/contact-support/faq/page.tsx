import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getCurrentUser } from "@/lib/auth"
import SettingsLayout from "@/components/settings/SettingsLayout"
import LoadingSkeleton from "@/components/settings/LoadingSkeleton"
import { HelpCircle, Shield, CreditCard, Sparkles } from "lucide-react"

async function FaqContent() {
  const user = await getCurrentUser()
  if (!user || user.role !== "PATIENT") redirect("/auth/unauthorized")

  const faqs = [
    {
      icon: Sparkles,
      iconColor: "text-amber-500 bg-amber-50",
      q: "How does the AI well-being dashboard work?",
      a: "Our AI processes your daily interactions and mood check-ins to formulate weekly wellbeing insights, helping you trace your overall mental wellness progression.",
    },
    {
      icon: CreditCard,
      iconColor: "text-blue-500 bg-blue-50",
      q: "How do I change my subscription?",
      a: "Go to Settings -> Subscription & billing to manage your upgrade plans or switch between Free and Premium plans at any time.",
    },
    {
      icon: Shield,
      iconColor: "text-emerald-500 bg-emerald-50",
      q: "Is my data private and secure?",
      a: "Yes, we prioritize your security. All conversation logs, reflections, and mood history are end-to-end encrypted and completely confidential.",
    },
    {
      icon: HelpCircle,
      iconColor: "text-indigo-500 bg-indigo-50",
      q: "What wellness activities are included in Premium?",
      a: "Premium users gain access to unlimited voice check-ins, advanced breathing exercises, longer audio session logs, and personal well-being logs.",
    },
  ]

  return (
    <div className="w-full space-y-4 select-none animate-in fade-in duration-300">
      {faqs.map((faq, idx) => {
        const Icon = faq.icon
        return (
          <div
            key={idx}
            className="bg-white rounded-[24px] p-5 border border-zinc-100 shadow-[0_2px_12px_rgba(0,0,0,0.01)] text-left space-y-2.5"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${faq.iconColor}`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-zinc-800 font-extrabold text-[14px] leading-tight">
                {faq.q}
              </h3>
            </div>
            <p className="text-zinc-500 text-[12.5px] font-semibold leading-relaxed pl-1">
              {faq.a}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export default function FaqPage() {
  return (
    <SettingsLayout title="FAQs" backHref="/dashboard/settings/contact-support" maxWidthClass="max-w-[430px]">
      <Suspense fallback={<LoadingSkeleton rows={3} />}>
        <FaqContent />
      </Suspense>
    </SettingsLayout>
  )
}
