"use client"

import { useCallback, useEffect, useState } from "react"
import { cancelSpeech, getVoices, isSpeechSupported, pickDefaultVoice, speak } from "@/utils/box-breathing/voice"

interface UseSpeechGuideArgs {
  enabled: boolean
  voiceURI: string | null
  rate: number
  volume: number
}

/** Thin reactive wrapper around the browser SpeechSynthesis API. */
export function useSpeechGuide({ enabled, voiceURI, rate, volume }: UseSpeechGuideArgs) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    setSupported(isSpeechSupported())
    let cancelled = false
    getVoices().then((v) => {
      if (!cancelled) setVoices(v)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const selectedVoice = voices.find((v) => v.voiceURI === voiceURI) ?? pickDefaultVoice(voices)

  const say = useCallback(
    (text: string) => {
      if (!enabled || !supported) return
      speak(text, { voice: selectedVoice, rate, volume })
    },
    [enabled, supported, selectedVoice, rate, volume]
  )

  const stop = useCallback(() => {
    cancelSpeech()
  }, [])

  // Silence any in-flight utterance on unmount.
  useEffect(() => stop, [stop])

  return { say, stop, voices, selectedVoice, supported }
}
