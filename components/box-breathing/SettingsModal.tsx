"use client"

import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import VoiceController from "./VoiceController"
import { CYCLE_OPTIONS, DURATION_OPTIONS, type BreathingSettings } from "@/utils/box-breathing/types"

interface SettingsModalProps {
  open: boolean
  onClose: () => void
  settings: BreathingSettings
  onUpdate: (partial: Partial<BreathingSettings>) => void
  locked: boolean
  voice: {
    supported: boolean
    voices: SpeechSynthesisVoice[]
  }
}

export default function SettingsModal({ open, onClose, settings, onUpdate, locked, voice }: SettingsModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Breathing exercise settings"
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-slate-900/95 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-white shadow-2xl sm:max-w-md sm:rounded-3xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-medium">Settings</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close settings"
                className="rounded-full p-2 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <span className="mb-2 block text-sm text-white/80">Breath duration</span>
                <div className="grid grid-cols-4 gap-2">
                  {DURATION_OPTIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      disabled={locked}
                      onClick={() => onUpdate({ phaseDurationSec: d })}
                      className={`rounded-xl border py-2 text-sm transition-colors disabled:opacity-40 ${
                        settings.phaseDurationSec === d
                          ? "border-sky-400 bg-sky-400/20 text-white"
                          : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      {d}s
                    </button>
                  ))}
                </div>
                {locked && <p className="mt-1.5 text-xs text-white/40">Applies to your next session.</p>}
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm text-white/80">Cycles per session — {settings.totalCycles}</span>
                <select
                  value={settings.totalCycles}
                  disabled={locked}
                  onChange={(e) => onUpdate({ totalCycles: Number(e.target.value) })}
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm disabled:opacity-40"
                >
                  {CYCLE_OPTIONS.map((c) => (
                    <option key={c} value={c} className="text-slate-900">
                      {c} cycles
                    </option>
                  ))}
                </select>
              </label>

              <div className="h-px bg-white/10" />

              <VoiceController
                supported={voice.supported}
                voices={voice.voices}
                voiceURI={settings.voiceURI}
                rate={settings.voiceRate}
                volume={settings.voiceVolume}
                enabled={settings.voiceEnabled}
                onChangeVoice={(voiceURI) => onUpdate({ voiceURI })}
                onChangeRate={(voiceRate) => onUpdate({ voiceRate })}
                onChangeVolume={(voiceVolume) => onUpdate({ voiceVolume })}
                onToggleEnabled={(voiceEnabled) => onUpdate({ voiceEnabled })}
              />

              <div className="h-px bg-white/10" />

              <label className="flex items-center justify-between">
                <span className="text-sm text-white/80">Ambient sound</span>
                <input
                  type="checkbox"
                  checked={settings.ambientSoundEnabled}
                  onChange={(e) => onUpdate({ ambientSoundEnabled: e.target.checked })}
                  className="h-5 w-5 accent-sky-400"
                />
              </label>
              {settings.ambientSoundEnabled && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm text-white/80">Ambient volume — {Math.round(settings.ambientVolume * 100)}%</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={settings.ambientVolume}
                    onChange={(e) => onUpdate({ ambientVolume: Number(e.target.value) })}
                    className="accent-sky-400"
                  />
                </label>
              )}

              <div className="h-px bg-white/10" />

              <label className="flex flex-col gap-1.5">
                <span className="text-sm text-white/80">Background motion</span>
                <select
                  value={settings.animationIntensity}
                  onChange={(e) =>
                    onUpdate({ animationIntensity: e.target.value as BreathingSettings["animationIntensity"] })
                  }
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm"
                >
                  <option value="calm" className="text-slate-900">
                    Calm
                  </option>
                  <option value="normal" className="text-slate-900">
                    Normal
                  </option>
                  <option value="lively" className="text-slate-900">
                    Lively
                  </option>
                </select>
                <span className="text-xs text-white/40">Only affects the ambient backdrop — breathing pace stays accurate.</span>
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm text-white/80">Reduced motion</span>
                <input
                  type="checkbox"
                  checked={settings.reducedMotion}
                  onChange={(e) => onUpdate({ reducedMotion: e.target.checked })}
                  className="h-5 w-5 accent-sky-400"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm text-white/80">Vibration feedback</span>
                <input
                  type="checkbox"
                  checked={settings.hapticsEnabled}
                  onChange={(e) => onUpdate({ hapticsEnabled: e.target.checked })}
                  className="h-5 w-5 accent-sky-400"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm text-white/80">Skip introduction next time</span>
                <input
                  type="checkbox"
                  checked={settings.skipIntro}
                  onChange={(e) => onUpdate({ skipIntro: e.target.checked })}
                  className="h-5 w-5 accent-sky-400"
                />
              </label>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
