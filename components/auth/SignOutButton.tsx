"use client"

import { useRef, useState } from "react"
import { performClientSignOut } from "@/lib/auth/performClientSignOut"

export default function SignOutButton({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(false)
  const inFlight = useRef(false)

  const handleSignOut = async () => {
    if (inFlight.current || isLoading) return
    inFlight.current = true
    setIsLoading(true)
    try {
      await performClientSignOut()
    } catch {
      setIsLoading(false)
      inFlight.current = false
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleSignOut()}
      disabled={isLoading}
      aria-busy={isLoading}
      className={`transition-colors disabled:opacity-50 ${className || ""}`}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 motion-reduce:animate-none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Signing out...
        </span>
      ) : (
        children || (
          <span className="flex items-center gap-3">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </span>
        )
      )}
    </button>
  )
}
