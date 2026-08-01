"use client"

import {
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react"
import {
  formatListenTime,
  useListenPlayer,
} from "@/components/patient/library/explore/listen/ListenPlayerContext"

const SPEEDS = [0.75, 1, 1.25, 1.5] as const

interface AudioPlayerProps {
  className?: string
}

export default function AudioPlayer({ className = "" }: AudioPlayerProps) {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackRate,
    togglePlayPause,
    seek,
    setVolume,
    setPlaybackRate,
  } = useListenPlayer()

  if (!currentTrack) return null

  const remaining = Math.max(0, (duration || 0) - currentTime)
  const progress =
    duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0
  const muted = volume <= 0.001

  return (
    <div
      className={`w-full rounded-[22px] bg-white border border-slate-100/90 shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-5 sm:p-6 space-y-5 ${className}`}
      role="region"
      aria-label={`Audio player for ${currentTrack.title}`}
    >
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={togglePlayPause}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-[0_8px_24px_rgba(249,115,22,0.28)] transition-all hover:scale-[1.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" aria-hidden />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" aria-hidden />
          )}
        </button>
      </div>

      <div className="space-y-2">
        <label className="sr-only" htmlFor="listen-seek">
          Seek
        </label>
        <input
          id="listen-seek"
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={Number.isFinite(currentTime) ? currentTime : 0}
          onChange={(e) => seek(Number(e.target.value))}
          aria-valuemin={0}
          aria-valuemax={Math.round(duration || 0)}
          aria-valuenow={Math.round(currentTime)}
          aria-label="Seek position"
          className="w-full accent-orange-500 h-2 cursor-pointer"
          style={{
            background: `linear-gradient(to right, #f97316 ${progress}%, #e2e8f0 ${progress}%)`,
          }}
        />
        <div className="flex items-center justify-between text-xs font-semibold tabular-nums text-slate-400">
          <span aria-label={`Current time ${formatListenTime(currentTime)}`}>
            {formatListenTime(currentTime)}
          </span>
          <span aria-label={`Remaining ${formatListenTime(remaining)}`}>
            -{formatListenTime(remaining)}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            type="button"
            onClick={() => setVolume(muted ? 0.85 : 0)}
            aria-label={muted ? "Unmute" : "Mute"}
            className="w-9 h-9 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2"
          >
            {muted ? (
              <VolumeX className="w-4 h-4" aria-hidden />
            ) : (
              <Volume2 className="w-4 h-4" aria-hidden />
            )}
          </button>
          <label className="sr-only" htmlFor="listen-volume">
            Volume
          </label>
          <input
            id="listen-volume"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label="Volume"
            className="w-full max-w-[140px] accent-orange-500 cursor-pointer"
          />
        </div>

        <div
          className="flex items-center gap-1.5"
          role="group"
          aria-label="Playback speed"
        >
          {SPEEDS.map((speed) => {
            const active = playbackRate === speed
            return (
              <button
                key={speed}
                type="button"
                onClick={() => setPlaybackRate(speed)}
                aria-pressed={active}
                aria-label={`${speed} times speed`}
                className={`px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 ${
                  active
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {speed}x
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
