"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ChevronRight, HelpCircle, Mail, Globe, Trash2 } from "lucide-react"

export default function HelpSupportPage() {
  const router = useRouter()

  const handleBack = () => {
    router.push("/dashboard/settings")
  }

  const getHelpItems = [
    {
      label: "Frequently asked questions",
      icon: HelpCircle,
      iconColor: "text-amber-500",
      bgColor: "bg-amber-50 border-amber-100/10",
      href: "/dashboard/settings/contact-support/faq",
    },
    {
      label: "Contact support",
      icon: ChevronRight, // In target Image 2, the contact icon is a greater-than symbol
      iconColor: "text-[#FF6B4A]",
      bgColor: "bg-[#FFF5F2] border-[#FF6B4A]/10",
      href: "mailto:support@heyattrangi.com?subject=Hey Attrangi Support Inquiry",
      isMail: true,
    },
  ]

  const aboutItems = [
    {
      label: "About Aatrangi",
      icon: Globe,
      iconColor: "text-indigo-500",
      bgColor: "bg-indigo-50 border-indigo-100/10",
      href: "/dashboard/settings/contact-support/about",
    },
    {
      label: "Report a problem",
      icon: Trash2,
      iconColor: "text-rose-500",
      bgColor: "bg-rose-50 border-rose-100/10",
      href: "/dashboard/settings/contact-support/report",
    },
  ]

  return (
    <div className="min-h-screen w-full bg-[#FAF5F0] flex flex-col pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] select-none animate-in fade-in duration-300">
      
      {/* Mobile-aligned Header */}
      <header className="flex items-center w-full max-w-[430px] mx-auto px-6 py-4 gap-2 shrink-0 text-left">
        <button
          onClick={handleBack}
          aria-label="Back to Settings"
          className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-zinc-950 active:scale-90 transition-all cursor-pointer animate-none"
        >
          <ChevronLeft className="w-8 h-8 stroke-[2.5]" />
        </button>
        <h1 className="text-[clamp(28px,8vw,32px)] font-bold text-[#1C2038] tracking-tight leading-none">
          Help & support
        </h1>
      </header>

      {/* Main Content Areas */}
      <main className="flex-1 w-full max-w-[430px] mx-auto px-6 py-2 space-y-7">
        
        {/* GET HELP SECTION */}
        <div className="space-y-3">
          <span className="text-[12px] min-[360px]:text-[13px] font-black text-[#8E8B83] tracking-[0.15em] uppercase ml-1 block text-left">
            GET HELP
          </span>
          
          <div className="bg-white rounded-[32px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.015)] border border-zinc-100">
            {getHelpItems.map((item, idx) => {
              const Icon = item.icon
              const isLast = idx === getHelpHelpLength() - 1
              
              const rowContent = (
                <div className="w-full px-5 py-4 flex items-center justify-between hover:bg-zinc-50/40 transition-colors duration-150 cursor-pointer text-left">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${item.bgColor}`}>
                      <Icon className={`w-5.5 h-5.5 ${item.iconColor} stroke-[2.5]`} />
                    </div>
                    <span className="text-[15px] min-[360px]:text-[16px] font-bold text-[#1C2038] tracking-tight">
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-400 stroke-[2.5] shrink-0" />
                </div>
              )

              return (
                <div key={item.label}>
                  {item.isMail ? (
                    <a href={item.href} className="block w-full">
                      {rowContent}
                    </a>
                  ) : (
                    <Link href={item.href} className="block w-full">
                      {rowContent}
                    </Link>
                  )}
                  {idx < getHelpItems.length - 1 && (
                    <div className="border-t border-zinc-50 ml-18" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ABOUT AATRANGI SECTION */}
        <div className="space-y-3">
          <span className="text-[12px] min-[360px]:text-[13px] font-black text-[#8E8B83] tracking-[0.15em] uppercase ml-1 block text-left">
            ABOUT AATRANGI
          </span>

          <div className="bg-white rounded-[32px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.015)] border border-zinc-100">
            {aboutItems.map((item, idx) => {
              const Icon = item.icon
              const rowContent = (
                <div className="w-full px-5 py-4 flex items-center justify-between hover:bg-zinc-50/40 transition-colors duration-150 cursor-pointer text-left">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${item.bgColor}`}>
                      <Icon className={`w-5.5 h-5.5 ${item.iconColor} stroke-[2.5]`} />
                    </div>
                    <span className="text-[15px] min-[360px]:text-[16px] font-bold text-[#1C2038] tracking-tight">
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-400 stroke-[2.5] shrink-0" />
                </div>
              )

              return (
                <div key={item.label}>
                  <Link href={item.href} className="block w-full">
                    {rowContent}
                  </Link>
                  {idx < aboutItems.length - 1 && (
                    <div className="border-t border-zinc-50 ml-18" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

      </main>
    </div>
  )
}

function getHelpHelpLength() {
  return 2
}
