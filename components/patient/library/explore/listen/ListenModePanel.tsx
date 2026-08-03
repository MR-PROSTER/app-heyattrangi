"use client"

import { useMemo, useState } from "react"
import { Source_Serif_4 } from "next/font/google"
import type { ListenTrack, ListenCategory } from "@/data/listenContent"
import ListenCover from "@/components/patient/library/explore/listen/ListenCover"
import ListenGrid from "@/components/patient/library/explore/listen/ListenGrid"

const shelfSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
})

const LISTEN_CATEGORIES: ListenCategory[] = [
  "Rain",
  "Ocean",
  "Nature",
  "Instrumental",
]

type FilterKey = "All" | ListenCategory

interface ListenModePanelProps {
  tracks: ListenTrack[]
  recentlyPlayed?: ListenTrack[]
  onSelectTrack: (track: ListenTrack) => void
}

function ListenShelfCard({
  track,
  onSelect,
}: {
  track: ListenTrack
  onSelect?: (track: ListenTrack) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(track)}
      aria-label={`Play ${track.title}, ${track.duration}`}
      className="group flex w-full flex-col text-left
        transition-transform duration-200 ease-out
        hover:-translate-y-0.5 active:scale-[0.98]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 rounded-[14px]"
    >
      <ListenCover
        illustration={track.coverIllustration}
        size="portrait"
        title={track.title}
      />
      <div className="mt-3 px-0.5">
        <h3
          className={`${shelfSerif.className} line-clamp-2 text-[15px] font-bold leading-snug tracking-tight text-[#1A1A1A]`}
        >
          {track.title}
        </h3>
        {track.artist ? (
          <p className="mt-1 truncate text-[12px] font-medium text-[#9A9A9A]">
            {track.artist}
          </p>
        ) : null}
      </div>
    </button>
  )
}

/**
 * Listen browse — mobile: image-1 shelves; desktop: cover grid.
 */
export default function ListenModePanel({
  tracks,
  onSelectTrack,
}: ListenModePanelProps) {
  const [filter, setFilter] = useState<FilterKey>("All")

  const chips: FilterKey[] = useMemo(() => ["All", ...LISTEN_CATEGORIES], [])

  const ordered = useMemo(
    () =>
      [...tracks].sort(
        (a, b) =>
          a.displayOrder - b.displayOrder || a.title.localeCompare(b.title)
      ),
    [tracks]
  )

  const sections = useMemo(() => {
    if (filter !== "All") {
      return [
        {
          category: filter,
          items: ordered.filter((t) => t.category === filter),
        },
      ]
    }
    return LISTEN_CATEGORIES.map((category) => ({
      category,
      items: ordered.filter((t) => t.category === category),
    })).filter((s) => s.items.length > 0)
  }, [ordered, filter])

  const showAllForCategory = filter !== "All"

  if (ordered.length === 0) {
    return (
      <div className="animate-in fade-in duration-200">
        <p className="py-10 text-center text-sm font-medium text-[#8A8A8A]">
          No tracks yet.
        </p>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in duration-200">
      <div className="md:hidden space-y-7">
        <div
          className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar"
          role="tablist"
          aria-label="Listen categories"
        >
          {chips.map((chip) => {
            const active = filter === chip
            return (
              <button
                key={chip}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(chip)}
                className={`shrink-0 min-h-10 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors duration-150
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2
                  ${
                    active
                      ? "bg-[#1A1A1A] text-white shadow-sm"
                      : "bg-[#E8E0D4] text-[#3A3A3A] hover:bg-[#DDD4C6]"
                  }`}
              >
                {chip}
              </button>
            )
          })}
        </div>

        {sections.map(({ category, items }) => (
          <section
            key={category}
            aria-labelledby={`listen-mobile-${category}`}
            className="space-y-3"
          >
            <div className="flex items-end justify-between gap-3">
              <h2
                id={`listen-mobile-${category}`}
                className={`${shelfSerif.className} text-[22px] font-bold tracking-tight text-[#1A1A1A]`}
              >
                {category}
              </h2>
              {!showAllForCategory ? (
                <button
                  type="button"
                  onClick={() => setFilter(category)}
                  className="shrink-0 text-[13px] font-semibold text-[#E8722A]
                    hover:text-[#D45F1A] transition-colors
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 rounded-md px-1"
                >
                  See all
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setFilter("All")}
                  className="shrink-0 text-[13px] font-semibold text-[#E8722A]
                    hover:text-[#D45F1A] transition-colors
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 rounded-md px-1"
                >
                  Back
                </button>
              )}
            </div>

            {showAllForCategory ? (
              <div className="grid grid-cols-2 gap-x-3.5 gap-y-5">
                {items.map((track) => (
                  <ListenShelfCard
                    key={track.id}
                    track={track}
                    onSelect={onSelectTrack}
                  />
                ))}
              </div>
            ) : (
              <div className="flex gap-3.5 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar snap-x">
                {items.map((track) => (
                  <div key={track.id} className="snap-start shrink-0 w-[148px]">
                    <ListenShelfCard track={track} onSelect={onSelectTrack} />
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      <div className="hidden md:block">
        <ListenGrid tracks={ordered} onSelectTrack={onSelectTrack} />
      </div>
    </div>
  )
}
