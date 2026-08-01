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
import type { ListenTrack } from "@/data/listenContent"

interface ListenPlayerContextValue {
  currentTrack: ListenTrack | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  playbackRate: number
  recentlyPlayedIds: string[]
  playTrack: (track: ListenTrack) => void
  togglePlayPause: () => void
  seek: (time: number) => void
  setVolume: (v: number) => void
  setPlaybackRate: (rate: number) => void
  markPlayed: (track: ListenTrack) => void
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
  const [currentTrack, setCurrentTrack] = useState<ListenTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(0.85)
  const [playbackRate, setPlaybackRateState] = useState(1)
  const [recentlyPlayedIds, setRecentlyPlayedIds] = useState<string[]>([])

  useEffect(() => {
    const audio = new Audio()
    audio.preload = "metadata"
    audioRef.current = audio

    const onTime = () => setCurrentTime(audio.currentTime || 0)
    const onMeta = () => setDuration(audio.duration || 0)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => setIsPlaying(false)
    const onError = () => {
      setIsPlaying(false)
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

    return () => {
      audio.pause()
      audio.removeEventListener("timeupdate", onTime)
      audio.removeEventListener("loadedmetadata", onMeta)
      audio.removeEventListener("durationchange", onMeta)
      audio.removeEventListener("play", onPlay)
      audio.removeEventListener("pause", onPause)
      audio.removeEventListener("ended", onEnded)
      audio.removeEventListener("error", onError)
      audioRef.current = null
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate
  }, [playbackRate])

  const markPlayed = useCallback((track: ListenTrack) => {
    setRecentlyPlayedIds((prev) => {
      const next = [track.id, ...prev.filter((id) => id !== track.id)]
      return next.slice(0, 8)
    })
  }, [])

  const playTrack = useCallback(
    (track: ListenTrack) => {
      const audio = audioRef.current
      if (!audio) return

      const isSame = currentTrack?.id === track.id
      if (!isSame) {
        audio.src = track.audioSrc
        setCurrentTrack(track)
        setCurrentTime(0)
        setDuration(0)
      }

      void audio.play().catch(() => {
        setIsPlaying(false)
      })
      markPlayed(track)
    },
    [currentTrack?.id, markPlayed]
  )

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
      isPlaying,
      currentTime,
      duration,
      volume,
      playbackRate,
      recentlyPlayedIds,
      playTrack,
      togglePlayPause,
      seek,
      setVolume,
      setPlaybackRate,
      markPlayed,
    }),
    [
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      volume,
      playbackRate,
      recentlyPlayedIds,
      playTrack,
      togglePlayPause,
      seek,
      setVolume,
      setPlaybackRate,
      markPlayed,
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
