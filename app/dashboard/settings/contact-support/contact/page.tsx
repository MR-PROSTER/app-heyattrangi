"use client"

import SettingsLayout from "@/components/settings/SettingsLayout"
import { Mail } from "lucide-react"

export default function ContactSupportPage() {
  return (
    <SettingsLayout
      title="We're here to help."
      backHref="/dashboard/settings/contact-support"
      maxWidthClass="max-w-[430px]"
    >
      <div className="w-full space-y-6 select-none animate-in fade-in duration-300 text-left pt-2">
        {/* Supporting text */}
        <p className="text-zinc-500 text-[14px] font-semibold leading-relaxed px-1">
          Have a question or need help with something? Send us a message and our team will get back to you.
        </p>

        {/* Support Information Card */}
        <div className="bg-white rounded-[32px] p-6 border border-zinc-100 shadow-[0_4px_24px_rgba(0,0,0,0.015)] space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#FFF5F2] text-[#FF6B4A] border border-[#FF6B4A]/10 shrink-0">
              <Mail className="w-5.5 h-5.5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold text-zinc-400 tracking-[0.15em] uppercase block">
                EMAIL
              </span>
              <span className="text-[15.5px] font-bold text-[#1C2038] mt-0.5 block">
                support@heyattrangi.com
              </span>
            </div>
          </div>

          <a
            href="mailto:support@heyattrangi.com?subject=Hey Attrangi Support Inquiry"
            className="w-full h-14 bg-[#FF6B4A] hover:bg-[#E85A3A] active:scale-[0.98] text-white text-[15px] font-black rounded-3xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
          >
            Email Support
          </a>
        </div>

        {/* Typical Response Time */}
        <div className="bg-white rounded-[24px] p-5 border border-zinc-100 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
          <span className="text-[13px] font-extrabold text-[#1C2038] block">
            Typical response time
          </span>
          <span className="text-zinc-500 text-[13px] font-semibold leading-normal mt-1 block">
            We'll get back to you as soon as we can.
          </span>
        </div>
      </div>
    </SettingsLayout>
  )
}
