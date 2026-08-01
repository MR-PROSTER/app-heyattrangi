export type ListenCategory =
  | "Calm"
  | "Sleep"
  | "Focus"
  | "Nature"
  | "Breath"
  | "Rest"

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
  description: string
  duration: string
  category: ListenCategory
  audioAvailable: boolean
  coverIllustration: ListenCoverIllustration
  /** Local placeholder asset path */
  audioSrc: string
}

const PLACEHOLDER = "/audio/calm-placeholder.wav"

export const LISTEN_TRACKS: ListenTrack[] = [
  {
    id: "ocean-hush",
    slug: "ocean-hush",
    title: "Ocean Hush",
    description: "Soft coastal waves for a quieter moment.",
    duration: "3 min",
    category: "Nature",
    audioAvailable: true,
    coverIllustration: "waves",
    audioSrc: PLACEHOLDER,
  },
  {
    id: "moonlit-rest",
    slug: "moonlit-rest",
    title: "Moonlit Rest",
    description: "A gentle night atmosphere to settle into.",
    duration: "5 min",
    category: "Sleep",
    audioAvailable: true,
    coverIllustration: "moon",
    audioSrc: PLACEHOLDER,
  },
  {
    id: "forest-edge",
    slug: "forest-edge",
    title: "Forest Edge",
    description: "Light leaves and open air for soft grounding.",
    duration: "4 min",
    category: "Nature",
    audioAvailable: true,
    coverIllustration: "leaves",
    audioSrc: PLACEHOLDER,
  },
  {
    id: "rain-window",
    slug: "rain-window",
    title: "Rain at the Window",
    description: "Steady rainfall for calm background listening.",
    duration: "6 min",
    category: "Calm",
    audioAvailable: true,
    coverIllustration: "rain",
    audioSrc: PLACEHOLDER,
  },
  {
    id: "morning-glow",
    slug: "morning-glow",
    title: "Morning Glow",
    description: "Warm, unhurried tones to ease into the day.",
    duration: "3 min",
    category: "Focus",
    audioAvailable: true,
    coverIllustration: "sun",
    audioSrc: PLACEHOLDER,
  },
  {
    id: "soft-clouds",
    slug: "soft-clouds",
    title: "Soft Clouds",
    description: "Airy ambience when you want things lighter.",
    duration: "4 min",
    category: "Rest",
    audioAvailable: true,
    coverIllustration: "cloud",
    audioSrc: PLACEHOLDER,
  },
  {
    id: "steady-stone",
    slug: "steady-stone",
    title: "Steady Stone",
    description: "Low, grounding tones for a slower pace.",
    duration: "5 min",
    category: "Breath",
    audioAvailable: true,
    coverIllustration: "stone",
    audioSrc: PLACEHOLDER,
  },
  {
    id: "open-breeze",
    slug: "open-breeze",
    title: "Open Breeze",
    description: "A light windlike wash for mental space.",
    duration: "3 min",
    category: "Calm",
    audioAvailable: true,
    coverIllustration: "wind",
    audioSrc: PLACEHOLDER,
  },
]

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
