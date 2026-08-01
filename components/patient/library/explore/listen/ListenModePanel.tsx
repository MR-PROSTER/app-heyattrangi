"use client"

import type { ListenTrack } from "@/data/listenContent"
import ExploreSectionHeader from "@/components/patient/library/explore/ExploreSectionHeader"
import ListenGrid from "@/components/patient/library/explore/listen/ListenGrid"
import ListenCard from "@/components/patient/library/explore/listen/ListenCard"

interface ListenModePanelProps {
  tracks: ListenTrack[]
  recentlyPlayed: ListenTrack[]
  onSelectTrack: (track: ListenTrack) => void
}

export default function ListenModePanel({
  tracks,
  recentlyPlayed,
  onSelectTrack,
}: ListenModePanelProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {recentlyPlayed.length > 0 && (
        <section aria-label="Picked up recently">
          <ExploreSectionHeader title="Picked up recently" />
          <div className="flex gap-3 sm:gap-3.5 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar snap-x">
            {recentlyPlayed.map((track) => (
              <div
                key={`recent-listen-${track.id}`}
                className="snap-start shrink-0 w-[260px] sm:w-[280px]"
              >
                <ListenCard track={track} onSelect={onSelectTrack} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section aria-label="Listen tracks">
        <ListenGrid tracks={tracks} onSelectTrack={onSelectTrack} />
      </section>
    </div>
  )
}
