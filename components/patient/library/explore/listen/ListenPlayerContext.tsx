"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { getBrowsableListenTracks, type ListenTrack } from "@/data/listenContent"

interface ListenPlayerContextValue {
  currentTrack: ListenTrack | null
  playlist: ListenTrack[]
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  playbackRate: number
  recentlyPlayedIds: string[]
  isRepeating: boolean
  playTrack: (track: ListenTrack, tracks?: ListenTrack[]) => void
  setPlaylist: (tracks: ListenTrack[]) => void
  togglePlayPause: () => void
  seek: (time: number) => void
  setVolume: (v: number) => void
  setPlaybackRate: (rate: number) => void
  markPlayed: (track: ListenTrack) => void
  playNext: () => void
  playPrevious: () => void
  toggleRepeat: () => void
}

const ListenPlayerContext = createContext<ListenPlayerContextValue | null>(null)

export function useListenPlayer() {
  const ctx = useContext(ListenPlayerContext)
  if (!ctx) {
    throw new Error("useListenPlayer must be used within ListenPlayerProvider")
  }
  return ctx
}

export function useListenPlayerOptional() {
  return useContext(ListenPlayerContext)
}

interface ListenPlayerProviderProps {
  children: ReactNode
}

export default function ListenPlayerProvider({
  children,
}: ListenPlayerProviderProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const pendingTrackRef = useRef<ListenTrack | null>(null)
  const [currentTrack, setCurrentTrack] = useState<ListenTrack | null>(null)
  const [playlist, setPlaylistState] = useState<ListenTrack[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(0.85)
  const [playbackRate, setPlaybackRateState] = useState(1)
  const [recentlyPlayedIds, setRecentlyPlayedIds] = useState<string[]>([])
  const [isRepeating, setIsRepeating] = useState(false)

  const playlistRef = useRef<ListenTrack[]>([])
  const isRepeatingRef = useRef<boolean>(false)
  const currentTrackRef = useRef<ListenTrack | null>(null)
  const currentTimeRef = useRef<number>(0)
  const isPlayingRef = useRef<boolean>(false)

  playlistRef.current = playlist
  isRepeatingRef.current = isRepeating
  currentTrackRef.current = currentTrack
  currentTimeRef.current = currentTime
  isPlayingRef.current = isPlaying

  useEffect(() => {
    if (playlistRef.current.length === 0) {
      setPlaylistState(getBrowsableListenTracks())
    }
  }, [])

  const markPlayed = useCallback((track: ListenTrack) => {
    setRecentlyPlayedIds((prev) => {
      const next = [track.id, ...prev.filter((id) => id !== track.id)]
      return next.slice(0, 8)
    })
  }, [])

  const setPlaylist = useCallback((tracks: ListenTrack[]) => {
    if (Array.isArray(tracks) && tracks.length > 0) {
      setPlaylistState(tracks)
    }
  }, [])

  const playTrack = useCallback(
    (track: ListenTrack, tracks?: ListenTrack[]) => {
      markPlayed(track)
      if (tracks && tracks.length > 0) {
        setPlaylistState(tracks)
      }

      const audio = audioRef.current
      if (!audio) {
        pendingTrackRef.current = track
        setCurrentTrack(track)
        setCurrentTime(0)
        setDuration(0)
        return
      }

      const isSame = currentTrackRef.current?.id === track.id
      if (!isSame) {
        console.log("[AudioPlayer] Loading new track:", track.id, "URL:", track.audioSrc)
        if (track.audioSrc.startsWith("http://") || track.audioSrc.startsWith("https://")) {
          audio.crossOrigin = "anonymous"
        } else {
          audio.removeAttribute("crossorigin")
        }
        audio.src = track.audioSrc
        audio.load()
        setCurrentTrack(track)
        setCurrentTime(0)
        setDuration(0)
      }

      void audio.play().catch((err) => {
        console.warn("[AudioPlayer] Playback failed/blocked:", err)
        setIsPlaying(false)
      })
    },
    [markPlayed]
  )

  const playNext = useCallback(() => {
    const current = currentTrackRef.current
    const list = playlistRef.current.length > 0 ? playlistRef.current : getBrowsableListenTracks()
    if (!current || list.length === 0) return

    const currentIndex = list.findIndex((t) => t.id === current.id || t.slug === current.slug)
    const nextIndex = (currentIndex + 1) % list.length
    const nextTrack = list[nextIndex >= 0 ? nextIndex : 0]
    if (nextTrack) {
      playTrack(nextTrack)
    }
  }, [playTrack])

  const playPrevious = useCallback(() => {
    const audio = audioRef.current
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0
      setCurrentTime(0)
      return
    }

    const current = currentTrackRef.current
    const list = playlistRef.current.length > 0 ? playlistRef.current : getBrowsableListenTracks()
    if (!current || list.length === 0) return

    const currentIndex = list.findIndex((t) => t.id === current.id || t.slug === current.slug)
    const prevIndex = (currentIndex - 1 + list.length) % list.length
    const prevTrack = list[prevIndex >= 0 ? prevIndex : 0]
    if (prevTrack) {
      playTrack(prevTrack)
    }
  }, [playTrack])

  const toggleRepeat = useCallback(() => {
    setIsRepeating((prev) => !prev)
  }, [])

  useEffect(() => {
    const audio = new Audio()
    audio.preload = "metadata"
    audioRef.current = audio

    const onTime = () => setCurrentTime(audio.currentTime || 0)
    const onMeta = () => setDuration(audio.duration || 0)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => {
      setIsPlaying(false)
      if (isRepeatingRef.current) {
        if (audioRef.current) {
          audioRef.current.currentTime = 0
          void audioRef.current.play().catch(() => setIsPlaying(false))
        }
      } else {
        const current = currentTrackRef.current
        const list = playlistRef.current.length > 0 ? playlistRef.current : getBrowsableListenTracks()
        if (current && list.length > 0) {
          const currentIndex = list.findIndex((t) => t.id === current.id || t.slug === current.slug)
          if (currentIndex >= 0 && currentIndex < list.length - 1) {
            const nextTrack = list[currentIndex + 1]
            if (nextTrack && audioRef.current) {
              audioRef.current.src = nextTrack.audioSrc
              setCurrentTrack(nextTrack)
              setCurrentTime(0)
              setDuration(0)
              void audioRef.current.play().catch(() => setIsPlaying(false))
            }
          }
        }
      }
    }
    const onError = (e: Event) => {
      setIsPlaying(false)
      const err = audio.error
      console.error("[ListenPlayer] Audio error event details:", {
        code: err?.code,
        message: err?.message,
        src: audio.src,
      })
      if (process.env.NODE_ENV !== "production") {
        console.warn("[ListenPlayer] Audio failed to load")
      }
    }

    audio.addEventListener("timeupdate", onTime)
    audio.addEventListener("loadedmetadata", onMeta)
    audio.addEventListener("durationchange", onMeta)
    audio.addEventListener("play", onPlay)
    audio.addEventListener("pause", onPause)
    audio.addEventListener("ended", onEnded)
    audio.addEventListener("error", onError)

    const pending = pendingTrackRef.current
    const active = currentTrackRef.current

    if (pending) {
      pendingTrackRef.current = null
      console.log("[AudioPlayer] Loading pending track:", pending.id, "URL:", pending.audioSrc)
      if (pending.audioSrc.startsWith("http://") || pending.audioSrc.startsWith("https://")) {
        audio.crossOrigin = "anonymous"
      } else {
        audio.removeAttribute("crossorigin")
      }
      audio.src = pending.audioSrc
      audio.load()
      setCurrentTrack(pending)
      setCurrentTime(0)
      setDuration(0)
      void audio.play().catch((err) => {
        console.warn("[AudioPlayer] Pending playback failed/blocked:", err)
        setIsPlaying(false)
      })
    } else if (active) {
      console.log("[AudioPlayer] Restoring active track:", active.id, "URL:", active.audioSrc)
      if (active.audioSrc.startsWith("http://") || active.audioSrc.startsWith("https://")) {
        audio.crossOrigin = "anonymous"
      } else {
        audio.removeAttribute("crossorigin")
      }
      audio.src = active.audioSrc
      audio.load()
      audio.currentTime = currentTimeRef.current
      if (isPlayingRef.current) {
        void audio.play().catch((err) => {
          console.warn("[AudioPlayer] Restored active playback failed:", err)
          setIsPlaying(false)
        })
      }
    }

    return () => {
      // Remove event listeners first so cleanup actions (pause, setting src to "")
      // do not trigger callbacks that mutate our React state or log errors.
      audio.removeEventListener("timeupdate", onTime)
      audio.removeEventListener("loadedmetadata", onMeta)
      audio.removeEventListener("durationchange", onMeta)
      audio.removeEventListener("play", onPlay)
      audio.removeEventListener("pause", onPause)
      audio.removeEventListener("ended", onEnded)
      audio.removeEventListener("error", onError)

      audio.pause()
      audio.src = ""
      try {
        audio.load()
      } catch {}
      audioRef.current = null
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate
  }, [playbackRate])

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return
    if (audio.paused) {
      void audio.play().catch(() => setIsPlaying(false))
    } else {
      audio.pause()
    }
  }, [currentTrack])

  const seek = useCallback((time: number) => {
    const audio = audioRef.current
    if (!audio || !Number.isFinite(time)) return
    audio.currentTime = Math.max(0, Math.min(time, audio.duration || time))
    setCurrentTime(audio.currentTime)
  }, [])

  const setVolume = useCallback((v: number) => {
    setVolumeState(Math.max(0, Math.min(1, v)))
  }, [])

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate)
  }, [])

  const value = useMemo(
    () => ({
      currentTrack,
      playlist,
      isPlaying,
      currentTime,
      duration,
      volume,
      playbackRate,
      recentlyPlayedIds,
      isRepeating,
      playTrack,
      setPlaylist,
      togglePlayPause,
      seek,
      setVolume,
      setPlaybackRate,
      markPlayed,
      playNext,
      playPrevious,
      toggleRepeat,
    }),
    [
      currentTrack,
      playlist,
      isPlaying,
      currentTime,
      duration,
      volume,
      playbackRate,
      recentlyPlayedIds,
      isRepeating,
      playTrack,
      setPlaylist,
      togglePlayPause,
      seek,
      setVolume,
      setPlaybackRate,
      markPlayed,
      playNext,
      playPrevious,
      toggleRepeat,
    ]
  )

  return (
    <ListenPlayerContext.Provider value={value}>
      {children}
    </ListenPlayerContext.Provider>
  )
}

export function formatListenTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, "0")}`
}

