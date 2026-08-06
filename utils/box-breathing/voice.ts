export interface VoiceOptions {
  voice?: SpeechSynthesisVoice | null
  rate?: number
  volume?: number
  pitch?: number
}

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window
}

/** Resolves once the browser's voice list is populated (it loads async in most browsers). */
export function getVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!isSpeechSupported()) return Promise.resolve([])
  const synth = window.speechSynthesis
  const existing = synth.getVoices()
  if (existing.length) return Promise.resolve(existing)

  return new Promise((resolve) => {
    let settled = false
    const finish = (voices: SpeechSynthesisVoice[]) => {
      if (settled) return
      settled = true
      synth.removeEventListener("voiceschanged", handle)
      resolve(voices)
    }
    const handle = () => finish(synth.getVoices())
    synth.addEventListener("voiceschanged", handle)
    // Some browsers never fire voiceschanged if voices load synchronously elsewhere.
    setTimeout(() => finish(synth.getVoices()), 1500)
  })
}

export function speak(text: string, options: VoiceOptions = {}): void {
  if (!isSpeechSupported() || !text) return
  const utterance = new SpeechSynthesisUtterance(text)
  if (options.voice) utterance.voice = options.voice
  utterance.rate = options.rate ?? 0.95
  utterance.volume = options.volume ?? 1
  utterance.pitch = options.pitch ?? 1
  window.speechSynthesis.speak(utterance)
}

export function cancelSpeech(): void {
  if (!isSpeechSupported()) return
  window.speechSynthesis.cancel()
}

const PREFERRED_VOICE_NAMES = [
  "Samantha",
  "Google UK English Female",
  "Google US English",
  "Karen",
  "Moira",
  "Serena",
]

export function pickDefaultVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null
  for (const name of PREFERRED_VOICE_NAMES) {
    const match = voices.find((v) => v.name === name)
    if (match) return match
  }
  const softEnglish = voices.find((v) => v.lang?.startsWith("en") && /female/i.test(v.name))
  if (softEnglish) return softEnglish
  const anyEnglish = voices.find((v) => v.lang?.startsWith("en"))
  return anyEnglish ?? voices[0]
}
