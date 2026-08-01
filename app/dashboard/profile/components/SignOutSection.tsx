"use client"

import { useRef, useState } from "react"
import { toast, Toaster } from "sonner"
import { performClientSignOut } from "@/lib/auth/performClientSignOut"

interface SignOutSectionProps {
  className?: string
}

export default function SignOutSection({ className = "" }: SignOutSectionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const inFlight = useRef(false)

  const handleSignOut = async () => {
    if (inFlight.current || isLoading) return
    inFlight.current = true
    setIsLoading(true)

    try {
      const result = await performClientSignOut({ redirectOnError: false })
      if (!result.ok) {
        toast.error(result.error || "Couldn't sign out. Please try again.")
        setIsLoading(false)
        inFlight.current = false
      }
      // On success, navigation replaces the page — leave loading true.
    } catch {
      toast.error("Couldn't sign out. Please try again.")
      setIsLoading(false)
      inFlight.current = false
    }
  }

  return (
    <section
      aria-labelledby="profile-sign-out-heading"
      className={`rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)]
        p-5 shadow-[0_4px_16px_color-mix(in_srgb,var(--color-text-primary)_4%,transparent)] ${className}`}
    >
      <Toaster position="top-center" richColors closeButton />
      <h3
        id="profile-sign-out-heading"
        className="text-[var(--text-sm)] font-bold text-[var(--color-text-primary)]"
      >
        Sign Out
      </h3>
      <p className="mt-1 text-[var(--text-sm)] font-medium leading-[var(--leading-base)] text-[var(--color-text-secondary)]">
        Sign out of this device.
      </p>
      <div className="mt-[var(--text-base)]">
        <button
          type="button"
          onClick={() => void handleSignOut()}
          disabled={isLoading}
          aria-busy={isLoading}
          className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)]
            border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5
            text-[var(--text-sm)] font-semibold text-[var(--color-text-primary)]
            transition-colors duration-150
            hover:bg-[var(--color-surface-raised)] hover:border-[var(--color-border-strong)] active:scale-[0.98]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="size-4 animate-spin motion-reduce:animate-none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Signing out…
            </span>
          ) : (
            "Sign Out"
          )}
        </button>
      </div>
    </section>
  )
}
