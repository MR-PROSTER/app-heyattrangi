"use client"

import {
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
} from "lucide-react"
import type { ListenTrack } from "@/data/listenContent"
import {
  formatListenTime,
  useListenPlayer,
} from "@/components/patient/library/explore/listen/ListenPlayerContext"

interface AudioPlayerProps {
  className?: string
  /** Ensures controls render before context track is set */
  fallbackTrack?: ListenTrack
}

const SKIP_SECONDS = 15

/**
 * Editorial listen controls — progress + transport row (image-2).
 */
export default function AudioPlayer({
  className = "",
  fallbackTrack,
}: AudioPlayerProps) {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    seek,
  } = useListenPlayer()

  const track = currentTrack ?? fallbackTrack ?? null
  if (!track) return null

  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0
  const progress =
    safeDuration > 0 ? Math.min(100, (currentTime / safeDuration) * 100) : 0

  const skipBy = (delta: number) => {
    if (safeDuration > 0) {
      seek(Math.max(0, Math.min(safeDuration, currentTime + delta)))
    } else {
      seek(Math.max(0, currentTime + delta))
    }
  }

  return (
    <div
      className={`w-full space-y-7 md:space-y-8 ${className}`}
      role="region"
      aria-label={`Audio player for ${track.title}`}
    >
      <div className="space-y-2">
        <label className="sr-only" htmlFor="listen-seek">
          Seek
        </label>
        <input
          id="listen-seek"
          type="range"
          min={0}
          max={Math.max(safeDuration, 1)}
          step={0.1}
          value={Number.isFinite(currentTime) ? Math.min(currentTime, Math.max(safeDuration, 1)) : 0}
          onChange={(e) => seek(Number(e.target.value))}
          aria-valuemin={0}
          aria-valuemax={Math.round(safeDuration || 0)}
          aria-valuenow={Math.round(currentTime)}
          aria-label="Seek position"
          className="w-full cursor-pointer appearance-none bg-transparent outline-none
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--color-brand)]
            [&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(232,114,42,0.4)]
            [&::-webkit-slider-thumb]:mt-[-5.5px]
            [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5
            [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--color-brand)]
            [&::-moz-range-thumb]:border-0
            [&::-webkit-slider-runnable-track]:h-[3px] [&::-webkit-slider-runnable-track]:rounded-full
            [&::-moz-range-track]:h-[3px] [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent"
          style={{
            background: `linear-gradient(to right, var(--color-brand) ${progress}%, #F5D9C4 ${progress}%)`,
            height: 3,
            borderRadius: 999,
          }}
        />
        <div className="flex items-center justify-between text-[12px] font-medium tabular-nums text-[#9A9A9A]">
          <span aria-label={`Current time ${formatListenTime(currentTime)}`}>
            {formatListenTime(currentTime)}
          </span>
          <span aria-label={`Duration ${formatListenTime(safeDuration)}`}>
            {safeDuration > 0
              ? formatListenTime(safeDuration)
              : track.duration.replace(/\s*min.*/i, ":00").replace(/^(\d+)$/, "$1:00") ||
                "0:00"}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-5 sm:gap-6">
        <button
          type="button"
          onClick={() => skipBy(-SKIP_SECONDS)}
          aria-label={`Rewind ${SKIP_SECONDS} seconds`}
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#5A5A5A] transition-colors hover:bg-black/[0.04] hover:text-[#1A1A1A]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2"
        >
          <RotateCcw className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </button>

        <button
          type="button"
          onClick={() => seek(0)}
          aria-label="Restart track"
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#5A5A5A] transition-colors hover:bg-black/[0.04] hover:text-[#1A1A1A]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2"
        >
          <SkipBack className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </button>

        <button
          type="button"
          onClick={togglePlayPause}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[var(--color-brand)] text-white
            shadow-[0_10px_28px_rgba(232,114,42,0.4)] transition-all hover:brightness-95 hover:scale-[1.03] active:scale-[0.98]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]/40 focus-visible:ring-offset-2"
        >
          {isPlaying ? (
            <Pause className="h-6 w-6 fill-current" aria-hidden />
          ) : (
            <Play className="h-6 w-6 fill-current ml-0.5" aria-hidden />
          )}
        </button>

        <button
          type="button"
          onClick={() => safeDuration > 0 && seek(safeDuration)}
          aria-label="Go to end"
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#5A5A5A] transition-colors hover:bg-black/[0.04] hover:text-[#1A1A1A]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2"
        >
          <SkipForward className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </button>

        <button
          type="button"
          onClick={() => skipBy(SKIP_SECONDS)}
          aria-label={`Forward ${SKIP_SECONDS} seconds`}
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#5A5A5A] transition-colors hover:bg-black/[0.04] hover:text-[#1A1A1A]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2"
        >
          <RotateCw className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </button>
      </div>
    </div>
  )
}
