/**
 * Listen tracks — Excel/JSON-compatible content for Explore Listen cards.
 * UI fields (description, duration, coverIllustration) stay for existing components.
 */

export type ListenCategory = "Rain" | "Ocean" | "Nature" | "Instrumental"

export type ListenCoverIllustration =
  | "waves"
  | "moon"
  | "leaves"
  | "rain"
  | "sun"
  | "cloud"
  | "stone"
  | "wind"

export interface ListenTrack {
  id: string
  slug: string
  title: string
  /** Excel shortDescription */
  shortDescription: string
  /** Alias of shortDescription — existing player UI */
  description: string
  category: ListenCategory
  artist: string
  duration: string
  displayOrder: number
  audioAvailable: boolean
  coverIllustration: ListenCoverIllustration
  /** Local placeholder until Cloudinary hosting */
  audioSrc: string
}

const PLACEHOLDER = "/audio/sample-3s.wav"

function coverForCategory(
  category: ListenCategory,
  index: number
): ListenCoverIllustration {
  const byCategory: Record<ListenCategory, ListenCoverIllustration[]> = {
    Rain: ["rain", "cloud", "rain"],
    Ocean: ["waves"],
    Nature: ["leaves", "sun"],
    Instrumental: ["moon", "stone"],
  }
  const options = byCategory[category]
  return options[index % options.length] ?? "rain"
}

const RAW_TRACKS: Array<{
  slug: string
  title: string
  shortDescription: string
  category: ListenCategory
  artist: string
  duration: string
  displayOrder: number
}> = [
  {
    slug: "listen-relaxing-rain",
    title: "Relaxing Rain",
    shortDescription:
      "Steady, even rainfall -- no thunder, no music bed. Good for winding down or studying.",
    category: "Rain",
    artist: "DRAGON-STUDIO",
    duration: "10 min",
    displayOrder: 1,
  },
  {
    slug: "listen-rain-sleep-study",
    title: "Rain Sound for Relaxation and Sleep Study",
    shortDescription:
      "A longer rain loop, specifically produced for study and sleep contexts.",
    category: "Rain",
    artist: "DRAGON-STUDIO",
    duration: "15 min",
    displayOrder: 2,
  },
  {
    slug: "listen-gentle-rain-window",
    title: "Gentle Rain on Window for Sleep",
    shortDescription:
      "Soft, close-mic'd rain against glass -- a quieter, more intimate texture than open rainfall.",
    category: "Rain",
    artist: "Eryliaa",
    duration: "13 min",
    displayOrder: 3,
  },
  {
    slug: "listen-rain-ocean-mix",
    title: "Light Rain with Gentle Ocean Waves Mix",
    shortDescription:
      "Rain and ocean waves blended into one long, steady ambient track.",
    category: "Ocean",
    artist: "enternalrainsounds",
    duration: "15 min",
    displayOrder: 4,
  },
  {
    slug: "listen-forest-morning",
    title: "Spring Morning Forest Wildlife",
    shortDescription:
      "Birdsong and light forest ambience -- a calmer, more alert feel than rain or ocean tracks.",
    category: "Nature",
    artist: "The_Prevalent_Rats",
    duration: "5 min",
    displayOrder: 5,
  },
  {
    slug: "listen-morning-birdsong",
    title: "Morning Birdsong Ambience",
    shortDescription:
      "A longer, gentler birdsong track for daytime calm rather than sleep.",
    category: "Nature",
    artist: "STRACHszydlo",
    duration: "7 min",
    displayOrder: 6,
  },
  {
    slug: "listen-calm-piano-1",
    title: "Calm Piano Music",
    shortDescription:
      "A short, unhurried solo piano piece -- good as a between-classes reset.",
    category: "Instrumental",
    artist: "Clavier-Music",
    duration: "3 min",
    displayOrder: 7,
  },
  {
    slug: "listen-calm-piano-2",
    title: "Piano Calm",
    shortDescription:
      "A second short piano piece, slightly warmer tone than the first -- gives Listen mode range without committing to a long track.",
    category: "Instrumental",
    artist: "leberch",
    duration: "2 min",
    displayOrder: 8,
  },
]

export const LISTEN_TRACKS: ListenTrack[] = RAW_TRACKS.map((row, index) => ({
  id: row.slug,
  slug: row.slug,
  title: row.title,
  shortDescription: row.shortDescription,
  description: row.shortDescription,
  category: row.category,
  artist: row.artist,
  duration: row.duration,
  displayOrder: row.displayOrder,
  audioAvailable: true,
  coverIllustration: coverForCategory(row.category, index),
  audioSrc: encodeURI(`/media/audio/${row.title}.mp3`),
})).sort((a, b) => a.displayOrder - b.displayOrder)

/** Prefer available tracks only for browse/play. */
export function getBrowsableListenTracks(): ListenTrack[] {
  return LISTEN_TRACKS.filter((t) => t.audioAvailable)
}

export function getListenTrackBySlug(slug: string): ListenTrack | undefined {
  return getBrowsableListenTracks().find((t) => t.slug === slug)
}

export function getListenTracksByIds(ids: string[]): ListenTrack[] {
  const map = new Map(LISTEN_TRACKS.map((t) => [t.id, t]))
  return ids
    .map((id) => map.get(id))
    .filter((t): t is ListenTrack => t != null && t.audioAvailable)
}
