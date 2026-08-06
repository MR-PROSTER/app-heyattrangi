"use client"

interface VoiceControllerProps {
  supported: boolean
  voices: SpeechSynthesisVoice[]
  voiceURI: string | null
  rate: number
  volume: number
  enabled: boolean
  onChangeVoice: (uri: string | null) => void
  onChangeRate: (rate: number) => void
  onChangeVolume: (volume: number) => void
  onToggleEnabled: (enabled: boolean) => void
}

/** Voice guidance controls: on/off, which system voice, speaking rate, and volume. */
export default function VoiceController({
  supported,
  voices,
  voiceURI,
  rate,
  volume,
  enabled,
  onChangeVoice,
  onChangeRate,
  onChangeVolume,
  onToggleEnabled,
}: VoiceControllerProps) {
  if (!supported) {
    return <p className="text-sm text-white/50">Voice guidance isn&apos;t supported in this browser.</p>
  }

  const englishVoices = voices.filter((v) => v.lang?.startsWith("en"))
  const options = englishVoices.length ? englishVoices : voices

  return (
    <div className="space-y-4">
      <label className="flex items-center justify-between">
        <span className="text-sm text-white/80">Voice guidance</span>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggleEnabled(e.target.checked)}
          className="h-5 w-5 accent-sky-400"
          aria-label="Toggle voice guidance"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-white/80">Voice</span>
        <select
          value={voiceURI ?? ""}
          onChange={(e) => onChangeVoice(e.target.value || null)}
          disabled={!enabled}
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white disabled:opacity-40"
        >
          <option value="" className="text-slate-900">
            Automatic
          </option>
          {options.map((v) => (
            <option key={v.voiceURI} value={v.voiceURI} className="text-slate-900">
              {v.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-white/80">Speed — {rate.toFixed(2)}x</span>
        <input
          type="range"
          min={0.6}
          max={1.3}
          step={0.05}
          value={rate}
          disabled={!enabled}
          onChange={(e) => onChangeRate(Number(e.target.value))}
          className="accent-sky-400"
          aria-label="Voice speed"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-white/80">Volume — {Math.round(volume * 100)}%</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          disabled={!enabled}
          onChange={(e) => onChangeVolume(Number(e.target.value))}
          className="accent-sky-400"
          aria-label="Voice volume"
        />
      </label>
    </div>
  )
}
