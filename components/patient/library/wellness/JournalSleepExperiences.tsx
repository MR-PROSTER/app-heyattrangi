"use client"

import { useEffect, useMemo, useState } from "react"
import type { ExperiencePlayerProps } from "@/lib/data/wellnessExperienceConfig"
import { JOURNAL_PROMPTS, WIND_DOWN_ITEMS } from "@/lib/data/wellnessExperienceConfig"
import ExperienceShell from "./ExperienceShell"
import ExperienceCompletion from "./ExperienceCompletion"
import ExperienceControls from "./ExperienceControls"

function useLocalJournal(key: string) {
  const [text, setText] = useState("")
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key)
      if (saved) setText(saved)
    } catch {
      /* ignore */
    }
  }, [key])

  const save = (value: string) => {
    setText(value)
    try {
      localStorage.setItem(key, value)
    } catch {
      /* ignore */
    }
  }

  return { text, save }
}

export function OpenReflectionExperience(props: ExperiencePlayerProps) {
  const storageKey = `wellness-journal-open-${props.activityId}`
  const { text, save } = useLocalJournal(storageKey)
  const [completed, setCompleted] = useState(false)
  const today = useMemo(
    () => new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }),
    []
  )

  const restart = () => {
    save("")
    setCompleted(false)
  }

  if (completed) {
    return (
      <ExperienceShell title={props.title} color={props.color} progress={100} onExit={props.onExit}>
        <ExperienceCompletion title={props.title} estimatedDuration={props.estimatedDuration} seed={props.activityId} onRestart={restart} onDone={props.onDone} />
      </ExperienceShell>
    )
  }

  return (
    <ExperienceShell
      title={props.title}
      color={props.color}
      progress={Math.min(100, text.length / 4)}
      progressLabel={`${text.length} chars`}
      onExit={props.onExit}
      footer={
        <ExperienceControls
          showPrevious={false}
          showNext
          nextLabel="Finish"
          onNext={() => setCompleted(true)}
          showRestart
          onRestart={restart}
        />
      }
    >
      <div className="text-white py-2">
        <p className="text-white/60 text-xs font-semibold mb-4">{today}</p>
        <h3 className="text-xl font-bold mb-3">Write freely</h3>
        <textarea
          value={text}
          onChange={(e) => save(e.target.value)}
          onBlur={(e) => save(e.target.value)}
          rows={10}
          placeholder="Whatever is on your mind…"
          className="w-full rounded-2xl bg-white/12 border border-white/20 px-4 py-4 text-white placeholder:text-white/35 outline-none focus:ring-2 focus:ring-white/40 resize-none leading-relaxed"
        />
        <p className="text-white/45 text-xs mt-2">Autosaves on this device</p>
      </div>
    </ExperienceShell>
  )
}

export function PromptedReflectionExperience(props: ExperiencePlayerProps) {
  const [promptIndex, setPromptIndex] = useState(() =>
    Math.floor(Math.random() * JOURNAL_PROMPTS.length)
  )
  const storageKey = `wellness-journal-prompt-${props.activityId}-${promptIndex}`
  const { text, save } = useLocalJournal(storageKey)
  const [completed, setCompleted] = useState(false)

  const restart = () => {
    save("")
    setCompleted(false)
    setPromptIndex(Math.floor(Math.random() * JOURNAL_PROMPTS.length))
  }

  if (completed) {
    return (
      <ExperienceShell title={props.title} color={props.color} progress={100} onExit={props.onExit}>
        <ExperienceCompletion title={props.title} estimatedDuration={props.estimatedDuration} seed={props.activityId} onRestart={restart} onDone={props.onDone} />
      </ExperienceShell>
    )
  }

  return (
    <ExperienceShell
      title={props.title}
      color={props.color}
      progress={Math.min(100, text.length / 3)}
      progressLabel={`${text.length} chars`}
      onExit={props.onExit}
      footer={
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              setPromptIndex((i) => (i + 1) % JOURNAL_PROMPTS.length)
            }}
            className="w-full py-3 rounded-full text-sm font-bold text-white/90 bg-white/10 border border-white/20 hover:bg-white/15"
          >
            Next Prompt
          </button>
          <ExperienceControls
            showPrevious={false}
            showNext
            nextLabel="Finish"
            onNext={() => setCompleted(true)}
            showRestart
            onRestart={restart}
          />
        </div>
      }
    >
      <div className="text-white py-2">
        <p className="text-white/60 text-[11px] font-black uppercase tracking-[0.2em] mb-3">Prompt</p>
        <h3 className="text-2xl font-bold leading-snug mb-5">{JOURNAL_PROMPTS[promptIndex]}</h3>
        <textarea
          value={text}
          onChange={(e) => save(e.target.value)}
          onBlur={(e) => save(e.target.value)}
          rows={8}
          placeholder="Your reflection…"
          className="w-full rounded-2xl bg-white/12 border border-white/20 px-4 py-4 text-white placeholder:text-white/35 outline-none focus:ring-2 focus:ring-white/40 resize-none leading-relaxed"
        />
      </div>
    </ExperienceShell>
  )
}

export function WindDownExperience(props: ExperiencePlayerProps) {
  const [done, setDone] = useState<Record<string, boolean>>({})
  const [completed, setCompleted] = useState(false)
  const count = Object.values(done).filter(Boolean).length

  const restart = () => {
    setDone({})
    setCompleted(false)
  }

  if (completed) {
    return (
      <ExperienceShell title={props.title} color={props.color} progress={100} onExit={props.onExit} nightMode>
        <ExperienceCompletion title={props.title} estimatedDuration={props.estimatedDuration} seed={props.activityId} onRestart={restart} onDone={props.onDone} />
      </ExperienceShell>
    )
  }

  return (
    <ExperienceShell
      title={props.title}
      color={props.color}
      progress={(count / WIND_DOWN_ITEMS.length) * 100}
      progressLabel={`${count}/${WIND_DOWN_ITEMS.length}`}
      onExit={props.onExit}
      nightMode
      footer={
        <ExperienceControls
          showPrevious={false}
          showNext
          nextLabel="Finish"
          onNext={() => setCompleted(true)}
          showRestart
          onRestart={restart}
        />
      }
    >
      <div className="space-y-3 py-2">
        <p className="text-center text-indigo-100/70 text-sm mb-4">A gentle night checklist</p>
        {WIND_DOWN_ITEMS.map((item) => {
          const isDone = !!done[item.id]
          return (
            <label
              key={item.id}
              className={`flex items-start gap-3 rounded-2xl border px-4 py-4 cursor-pointer transition-all ${
                isDone ? "bg-white/15 border-indigo-200/30" : "bg-white/8 border-white/10 hover:bg-white/12"
              }`}
            >
              <input
                type="checkbox"
                className="mt-1 w-5 h-5 accent-indigo-200"
                checked={isDone}
                onChange={(e) => setDone((d) => ({ ...d, [item.id]: e.target.checked }))}
              />
              <span>
                <span className="block text-white font-bold mb-0.5">{item.label}</span>
                <span className="text-white/65 text-sm">{item.hint}</span>
              </span>
            </label>
          )
        })}
      </div>
    </ExperienceShell>
  )
}

export function GuidedSleepExperience(props: ExperiencePlayerProps) {
  const [completed, setCompleted] = useState(false)

  const restart = () => setCompleted(false)

  if (completed) {
    return (
      <ExperienceShell title={props.title} color={props.color} progress={100} onExit={props.onExit} nightMode>
        <ExperienceCompletion title={props.title} estimatedDuration={props.estimatedDuration} seed={props.activityId} onRestart={restart} onDone={props.onDone} />
      </ExperienceShell>
    )
  }

  return (
    <ExperienceShell
      title={props.title}
      color={props.color}
      progress={35}
      progressLabel="Rest"
      onExit={props.onExit}
      nightMode
      footer={
        <ExperienceControls
          showPrevious={false}
          showNext
          nextLabel="Finish"
          onNext={() => setCompleted(true)}
          showRestart
          onRestart={restart}
        />
      }
    >
      <div className="text-center text-white py-10">
        <div className="relative mx-auto w-36 h-36 mb-8 rounded-full bg-gradient-to-br from-indigo-300/30 to-violet-500/20 border border-white/20 flex items-center justify-center shadow-[0_0_60px_rgba(129,140,248,0.35)]">
          <div className="absolute inset-3 rounded-full border border-white/10 animate-pulse" />
          <svg className="w-14 h-14 text-white/90" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold mb-3">Guided Sleep Audio</h3>
        <p className="text-indigo-100/75 text-sm leading-relaxed max-w-sm mx-auto mb-6">
          Soft night mode is ready. Recorded audio will live here later — for now, settle in and breathe quietly.
        </p>
        <div className="rounded-2xl bg-white/8 border border-white/10 px-4 py-3 text-sm text-white/60">
          Upcoming audio placeholder · 12 min
        </div>
      </div>
    </ExperienceShell>
  )
}
