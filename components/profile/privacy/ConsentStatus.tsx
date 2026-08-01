"use client"

import type { ConsentStatusKind } from "./privacyUtils"

interface ConsentStatusProps {
  status: ConsentStatusKind
  className?: string
}

export default function ConsentStatus({ status, className = "" }: ConsentStatusProps) {
  const accepted = status === "accepted"

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wide
        ${
          accepted
            ? "bg-emerald-50 text-emerald-900 border-emerald-200"
            : "bg-gray-100 text-gray-700 border-gray-200"
        }
        ${className}`}
    >
      {accepted ? "Accepted" : "Not recorded"}
    </span>
  )
}
