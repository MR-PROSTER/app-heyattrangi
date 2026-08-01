"use client"

import Link from "next/link"
import { PROFILE_FOCUS, PROFILE_ICON_MD, PROFILE_INNER_CARD } from "../ui/profileChrome"
import { PRIVACY_POLICY_HREF, TERMS_OF_SERVICE_HREF } from "./privacyUtils"

interface LegalLinksProps {
  className?: string
}

const linkClass = `${PROFILE_INNER_CARD} group flex min-h-11 items-center justify-between gap-3 !p-4 sm:!px-5 sm:!py-4 ${PROFILE_FOCUS}`

export default function LegalLinks({ className = "" }: LegalLinksProps) {
  return (
    <nav
      aria-label="Legal documents"
      className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${className}`}
    >
      <Link href={PRIVACY_POLICY_HREF} className={linkClass}>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900">Privacy Policy</p>
          <p className="mt-0.5 text-xs font-medium text-gray-500">
            How we collect and care for your information
          </p>
        </div>
        <span
          className="text-gray-400 group-hover:text-gray-700 transition-colors duration-150"
          aria-hidden="true"
        >
          <svg className={PROFILE_ICON_MD} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </Link>

      <Link href={TERMS_OF_SERVICE_HREF} className={linkClass}>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900">Terms of Service</p>
          <p className="mt-0.5 text-xs font-medium text-gray-500">
            The agreement that guides how Attrangi works
          </p>
        </div>
        <span
          className="text-gray-400 group-hover:text-gray-700 transition-colors duration-150"
          aria-hidden="true"
        >
          <svg className={PROFILE_ICON_MD} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </Link>
    </nav>
  )
}
