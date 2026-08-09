"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  COPING_SUGGESTIONS,
  MOOD_OPTIONS,
  PRESET_TAGS,
  type MoodKey,
} from "@/lib/mood/constants"

// Sub-components
import MoodGauge from "./MoodGauge"
import MoodHistory from "./MoodHistory"

export type MoodEntryRow = {
  id: string
  mood: string
  moodScore: number
  tags: string[]
  note: string | null
  energyLevel: number
  stressLevel: number
  sleepQuality: number
  craving: boolean
  cravingIntensity: number | null
  cravingTrigger: string[]
  timestamp: string
}

type Props = {
  canLog: boolean
  initialEntries: MoodEntryRow[]
  initialStreak: number
  initialTotal: number
}

export default function MoodTrackerClient({
  canLog,
  initialEntries,
  initialStreak,
  initialTotal,
}: Props) {
  const [entries, setEntries] = useState<MoodEntryRow[]>(initialEntries)
  const [streak, setStreak] = useState(initialStreak)
  const [totalCheckIns, setTotalCheckIns] = useState(initialTotal)

  // Navigation View
  const [view, setView] = useState<"track" | "history">("track")

  // Form State
  const [mood, setMood] = useState<MoodKey | null>(null)
  const [moodScore, setMoodScore] = useState(5)
  const [tags, setTags] = useState<string[]>([])
  const [customTagInput, setCustomTagInput] = useState("")
  const [note, setNote] = useState("")
  const [energyLevel, setEnergyLevel] = useState(5)
  const [stressLevel, setStressLevel] = useState(5)
  const [sleepQuality, setSleepQuality] = useState(5)

  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; title: string; body?: string } | null>(null)

  // Guide State (starts automatically as 0 to pop up)
  const [guideIndex, setGuideIndex] = useState<number | null>(0)

  const GUIDE_STEPS = [
    {
      title: "🎭 Select Your Mood",
      description: "Click on one of the emotions on the Mood Gauge, then rate its intensity from 1 to 10 using the buttons below.",
      section: "mood-section"
    },
    {
      title: "📊 Rate Vital Metrics",
      description: "Use the sliders to log your Energy, Stress, and Sleep quality. Keeping these updated helps identify trends over time.",
      section: "metrics-section"
    },
    {
      title: "🏷️ Tag Activities & Triggers",
      description: "Select preset tags or add custom tags to record what you're doing or any triggers affecting your mental state.",
      section: "tags-section"
    },
    {
      title: "✍️ Expression Analysis",
      description: "Write down your thoughts in the journal. You can also use Voice Input for hand-free expression!",
      section: "journal-section"
    }
  ]

  const handleStepChange = (index: number) => {
    setGuideIndex(index)
    const id = GUIDE_STEPS[index].section
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const renderSectionGuide = (stepIdx: number) => {
    if (guideIndex !== stepIdx) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-full mb-6 flex flex-col md:flex-row items-center gap-6 p-6 bg-gradient-to-r from-orange-50/60 to-amber-50/40 rounded-3xl border border-orange-100/40 shadow-sm relative overflow-hidden"
      >
        {/* Gliding Robot */}
        <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
          <motion.img
            layoutId="robot-companion-avatar"
            src="/header2.png"
            alt="Pragya"
            className="object-contain w-full h-full"
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          />
        </div>

        {/* Dialog Content */}
        <div className="flex-1 text-left">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-brand)]">
              Guide Step {stepIdx + 1} of {GUIDE_STEPS.length}
            </span>
            <button
              onClick={() => setGuideIndex(null)}
              className="text-gray-400 hover:text-gray-600 font-bold text-xs font-black uppercase tracking-widest"
            >
              ✕ Dismiss Guide
            </button>
          </div>
          <h4 className="text-sm font-black text-gray-900 mb-1">{GUIDE_STEPS[stepIdx].title}</h4>
          <p className="text-xs text-gray-500 font-medium leading-relaxed mb-4">{GUIDE_STEPS[stepIdx].description}</p>
          
          <div className="flex gap-2">
            <button
              disabled={stepIdx === 0}
              onClick={() => handleStepChange(stepIdx - 1)}
              className="px-4 py-1.5 text-[10px] font-bold border border-gray-200 bg-white rounded-full hover:bg-gray-50 disabled:opacity-30 transition-all active:scale-[0.98]"
            >
              ← Back
            </button>
            <button
              onClick={() => {
                if (stepIdx < GUIDE_STEPS.length - 1) {
                  handleStepChange(stepIdx + 1)
                } else {
                  setGuideIndex(null)
                }
              }}
              className="px-4 py-1.5 text-[10px] font-black bg-[var(--color-brand)] text-white rounded-full shadow-sm transition-all active:scale-[0.98]"
            >
              {stepIdx === GUIDE_STEPS.length - 1 ? "Complete Tour 🎉" : "Next Step →"}
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 5000)
    return () => clearTimeout(t)
  }, [toast])

  const save = async () => {
    if (!mood) {
      setToast({ type: "error", title: "Wait!", body: "Please select your mood first." })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/patient/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood,
          mood_score: moodScore,
          tags,
          note: note.trim() || undefined,
          energy_level: energyLevel,
          stress_level: stressLevel,
          sleep_quality: sleepQuality,
          craving: false,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save")

      setEntries((prev) => [data.entry, ...prev])
      setStreak(data.streak)
      setTotalCheckIns(data.total_check_ins)
      setToast({ type: "success", title: "Mood Logged!", body: "Great job checking in with yourself." })

      // Clear form
      setMood(null)
      setNote("")
      setTags([])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error: any) {
      setToast({ type: "error", title: "Error", body: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  if (!canLog) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-12 text-center">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Access Restricted</h2>
        <p className="mt-2 text-[var(--color-text-secondary)]">Please complete your patient profile to use the Mood Tracker.</p>
        <Link href="/patient/dashboard" className="mt-6 inline-block rounded-lg bg-[var(--color-brand)] px-6 py-2 text-white">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-32 pt-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 rounded-2xl border p-4 shadow-xl backdrop-blur-md ${toast.type === "success" ? "border-green-200 bg-white/90" : "border-red-200 bg-white/90"
              }`}
          >
            <p className="font-bold text-[var(--color-text-primary)]">{toast.title}</p>
            {toast.body && <p className="text-sm text-[var(--color-text-secondary)]">{toast.body}</p>}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-5xl px-4">
        {/* Navigation Tabs */}
        <div className="mb-10 flex items-center justify-between">
          <div className="flex gap-2 bg-white/50 p-1.5 rounded-full border border-white/40">
            <button
              onClick={() => setView("track")}
              className={`rounded-full px-8 py-2 text-sm font-bold transition-all ${view === "track" ? "bg-[var(--color-brand)] text-white shadow-lg" : "text-[var(--color-text-secondary)] hover:bg-white"
                }`}
            >
              Log Mood
            </button>
            <button
              onClick={() => setView("history")}
              className={`rounded-full px-8 py-2 text-sm font-bold transition-all ${view === "history" ? "bg-[var(--color-brand)] text-white shadow-lg" : "text-[var(--color-text-secondary)] hover:bg-white"
                }`}
            >
              History
            </button>
          </div>

          <div className="flex items-center gap-4">
            {guideIndex === null && (
              <button
                onClick={() => handleStepChange(0)}
                className="flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-bold text-[var(--color-brand)] border border-orange-100/60 hover:bg-orange-100/30 transition-colors"
              >
                <img src="/header2.png" alt="Robot" className="w-4 h-4 object-contain" />
                <span>Show Guide</span>
              </button>
            )}
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Daily Streak</span>
              <span className="text-sm font-bold text-[var(--color-brand)]">{streak} Days 🔥</span>
            </div>
          </div>
        </div>

        {view === "history" ? (
          <MoodHistory entries={entries} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-start">

            {/* Step 1 Guide */}
            {renderSectionGuide(0)}

            <section id="mood-section" className="col-span-full md:col-span-4 rounded-[2.5rem] bg-white p-10 border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow scroll-mt-24">
              <MoodGauge
                selectedMood={mood}
                onSelect={(m) => {
                  setMood(m)
                  const def = MOOD_OPTIONS.find((o) => o.key === m)?.defaultScore || 5
                  setMoodScore(def)
                }}
              />
              <div className="mt-12 pt-8 border-t border-dashed border-[var(--color-border)]">
                <h3 className="mb-4 text-center font-bold text-xs uppercase tracking-widest text-[var(--color-text-muted)]">Mood Intensity</h3>
                <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => setMoodScore(num)}
                      className={`h-10 flex items-center justify-center rounded-xl border font-bold text-sm transition-all ${moodScore === num
                        ? "bg-[var(--color-brand)] text-white border-[var(--color-brand)] shadow-md"
                        : "bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-brand)]"
                        }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* 3. Quote / Streak Box - Small (Col Span 2) */}
            <div className="col-span-full md:col-span-2 flex flex-col gap-6 h-full">
              <div className="flex-1 rounded-[2.5rem] bg-[var(--color-brand-light)]/30 p-8 flex flex-col items-center justify-center text-center border border-orange-100 border-dashed">
                <span className="text-4xl mb-4">✨</span>
                <p className="text-sm font-medium text-[var(--color-brand-dark)]">"You don't have to be positive all the time. It's okay to feel however you feel."</p>
              </div>
            </div>

            {/* Step 2 Guide */}
            {renderSectionGuide(1)}

            {/* 4. Metrics Grid - Medium (Col Span 3) */}
            <section id="metrics-section" className="col-span-full md:col-span-3 rounded-[2.5rem] bg-white p-8 border border-[var(--color-border)] shadow-sm flex flex-col gap-6 scroll-mt-24">
              <h3 className="text-lg font-bold">Vital Metrics</h3>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">Energy</p>
                    <span className="text-xs font-bold text-[var(--color-brand)]">{energyLevel}/10</span>
                  </div>
                  <input
                    type="range" min="1" max="10" value={energyLevel}
                    onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                    className="w-full accent-[var(--color-brand)] h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">Stress</p>
                    <span className="text-xs font-bold text-red-500">{stressLevel}/10</span>
                  </div>
                  <input
                    type="range" min="1" max="10" value={stressLevel}
                    onChange={(e) => setStressLevel(parseInt(e.target.value))}
                    className="w-full accent-red-400 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">Sleep</p>
                    <span className="text-xs font-bold text-blue-500">{sleepQuality}/10</span>
                  </div>
                  <input
                    type="range" min="1" max="10" value={sleepQuality}
                    onChange={(e) => setSleepQuality(parseInt(e.target.value))}
                    className="w-full accent-blue-400 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </section>

            {/* Step 3 Guide */}
            {renderSectionGuide(2)}

            {/* 5. Tags Selection - Medium (Col Span 3) */}
            <section id="tags-section" className="col-span-full md:col-span-3 rounded-[2.5rem] bg-white p-8 border border-[var(--color-border)] shadow-sm flex flex-col h-full scroll-mt-24">
              <h3 className="mb-4 text-lg font-bold">What's happening?</h3>
              <div className="flex flex-wrap gap-2 mb-auto">
                {PRESET_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                    className={`rounded-full border px-4 py-2 text-xs font-bold transition-all ${tags.includes(tag)
                      ? "border-[var(--color-brand)] bg-orange-50 text-[var(--color-brand)]"
                      : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-orange-200"
                      }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex gap-2">
                <input
                  type="text"
                  placeholder="Custom..."
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  className="auth-form-control rounded-2xl h-10 text-sm"
                />
                <button
                  onClick={() => {
                    if (customTagInput.trim()) {
                      setTags([...tags, customTagInput.trim()])
                      setCustomTagInput("")
                    }
                  }}
                  className="rounded-2xl border border-[var(--color-brand)] px-4 font-bold text-xs text-[var(--color-brand)]"
                >
                  Add
                </button>
              </div>
            </section>

            {/* Step 4 Guide */}
            {renderSectionGuide(3)}

            {/* 6. Expression Analysis (Notes) - Full Width */}
            <section id="journal-section" className="col-span-full rounded-[2.5rem] bg-white p-8 border border-[var(--color-border)] shadow-sm scroll-mt-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Expression Analysis</h3>
                <button className="flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-bold text-[var(--color-brand)]">
                  <span>🎤</span> Voice Input
                </button>
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write down your thoughts... Speak from the heart."
                className="auth-form-control min-h-[200px] rounded-[2rem] p-8 text-lg border-dashed border-2 w-full resize-none focus:border-[var(--color-brand)] outline-none"
              />
            </section>

            {/* 7. Save Button Area */}
            <div className="col-span-full pt-4 pb-10">
              <button
                onClick={save}
                disabled={submitting}
                className="w-full rounded-[2rem] bg-[var(--color-text-primary)] py-5 text-xl font-bold text-white shadow-2xl hover:scale-[1.01] transition-transform disabled:opacity-50"
              >
                {submitting ? "Saving Check-in..." : "Save Log →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
