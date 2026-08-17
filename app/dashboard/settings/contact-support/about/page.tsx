"use client"

import SettingsLayout from "@/components/settings/SettingsLayout"
import { Sparkles } from "lucide-react"

export default function AboutPage() {
  return (
    <SettingsLayout
      title="About Hey Attrangi"
      backHref="/dashboard/settings/contact-support"
      maxWidthClass="max-w-[430px]"
    >
      <div className="w-full space-y-6 select-none animate-in fade-in duration-300 text-left pt-2">
        {/* Paragraphs */}
        <div className="space-y-4 px-1">
          <p className="text-zinc-500 text-[14px] font-semibold leading-relaxed">
            Hey Attrangi is a wellbeing companion designed to help you pause, check in with yourself, and understand what's going on over time.
          </p>
          <p className="text-zinc-500 text-[14px] font-semibold leading-relaxed">
            From everyday conversations and mood check-ins to reflections and wellbeing activities, we're building a calmer space to help you take care of yourself — one small step at a time.
          </p>
        </div>

        {/* Compact Info Card */}
        <div className="bg-white rounded-[28px] p-5.5 border border-zinc-100 shadow-[0_2px_12px_rgba(0,0,0,0.01)] flex gap-4">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-100/10">
            <Sparkles className="w-5 h-5 stroke-[2.25]" />
          </div>
          <div>
            <h3 className="text-zinc-800 font-extrabold text-[14px] leading-snug">
              Built with research & design
            </h3>
            <p className="text-zinc-500 text-[13px] font-semibold leading-relaxed mt-1">
              Developed by the Attrangi team with support from IIIT Dharwad Research Park.
            </p>
          </div>
        </div>

        {/* Version section */}
        <div className="bg-white rounded-[24px] p-5 border border-zinc-100 shadow-[0_2px_12px_rgba(0,0,0,0.01)] flex items-center justify-between">
          <span className="text-[13px] font-extrabold text-[#1C2038]">
            Version
          </span>
          <span className="text-zinc-400 text-[13px] font-bold">
            v1.0.0
          </span>
        </div>
      </div>
    </SettingsLayout>
  )
}
