"use client"

import { motion } from "framer-motion"
import type { ListenTrack } from "@/data/listenContent"
import ListenCard from "@/components/patient/library/explore/listen/ListenCard"

interface ListenGridProps {
  tracks: ListenTrack[]
  onSelectTrack?: (track: ListenTrack) => void
}

/** Same 4-column cover grid as Read. */
export default function ListenGrid({
  tracks,
  onSelectTrack,
}: ListenGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6 sm:gap-x-5 sm:gap-y-7 md:gap-x-6 md:gap-y-8">
      {tracks.map((track, index) => (
        <motion.div
          key={track.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.28,
            delay: Math.min(index * 0.035, 0.28),
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <ListenCard track={track} onSelect={onSelectTrack} />
        </motion.div>
      ))}
    </div>
  )
}
