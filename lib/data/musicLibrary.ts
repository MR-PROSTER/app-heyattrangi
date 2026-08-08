export interface MusicTrack {
  id: string
  title: string
  filename: string
  audioUrl: string | null // Configurable/CDN URL, falls back to local placeholder if null
  duration?: string // Display duration
  artworkUrl?: string // Optional custom thumbnail
}

export interface MusicCategory {
  name: string
  description: string
  trackIds: string[]
  trackCount: number
}

export const UNIQUE_TRACKS: Record<string, Omit<MusicTrack, "audioUrl">> = {
  "calm-ambient": {
    id: "calm-ambient",
    title: "Calm Ambient",
    filename: "006_lifeWave2k.mp3",
    duration: "5:32",
    artworkUrl: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=600&auto=format&fit=crop",
  },
  "gentle-ambient": {
    id: "gentle-ambient",
    title: "Gentle Ambient",
    filename: "007_Synthwave_421k.mp3",
    duration: "6:14",
    artworkUrl: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=600&auto=format&fit=crop",
  },
  "first-light": {
    id: "first-light",
    title: "First Light",
    filename: "first_light_particles.mp3",
    duration: "2:11",
    artworkUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=600&auto=format&fit=crop",
  },
  "the-budding-of-consciousness": {
    id: "the-budding-of-consciousness",
    title: "The Budding of Consciousness",
    filename: "the_budding_of_consciousness.mp3",
    duration: "7:02",
    artworkUrl: "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?q=80&w=600&auto=format&fit=crop",
  },
  "up-in-the-sky": {
    id: "up-in-the-sky",
    title: "Up in the Sky",
    filename: "Memoraphile - Up in the Sky.mp3",
    duration: "5:18",
    artworkUrl: "https://images.unsplash.com/photo-1494005612480-90f50fd9376f?q=80&w=600&auto=format&fit=crop",
  },
  "warm-ambient": {
    id: "warm-ambient",
    title: "Warm Ambient",
    filename: "001_Synthwave_4k.mp3",
    duration: "4:56",
    artworkUrl: "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?q=80&w=600&auto=format&fit=crop",
  },
  "gentle-emotional-piano": {
    id: "gentle-emotional-piano",
    title: "Gentle Emotional Piano",
    filename: "emotional_piano.mp3",
    duration: "5:08",
    artworkUrl: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=600&auto=format&fit=crop",
  },
  "tender-piano": {
    id: "tender-piano",
    title: "Tender Piano",
    filename: "pianoemo139.mp3",
    duration: "6:30",
    artworkUrl: "https://images.unsplash.com/photo-1552422535-c45813c61732?q=80&w=600&auto=format&fit=crop",
  },
  "deep-blue": {
    id: "deep-blue",
    title: "Deep Blue",
    filename: "yoiyami_core_theme.mp3",
    duration: "5:45",
    artworkUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop",
  },
  "calm-piano": {
    id: "calm-piano",
    title: "Calm Piano",
    filename: "003_Vaporware.mp3",
    duration: "4:12",
    artworkUrl: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=600&auto=format&fit=crop",
  },
  "emotional-piano": {
    id: "emotional-piano",
    title: "Emotional Piano",
    filename: "emotional_piano.mp3",
    duration: "5:08",
    artworkUrl: "https://images.unsplash.com/photo-1552422535-c45813c61732?q=80&w=600&auto=format&fit=crop",
  },
  "november-reflection": {
    id: "november-reflection",
    title: "November Reflection",
    filename: "improv_november_14.mp3",
    duration: "6:54",
    artworkUrl: "https://images.unsplash.com/photo-1477414302227-d31450b1474d?q=80&w=600&auto=format&fit=crop",
  },
  "piano-nostalgia": {
    id: "piano-nostalgia",
    title: "Piano Nostalgia",
    filename: "piano_nostalgia.mp3",
    duration: "5:22",
    artworkUrl: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=600&auto=format&fit=crop",
  },
  "mystical-piano": {
    id: "mystical-piano",
    title: "Mystical Piano",
    filename: "Mystical Piano.mp3",
    duration: "4:40",
    artworkUrl: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=600&auto=format&fit=crop",
  },
  "quiet-piano": {
    id: "quiet-piano",
    title: "Quiet Piano",
    filename: "pianoemo10.mp3",
    duration: "6:10",
    artworkUrl: "https://images.unsplash.com/photo-1552422535-c45813c61732?q=80&w=600&auto=format&fit=crop",
  },
  "boredom": {
    id: "boredom",
    title: "Boredom",
    filename: "03 HoliznaCC0 - Boredom.mp3",
    duration: "4:05",
    artworkUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&auto=format&fit=crop",
  },
  "lost-in-your-eyes": {
    id: "lost-in-your-eyes",
    title: "Lost in Your Eyes",
    filename: "06 HoliznaCC0 - Lost In Your Eyes.mp3",
    duration: "5:12",
    artworkUrl: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=600&auto=format&fit=crop",
  },
  "jrpg-piano": {
    id: "jrpg-piano",
    title: "JRPG Piano",
    filename: "JRPG Piano.mp3",
    duration: "4:24",
    artworkUrl: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=600&auto=format&fit=crop",
  },
  "night-driving": {
    id: "night-driving",
    title: "Night Driving",
    filename: "02 HoliznaCC0 - Night Driving.mp3",
    duration: "4:50",
    artworkUrl: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?q=80&w=600&auto=format&fit=crop",
  },
  "love": {
    id: "love",
    title: "Love",
    filename: "05 HoliznaCC0 - Love.mp3",
    duration: "5:02",
    artworkUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop",
  },
  "contemplation": {
    id: "contemplation",
    title: "Contemplation",
    filename: "Contemplation.mp3",
    duration: "5:30",
    artworkUrl: "https://images.unsplash.com/photo-1488866081807-dcad22967c4c?q=80&w=600&auto=format&fit=crop",
  },
  "slow-piano-intermission": {
    id: "slow-piano-intermission",
    title: "Slow Piano Intermission",
    filename: "slow piano intermission.mp3",
    duration: "3:48",
    artworkUrl: "https://images.unsplash.com/photo-1552422535-c45813c61732?q=80&w=600&auto=format&fit=crop",
  },
  "forest-ambience": {
    id: "forest-ambience",
    title: "Forest Ambience",
    filename: "Forest_Ambience (1).mp3",
    duration: "8:10",
    artworkUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=600&auto=format&fit=crop",
  },
  "forest-ambience-extended": {
    id: "forest-ambience-extended",
    title: "Forest Ambience — Extended",
    filename: "Forest_Ambience.mp3",
    duration: "15:00",
    artworkUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=600&auto=format&fit=crop",
  },
  "birds-before-rain": {
    id: "birds-before-rain",
    title: "Birds Before Rain",
    filename: "park_ambience_birds.mp3",
    duration: "6:20",
    artworkUrl: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=600&auto=format&fit=crop",
  },
  "river-ambience": {
    id: "river-ambience",
    title: "River Ambience",
    filename: "park_ambience_river.mp3",
    duration: "7:15",
    artworkUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600&auto=format&fit=crop",
  },
  "wind-ambience": {
    id: "wind-ambience",
    title: "Wind Ambience",
    filename: "park_ambience_wind.mp3",
    duration: "6:40",
    artworkUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600&auto=format&fit=crop",
  },
  "another-august": {
    id: "another-august",
    title: "Another August",
    filename: "013_Another_August.mp3",
    duration: "4:15",
    artworkUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop",
  },
  "sunset-plains": {
    id: "sunset-plains",
    title: "Sunset Plains",
    filename: "sunset_plains.mp3",
    duration: "5:50",
    artworkUrl: "https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=600&auto=format&fit=crop",
  },
  "dreaming-of-leaves": {
    id: "dreaming-of-leaves",
    title: "Dreaming of Leaves",
    filename: "02_dreaming_of_leaves.mp3",
    duration: "5:04",
    artworkUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&auto=format&fit=crop",
  },
  "conscious-swamp": {
    id: "conscious-swamp",
    title: "Conscious Swamp",
    filename: "05_conscious_swamp.mp3",
    duration: "6:12",
    artworkUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=600&auto=format&fit=crop",
  },
  "sleep-music": {
    id: "sleep-music",
    title: "Sleep Music",
    filename: "sleep_music.mp3",
    duration: "20:00",
    artworkUrl: "https://images.unsplash.com/photo-1511289081367-4a0f8691068c?q=80&w=600&auto=format&fit=crop",
  },
  "frozen-ocean-trip": {
    id: "frozen-ocean-trip",
    title: "Frozen Ocean Trip",
    filename: "04_frozen_ocean_trip.mp3",
    duration: "7:30",
    artworkUrl: "https://images.unsplash.com/photo-1518098268026-4e43a1a009de?q=80&w=600&auto=format&fit=crop",
  },
  "strange-reality-warp": {
    id: "strange-reality-warp",
    title: "Strange Reality Warp",
    filename: "06_strange_reality_warp.mp3",
    duration: "6:45",
    artworkUrl: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?q=80&w=600&auto=format&fit=crop",
  },
  "starfield-romance": {
    id: "starfield-romance",
    title: "Starfield Romance",
    filename: "starfield_romance1.mp3",
    duration: "5:58",
    artworkUrl: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=600&auto=format&fit=crop",
  },
}

export const MUSIC_CATEGORIES: MusicCategory[] = [
  {
    name: "Calm Down",
    description: "Soothe your system and quiet your mind.",
    trackIds: [
      "calm-ambient",
      "gentle-ambient",
      "first-light",
      "the-budding-of-consciousness",
      "up-in-the-sky",
    ],
    trackCount: 5,
  },
  {
    name: "Comfort",
    description: "Feel safe, warm, and emotionally held.",
    trackIds: [
      "warm-ambient",
      "gentle-emotional-piano",
      "tender-piano",
      "deep-blue",
      "calm-piano",
      "first-light",
      "the-budding-of-consciousness",
    ],
    trackCount: 7,
  },
  {
    name: "Emotional Release",
    description: "Give space to your feelings and let them flow.",
    trackIds: [
      "emotional-piano",
      "november-reflection",
      "piano-nostalgia",
      "first-light",
      "mystical-piano",
      "quiet-piano",
    ],
    trackCount: 6,
  },
  {
    name: "Focus",
    description: "Clear away distractions and lock in your attention.",
    trackIds: [
      "calm-piano",
      "boredom",
      "lost-in-your-eyes",
      "jrpg-piano",
      "night-driving",
      "love",
      "contemplation",
      "slow-piano-intermission",
    ],
    trackCount: 8,
  },
  {
    name: "Ground & Breathe",
    description: "Connect to the earth and stabilize your breathing.",
    trackIds: [
      "warm-ambient",
      "forest-ambience",
      "forest-ambience-extended",
      "birds-before-rain",
      "river-ambience",
      "wind-ambience",
      "deep-blue",
    ],
    trackCount: 7,
  },
  {
    name: "Lift Your Mood",
    description: "Brighten your outlook and re-energize your spirit.",
    trackIds: [
      "calm-piano",
      "calm-ambient",
      "another-august",
      "first-light",
      "sunset-plains",
    ],
    trackCount: 5,
  },
  {
    name: "Reflect",
    description: "Look inward and sit gently with your thoughts.",
    trackIds: [
      "contemplation",
      "piano-nostalgia",
      "slow-piano-intermission",
      "first-light",
      "quiet-piano",
      "the-budding-of-consciousness",
    ],
    trackCount: 6,
  },
  {
    name: "Sleep & Wind Down",
    description: "Drift off into a deep, restful state of sleep.",
    trackIds: [
      "dreaming-of-leaves",
      "conscious-swamp",
      "sleep-music",
      "frozen-ocean-trip",
      "strange-reality-warp",
      "starfield-romance",
    ],
    trackCount: 6,
  },
]

/**
 * Global registry of uploaded track URLs.
 * Map track ID -> absolute CDN URL or relative public path.
 * If a track is not present in this map, it will be treated as "Coming Soon" (unavailable) in the UI.
 * 
 * We pre-configure two tracks with local files for testing and evaluation.
 */
export const CONFIGURED_TRACK_URLS: Record<string, string> = {
  "calm-ambient": "/media/audio/006_lifeWave2k_pial5o.mp3",
  "gentle-ambient": "/media/audio/007_Synthwave_421k_mdagxl.mp3",
  "first-light": "/media/audio/first_light_particles_fbqtmt.mp3",
  "calm-piano": "/media/audio/Calm Piano Music.mp3",
}

/**
 * Helper to fetch a track from the library.
 * The audioUrl is configurable here dynamically if needed.
 */
export function getMusicTrack(id: string, customCdnBase?: string): MusicTrack {
  const baseTrack = UNIQUE_TRACKS[id]
  if (!baseTrack) {
    throw new Error(`Track with ID "${id}" does not exist in the music library.`)
  }

  // Look up configured URL or CDN path
  let configuredUrl = CONFIGURED_TRACK_URLS[id] || null

  // If a custom CDN base is provided, construct the URL dynamically
  if (customCdnBase) {
    configuredUrl = `${customCdnBase}/${baseTrack.filename}`
  }

  return {
    ...baseTrack,
    audioUrl: configuredUrl ? encodeURI(configuredUrl) : null,
  }
}

export function getTracksForCategory(categoryName: string, customCdnBase?: string): MusicTrack[] {
  const cat = MUSIC_CATEGORIES.find((c) => c.name === categoryName)
  if (!cat) return []
  return cat.trackIds.map((id) => getMusicTrack(id, customCdnBase))
}

