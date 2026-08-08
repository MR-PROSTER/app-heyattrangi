import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getListenTrackBySlug, type ListenTrack } from "@/data/listenContent"
import { getAudioTrackByIdOrSlug } from "@/app/data/audioTracks"
import { getMusicTrack, UNIQUE_TRACKS } from "@/lib/data/musicLibrary"
import ListenTrackClient from "./ListenTrackClient"

function getMusicLibraryTrackAsListenTrack(slug: string): ListenTrack | null {
  const base = UNIQUE_TRACKS[slug]
  if (!base) return null
  try {
    const track = getMusicTrack(slug)
    const isAvailable = track.audioUrl !== null
    return {
      id: track.id,
      slug: track.id,
      title: track.title,
      shortDescription: `Track in Aatrangi Music`,
      description: `Track in Aatrangi Music`,
      category: "Instrumental",
      artist: "Hey Attrangi Wellness",
      duration: track.duration || "5:00",
      displayOrder: 1,
      audioAvailable: isAvailable,
      coverIllustration: "moon" as const,
      coverImage: track.artworkUrl || "",
      audioSrc: track.audioUrl || "",
    } as ListenTrack
  } catch {
    return null
  }
}

interface ListenTrackPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: ListenTrackPageProps): Promise<Metadata> {
  const { slug } = await params
  const track = getMusicLibraryTrackAsListenTrack(slug) || (await getAudioTrackByIdOrSlug(slug)) || getListenTrackBySlug(slug)
  if (!track) {
    return { title: "Track not found" }
  }
  return {
    title: track.title,
    description: track.shortDescription || track.description || undefined,
  }
}

export default async function ListenTrackPage({ params }: ListenTrackPageProps) {
  const { slug } = await params
  const track = getMusicLibraryTrackAsListenTrack(slug) || (await getAudioTrackByIdOrSlug(slug)) || getListenTrackBySlug(slug)

  if (!track) {
    notFound()
  }

  return <ListenTrackClient track={track} />
}

