"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import AuthBrandingPanel from "@/components/auth/AuthBrandingPanel"

function AttrangiLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-8 h-8 grid grid-cols-2 grid-rows-2 gap-[2px] shrink-0">
        <div className="bg-[#FFC107] rounded-tl-[4px]" />
        <div className="bg-[#FF5252] rounded-tr-[4px]" />
        <div className="bg-[#FF9800] rounded-bl-[4px]" />
        <div className="bg-[#E64A19] rounded-br-[4px]" />
      </div>
      <span className="font-extrabold text-xl sm:text-2xl tracking-tighter text-gray-900">Hey Attrangi!</span>
    </div>
  )
}

function DoorIllustration({ variant }: { variant: "patient" | "institute" }) {
  const label = variant === "patient" ? "Patient" : "Institute"
  const Icon = variant === "patient" ? (
    <svg className="w-10 h-10 text-[#e26843]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ) : (
    <svg className="w-10 h-10 text-[#14293f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )

  return (
    <div className="relative w-[108px] h-[108px] sm:w-[120px] sm:h-[120px] shrink-0">
      {/* Door frame */}
      <div className="absolute inset-x-2 bottom-0 top-3 rounded-t-[18px] bg-gradient-to-b from-[#ffe8d6] to-[#ffd4b8] border-2 border-[#f5c9a8]" />
      <div className="absolute inset-x-5 bottom-0 top-6 rounded-t-[12px] bg-gradient-to-b from-[#fff8f3] to-[#ffefe4] border border-orange-100/80" />
      {/* Hanging sign */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[72px] rounded-md bg-[#c4a574] px-2 py-1 shadow-sm border border-[#a88958]">
        <p className="text-[8px] sm:text-[9px] font-bold text-white text-center leading-tight truncate">{label}</p>
      </div>
      <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-0.5 h-3 bg-[#a88958]" />
      {/* Icon inside door */}
      <div className="absolute inset-0 flex items-center justify-center pt-4">
        {Icon}
      </div>
    </div>
  )
}

type SelectionCardProps = {
  href: string
  icon: ReactNode
  title: string
  description: string
  cta: string
  variant: "patient" | "institute"
}

function SelectionCard({ href, icon, title, description, cta, variant }: SelectionCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-[20px] sm:rounded-[24px] border border-orange-100/80 bg-white p-5 sm:p-6 shadow-[0_4px_24px_rgba(226,104,67,0.08)] transition-all duration-300 hover:border-[#e26843]/35 hover:shadow-[0_12px_40px_rgba(226,104,67,0.14)] hover:-translate-y-0.5 min-h-[168px] sm:min-h-[180px]"
    >
      <div className="flex items-start justify-between gap-4 pr-0 sm:pr-[100px]">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#fdf2ee] text-[#e26843] flex items-center justify-center shrink-0 ring-4 ring-[#fdf2ee]/50">
              {icon}
            </div>
            <h3 className="text-[17px] sm:text-lg font-bold text-gray-900 leading-tight">{title}</h3>
          </div>

          <p className="text-[13px] sm:text-sm text-gray-500 leading-relaxed max-w-[280px] sm:max-w-none">
            {description}
          </p>

          <span className="inline-flex items-center gap-1.5 mt-4 text-[13px] sm:text-sm font-bold text-[#e26843] group-hover:gap-2.5 transition-all">
            {cta}
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>

      {/* Illustration — anchored bottom-right */}
      <div className="absolute right-4 bottom-3 sm:right-5 sm:bottom-4 opacity-95 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-300 pointer-events-none">
        <DoorIllustration variant={variant} />
      </div>
    </Link>
  )
}

export default function AuthWelcomePage() {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans">
      <AuthBrandingPanel />

      {/* Selection panel */}
      <div className="w-full lg:w-[min(100%,480px)] xl:w-[500px] shrink-0 flex items-center justify-center px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-16 bg-white">
        <div className="w-full max-w-[440px]">
          <AttrangiLogo className="lg:hidden mb-8" />

          <div className="mb-7 sm:mb-8">
            <h1 className="text-[26px] sm:text-[30px] font-bold text-gray-900 tracking-tight leading-[1.2] mb-2">
              Hi there, welcome <span aria-hidden="true">💛</span>
            </h1>
            <p className="text-gray-500 text-sm sm:text-[15px] leading-relaxed">
              Choose how you want to continue with Hey Attrangi.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:gap-5">
            <SelectionCard
              href="/auth/signin"
              variant="patient"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
              title="Patient"
              description="Decided to show up for a stronger self? Start your personal wellness journey."
              cta="Next"
            />

            <SelectionCard
              href="/auth/institution/signin"
              variant="institute"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
              title="Institutes login"
              description="Part of a school, college, or workplace program? Sign in with your institute account."
              cta="Next"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
