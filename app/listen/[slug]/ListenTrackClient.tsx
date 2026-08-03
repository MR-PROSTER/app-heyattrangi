"use client"

import { useRouter } from "next/navigation"
import type { ListenTrack } from "@/data/listenContent"
import ListenPlayerScreen from "@/components/patient/library/explore/listen/ListenPlayerScreen"
import ListenPlayerProvider from "@/components/patient/library/explore/listen/ListenPlayerContext"

interface ListenTrackClientProps {
  track: ListenTrack
}

/**
 * Client shell for /listen/[slug] — full-bleed player, no sidebar.
 */
export default function ListenTrackClient({ track }: ListenTrackClientProps) {
  const router = useRouter()

  return (
    <ListenPlayerProvider>
      <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
        <ListenPlayerScreen
          track={track}
          onBack={() => router.push("/patient/library?mode=listen")}
        />
      </div>
    </ListenPlayerProvider>
  )
}
