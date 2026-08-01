"use client"

interface FieldStatusProps {
  status: "idle" | "saving" | "saved" | "error"
  message?: string | null
  className?: string
}

export default function FieldStatus({ status, message, className = "" }: FieldStatusProps) {
  if (status === "idle" && !message) return null

  if (status === "saving") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 ${className}`}
        role="status"
        aria-live="polite"
      >
        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        Saving…
      </span>
    )
  }

  if (status === "saved") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-semibold text-[#00a870] ${className}`}
        role="status"
        aria-live="polite"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#00a870]" aria-hidden="true" />
        Saved
      </span>
    )
  }

  if (status === "error" || message) {
    return (
      <span
        className={`text-xs font-semibold text-red-500 ${className}`}
        role="alert"
      >
        {message || "Something went wrong"}
      </span>
    )
  }

  return null
}
