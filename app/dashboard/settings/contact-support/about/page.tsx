import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getCurrentUser } from "@/lib/auth"
import SettingsLayout from "@/components/settings/SettingsLayout"
import LoadingSkeleton from "@/components/settings/LoadingSkeleton"
import { Sparkles, Heart, Shield } from "lucide-react"

async function AboutContent() {
  const user = await getCurrentUser()
  if (!user || user.role !== "PATIENT") redirect("/auth/unauthorized")

  return (
    <div className="w-full space-y-6 select-none text-left animate-in fade-in duration-300">
      
      {/* Intro Brand Card */}
      <div className="bg-white rounded-[32px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.015)] border border-zinc-100 space-y-3">
        <h2 className="text-[#E8722A] font-extrabold text-[22px] tracking-tight">
          Hey Attrangi
        </h2>
        <p className="text-zinc-500 text-[13.5px] font-semibold leading-relaxed">
          Attrangi is a private, AI-driven digital companion dedicated to support your emotional health, daily reflections, and well-being journeys.
        </p>
      </div>

      {/* Core values */}
      <div className="space-y-4 pt-1">
        <span className="text-[12px] font-black text-zinc-400 tracking-[0.14em] uppercase ml-1">
          Our Values
        </span>
        
        <div className="space-y-3">
          <div className="bg-white rounded-3xl p-5 border border-zinc-100 shadow-[0_2px_12px_rgba(0,0,0,0.01)] flex gap-4">
            <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center shrink-0 border border-orange-100/20">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-zinc-800 font-extrabold text-[14px]">Empathy First</h3>
              <p className="text-zinc-500 text-[12.5px] font-semibold leading-relaxed mt-1">
                Designed to provide non-judgmental support, box breathing activities, and active wellness resources.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-zinc-100 shadow-[0_2px_12px_rgba(0,0,0,0.01)] flex gap-4">
            <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shrink-0 border border-amber-100/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-zinc-800 font-extrabold text-[14px]">Intelligent Insights</h3>
              <p className="text-zinc-500 text-[12.5px] font-semibold leading-relaxed mt-1">
                Formulating metrics to trace streaks, mood changes, and active dashboard progressions over time.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-zinc-100 shadow-[0_2px_12px_rgba(0,0,0,0.01)] flex gap-4">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-zinc-800 font-extrabold text-[14px]">Complete Privacy</h3>
              <p className="text-zinc-500 text-[12.5px] font-semibold leading-relaxed mt-1">
                Your data is strictly encrypted and secure under strict digital patient confidentiality protocols.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default function AboutPage() {
  return (
    <SettingsLayout title="About Aatrangi" backHref="/dashboard/settings/contact-support" maxWidthClass="max-w-[430px]">
      <Suspense fallback={<LoadingSkeleton rows={3} />}>
        <AboutContent />
      </Suspense>
    </SettingsLayout>
  )
}
