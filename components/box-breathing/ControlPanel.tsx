"use client"

import { Pause, Play, RotateCcw, Settings as SettingsIcon, Volume2, VolumeX } from "lucide-react"
import type { ReactNode } from "react"

interface ControlPanelProps {
  isRunning: boolean
  isMuted: boolean
  onTogglePlay: () => void
  onRestart: () => void
  onToggleMute: () => void
  onOpenSettings: () => void
  onExit: () => void
}

export default function ControlPanel({
  isRunning,
  isMuted,
  onTogglePlay,
  onRestart,
  onToggleMute,
  onOpenSettings,
  onExit,
}: ControlPanelProps) {
  return (
    <div
      className="flex items-center justify-center gap-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:gap-6"
      role="group"
      aria-label="Breathing session controls"
    >
      <ControlButton label="Settings" onClick={onOpenSettings}>
        <SettingsIcon className="h-5 w-5" />
      </ControlButton>
      <ControlButton label={isMuted ? "Unmute voice guidance" : "Mute voice guidance"} onClick={onToggleMute}>
        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </ControlButton>
      <ControlButton label={isRunning ? "Pause" : "Resume"} onClick={onTogglePlay} primary>
        {isRunning ? <Pause className="h-6 w-6" /> : <Play className="ml-0.5 h-6 w-6" />}
      </ControlButton>
      <ControlButton label="Restart" onClick={onRestart}>
        <RotateCcw className="h-5 w-5" />
      </ControlButton>
      <ControlButton label="Exit exercise" onClick={onExit}>
        <span className="text-xs font-medium">Exit</span>
      </ControlButton>
    </div>
  )
}

function ControlButton({
  children,
  label,
  onClick,
  primary = false,
}: {
  children: ReactNode
  label: string
  onClick: () => void
  primary?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={
        primary
          ? "flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg shadow-black/20 transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          : "flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-transform hover:bg-white/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
      }
    >
      {children}
    </button>
  )
}
