import { notFound } from "next/navigation"
import type { Metadata } from "next"
import {
  getBrowsableListenTracks,
  getListenTrackBySlug,
} from "@/data/listenContent"
import ListenTrackClient from "./ListenTrackClient"

interface ListenTrackPageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getBrowsableListenTracks().map((track) => ({ slug: track.slug }))
}

export async function generateMetadata({
  params,
}: ListenTrackPageProps): Promise<Metadata> {
  const { slug } = await params
  const track = getListenTrackBySlug(slug)
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
  const track = getListenTrackBySlug(slug)

  if (!track) {
    notFound()
  }

  return <ListenTrackClient track={track} />
}
