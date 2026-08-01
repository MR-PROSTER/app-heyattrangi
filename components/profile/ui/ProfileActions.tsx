"use client"

import { type ReactNode } from "react"

interface ProfileActionsProps {
  children: ReactNode
  className?: string
  align?: "start" | "end" | "between"
}

const alignClass = {
  start: "justify-start",
  end: "justify-end",
  between: "justify-between",
} as const

export default function ProfileActions({
  children,
  className = "",
  align = "start",
}: ProfileActionsProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row flex-wrap gap-3 pt-2 ${alignClass[align]} ${className}`}
    >
      {children}
    </div>
  )
}
