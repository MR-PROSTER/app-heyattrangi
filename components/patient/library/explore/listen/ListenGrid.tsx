"use client"

import { motion } from "framer-motion"
import type { ListenTrack } from "@/data/listenContent"
import ListenCard from "@/components/patient/library/explore/listen/ListenCard"

interface ListenGridProps {
  tracks: ListenTrack[]
  onSelectTrack?: (track: ListenTrack) => void
}

export default function ListenGrid({
  tracks,
  onSelectTrack,
}: ListenGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
      {tracks.map((track, index) => (
        <motion.div
          key={track.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: Math.min(index * 0.04, 0.24),
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <ListenCard track={track} onSelect={onSelectTrack} />
        </motion.div>
      ))}
    </div>
  )
}
