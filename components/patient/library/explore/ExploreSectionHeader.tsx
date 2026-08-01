"use client"

import { ChevronRight } from "lucide-react"

interface ExploreSectionHeaderProps {
  title: string
  onClick?: () => void
  className?: string
}

export default function ExploreSectionHeader({
  title,
  onClick,
  className = "",
}: ExploreSectionHeaderProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1 mb-4 group ${className}`}
    >
      <h3 className="font-bold text-[18px] text-slate-800 tracking-tight">
        {title}
      </h3>
      <ChevronRight className="w-5 h-5 text-slate-700 group-hover:translate-x-0.5 transition-transform" />
    </button>
  )
}
