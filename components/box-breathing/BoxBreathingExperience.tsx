"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"

import AmbientBackground from "./AmbientBackground"
import BreathingSquare from "./BreathingSquare"
import ParticleField from "./ParticleField"
import ProgressRing from "./ProgressRing"
import InstructionText from "./InstructionText"
import Countdown from "./Countdown"
import ControlPanel from "./ControlPanel"
import SettingsModal from "./SettingsModal"
import CompletionScreen from "./CompletionScreen"
import IntroCard from "./IntroCard"

import { useBreathingSettings } from "@/hooks/box-breathing/useBreathingSettings"
import { useSpeechGuide } from "@/hooks/box-breathing/useSpeechGuide"
import { useBoxBreathing } from "@/hooks/box-breathing/useBoxBreathing"
import { useCountdown } from "@/hooks/box-breathing/useCountdown"
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion"
import { PHASE_META } from "@/utils/box-breathing/breathingEngine"

type AppState = "intro" | "countdown" | "session" | "completed"

interface CompletionStats {
  cycles: number
  activeMs: number
  sessionMs: number
}

export default function BoxBreathingExperience() {
  const router = useRouter()
  const systemReducedMotion = usePrefersReducedMotion()
  const { settings, updateSettings, hydrated } = useBreathingSettings()
  const reducedMotion = systemReducedMotion || settings.reducedMotion

  const [appState, setAppState] = useState<AppState>("intro")
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null)
  const [completionStats, setCompletionStats] = useState<CompletionStats | null>(null)

  const speech = useSpeechGuide({
    enabled: settings.voiceEnabled,
    voiceURI: settings.voiceURI,
    rate: settings.voiceRate,
    volume: settings.voiceVolume,
  })

  const breathing = useBoxBreathing({
    settings,
    onSpeak: speech.say,
    onStopSpeech: speech.stop,
  })

  // Immediately silence any in-flight utterance the moment voice guidance is muted.
  const prevVoiceEnabledRef = useRef(settings.voiceEnabled)
  useEffect(() => {
    if (prevVoiceEnabledRef.current && !settings.voiceEnabled) {
      speech.stop()
    }
    prevVoiceEnabledRef.current = settings.voiceEnabled
  }, [settings.voiceEnabled, speech])

  const previousStatusRef = useRef(breathing.snapshot.status)
  useEffect(() => {
    const prev = previousStatusRef.current
    const current = breathing.snapshot.status
    if (prev !== "completed" && current === "completed" && sessionStartedAt) {
      setCompletionStats({
        cycles: settings.totalCycles,
        activeMs: breathing.snapshot.activeElapsedMs,
        sessionMs: Date.now() - sessionStartedAt,
      })
      setAppState("completed")
    }
    previousStatusRef.current = current
  }, [breathing.snapshot.status, breathing.snapshot.activeElapsedMs, sessionStartedAt, settings.totalCycles])

  const countdown = useCountdown({
    seconds: 3,
    onComplete: () => {
      speech.say("Let's begin.")
      setSessionStartedAt(Date.now())
      breathing.start()
      setAppState("session")
    },
  })

  const beginCountdown = useCallback(() => {
    setCompletionStats(null)
    setAppState("countdown")
    countdown.start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRestart = useCallback(() => {
    setSessionStartedAt(Date.now())
    breathing.restart()
  }, [breathing])

  const handleExit = useCallback(() => {
    speech.stop()
    router.push("/patient/dashboard")
  }, [router, speech])

  const handleDone = useCallback(() => {
    speech.stop()
    setCompletionStats(null)
    setAppState("intro")
  }, [speech])

  const handleToggleMute = useCallback(() => {
    updateSettings({ voiceEnabled: !settings.voiceEnabled })
  }, [settings.voiceEnabled, updateSettings])

  const handleTogglePlay = useCallback(() => {
    if (breathing.snapshot.status === "running") {
      breathing.pause()
    } else if (breathing.snapshot.status === "paused") {
      breathing.resume()
    }
  }, [breathing])

  // Keyboard accessibility: Space = pause/resume, Enter = start, Escape = close settings or exit.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target
      if (target instanceof HTMLElement && ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName)) {
        return
      }
      if (e.code === "Space") {
        e.preventDefault()
        if (appState === "session") handleTogglePlay()
      } else if (e.code === "Enter") {
        if (appState === "intro") beginCountdown()
      } else if (e.code === "Escape") {
        if (settingsOpen) {
          setSettingsOpen(false)
        } else {
          handleExit()
        }
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [appState, settingsOpen, beginCountdown, handleExit, handleTogglePlay])

  // Optional ambient nature-sound bed, synced to session playback state.
  const audioRef = useRef<HTMLAudioElement | null>(null)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = settings.ambientVolume
    const shouldPlay = settings.ambientSoundEnabled && appState === "session" && breathing.snapshot.status === "running"
    if (shouldPlay) {
      audio.play().catch(() => {
        // Autoplay can be blocked until further user interaction — safe to ignore.
      })
    } else {
      audio.pause()
    }
  }, [settings.ambientSoundEnabled, settings.ambientVolume, appState, breathing.snapshot.status])

  const squareBoxStyle = useMemo(() => ({ width: "min(64vmin, 420px)", height: "min(64vmin, 420px)" }), [])

  const srAnnouncement =
    appState === "session" && breathing.snapshot.status === "running"
      ? `${PHASE_META[breathing.snapshot.phase].ariaLabel}. Cycle ${breathing.snapshot.cycle} of ${breathing.snapshot.totalCycles}.`
      : appState === "countdown"
        ? countdown.count > 0
          ? `Starting in ${countdown.count}`
          : "Begin"
        : ""

  if (!hydrated) {
    return <div className="fixed inset-0 -z-10 bg-[#070b16]" />
  }

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden text-white">
      <AmbientBackground
        phase={breathing.snapshot.phase}
        phaseDurationSec={settings.phaseDurationSec}
        reducedMotion={reducedMotion}
        intensity={settings.animationIntensity}
      />

      <audio ref={audioRef} src="/audio/calm-placeholder.wav" loop preload="none" className="hidden" />

      <div className="sr-only" role="status" aria-live="assertive">
        {srAnnouncement}
      </div>

      <header className="flex items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8">
        <button
          type="button"
          onClick={handleExit}
          aria-label="Exit breathing exercise"
          className="rounded-full px-3 py-2 text-sm text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          Close
        </button>
        {appState === "session" && (
          <span className="text-sm font-medium tracking-wide text-white/70">
            Cycle {breathing.snapshot.cycle} / {breathing.snapshot.totalCycles}
          </span>
        )}
        <span className="w-12" aria-hidden />
      </header>

      <main className="relative flex flex-1 flex-col items-center justify-center gap-8 px-6 py-8">
        <AnimatePresence mode="wait">
          {appState === "intro" && (
            <motion.div key="intro" exit={{ opacity: 0 }}>
              <IntroCard compact={settings.skipIntro} onStart={beginCountdown} />
            </motion.div>
          )}

          {appState === "countdown" && (
            <motion.div key="countdown" exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
              <Countdown value={countdown.count > 0 ? countdown.count : "Begin"} size="lg" reducedMotion={reducedMotion} />
              <p className="text-white/60">Get comfortable and relax your shoulders.</p>
            </motion.div>
          )}

          {appState === "session" && (
            <motion.div
              key="session"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-8"
            >
              <div className="relative flex items-center justify-center" style={squareBoxStyle}>
                <ProgressRing
                  phase={breathing.snapshot.phase}
                  phaseDurationSec={settings.phaseDurationSec}
                  cycle={breathing.snapshot.cycle}
                  totalCycles={breathing.snapshot.totalCycles}
                  reducedMotion={reducedMotion}
                />
                <ParticleField
                  phase={breathing.snapshot.phase}
                  phaseDurationSec={settings.phaseDurationSec}
                  reducedMotion={reducedMotion}
                />
                <BreathingSquare
                  phase={breathing.snapshot.phase}
                  phaseDurationSec={settings.phaseDurationSec}
                  reducedMotion={reducedMotion}
                />
              </div>

              <div className="flex flex-col items-center gap-3">
                <InstructionText phase={breathing.snapshot.phase} reducedMotion={reducedMotion} />
                <Countdown value={breathing.snapshot.secondsRemaining} reducedMotion={reducedMotion} />
              </div>

              <AnimatePresence>
                {breathing.snapshot.status === "paused" && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-white/60"
                  >
                    Paused — take your time.
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {appState === "completed" && completionStats && (
            <motion.div key="completed" exit={{ opacity: 0 }}>
              <CompletionScreen
                cyclesCompleted={completionStats.cycles}
                activeMs={completionStats.activeMs}
                sessionMs={completionStats.sessionMs}
                reducedMotion={reducedMotion}
                onRepeat={beginCountdown}
                onDone={handleDone}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {appState === "session" && (
        <ControlPanel
          isRunning={breathing.snapshot.status === "running"}
          isMuted={!settings.voiceEnabled}
          onTogglePlay={handleTogglePlay}
          onRestart={handleRestart}
          onToggleMute={handleToggleMute}
          onOpenSettings={() => setSettingsOpen(true)}
          onExit={handleExit}
        />
      )}

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdate={updateSettings}
        locked={breathing.snapshot.status === "running" || breathing.snapshot.status === "paused"}
        voice={{ supported: speech.supported, voices: speech.voices }}
      />
    </div>
  )
}
