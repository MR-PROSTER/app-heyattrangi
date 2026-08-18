"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function MobileBottomNav() {
  const pathname = usePathname() || ""

  // Do not show bottom nav on chatbot route to avoid overlapping the chat interface
  if (pathname === "/patient/ai-bot") {
    return null
  }

  const isHome = pathname === "/patient/dashboard"
  const isSearch = pathname.startsWith("/patient/library")

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[200px] h-16 bg-white/95 backdrop-blur-md rounded-full shadow-[0_12px_36px_rgba(0,0,0,0.12)] border border-slate-100 flex items-center justify-around px-4">
      {/* Home Button */}
      <Link
        href="/patient/dashboard"
        className={`flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 ${
          isHome
            ? "bg-orange-50 text-orange-600 scale-110 shadow-sm"
            : "text-slate-400 hover:text-slate-600"
        }`}
        aria-label="Go to home"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </Link>

      {/* Search/Explore Button */}
      <Link
        href="/patient/library"
        className={`flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 ${
          isSearch
            ? "bg-orange-50 text-orange-600 scale-110 shadow-sm"
            : "text-slate-400 hover:text-slate-600"
        }`}
        aria-label="Go to search explore"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </Link>
    </div>
  )
}
