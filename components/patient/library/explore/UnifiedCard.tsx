"use client"

import React from "react"
import { BookOpen, Music } from "lucide-react"
import { Source_Serif_4 } from "next/font/google"
import ArticleCover from "@/components/patient/library/explore/read/ArticleCover"
import ListenCover from "@/components/patient/library/explore/listen/ListenCover"

const cardSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
})

interface UnifiedCardProps {
  item: any
  type: "read" | "listen"
  onSelect: (item: any) => void
}

export default function UnifiedCard({ item, type, onSelect }: UnifiedCardProps) {
  const title = item.title
  const author = type === "read" ? (item.author || "Hey Attrangi") : (item.artist || "Hey Attrangi")

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="group flex w-full flex-col text-left transition-transform duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 rounded-[14px]"
    >
      <div className="w-full">
        {type === "read" ? (
          <ArticleCover
            illustration={item.cover}
            coverImage={item.coverImage}
            title={title}
          />
        ) : (
          <ListenCover
            illustration={item.coverIllustration}
            size="portrait"
            title={title}
          />
        )}
      </div>
      <div className="mt-3 px-0.5 w-full">
        <h3 className={`${cardSerif.className} text-[16px] font-bold leading-tight text-[#1A1A1A] line-clamp-1`}>
          {title}
        </h3>
        <div className="flex items-center justify-between gap-2 mt-1 w-full">
          <p className="text-[13px] font-semibold text-[#5A5A5A] truncate">
            {author}
          </p>
          <div className="shrink-0 w-7 h-7 rounded-[7px] border border-slate-950/80 text-slate-950 flex items-center justify-center bg-transparent">
            {type === "read" ? (
              <BookOpen className="w-[13px] h-[13px]" strokeWidth={2} />
            ) : (
              <Music className="w-[13px] h-[13px]" strokeWidth={2} />
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
