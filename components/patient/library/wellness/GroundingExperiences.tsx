"use client"

import { useEffect, useMemo, useState } from "react"
import type { ExperiencePlayerProps } from "@/lib/data/wellnessExperienceConfig"
import {
  CATEGORY_NAMING_CHALLENGES,
  OBJECT_FOCUS_PROMPTS,
} from "@/lib/data/wellnessExperienceConfig"
import ExperienceShell from "./ExperienceShell"
import ExperienceCompletion from "./ExperienceCompletion"
import ExperienceControls from "./ExperienceControls"

export function CategoryNamingExperience(props: ExperiencePlayerProps) {
  const challenge = useMemo(
    () => CATEGORY_NAMING_CHALLENGES[Math.floor(Math.random() * CATEGORY_NAMING_CHALLENGES.length)],
    []
  )
  const [items, setItems] = useState<string[]>([])
  const [draft, setDraft] = useState("")
  const [completed, setCompleted] = useState(false)

  const restart = () => {
    setItems([])
    setDraft("")
    setCompleted(false)
  }

  const addItem = () => {
    const value = draft.trim()
    if (!value) return
    if (items.some((i) => i.toLowerCase() === value.toLowerCase())) {
      setDraft("")
      return
    }
    const next = [...items, value]
    setItems(next)
    setDraft("")
    if (next.length >= challenge.goal) setCompleted(true)
  }

  if (completed) {
    return (
      <ExperienceShell title={props.title} color={props.color} progress={100} onExit={props.onExit}>
        <ExperienceCompletion title={props.title} estimatedDuration={props.estimatedDuration} seed={props.activityId} onRestart={restart} onDone={props.onDone} />
      </ExperienceShell>
    )
  }

  const progress = (items.length / challenge.goal) * 100

  return (
    <ExperienceShell
      title={props.title}
      color={props.color}
      progress={progress}
      progressLabel={`${items.length}/${challenge.goal}`}
      onExit={props.onExit}
      footer={
        <ExperienceControls
          showPrevious={false}
          showNext
          nextLabel={items.length >= challenge.goal ? "Finish" : "I'm done"}
          onNext={() => setCompleted(true)}
          showRestart
          onRestart={restart}
        />
      }
    >
      <div className="text-white py-2">
        <h3 className="text-center text-2xl font-bold mb-2">Name {challenge.goal} {challenge.label}</h3>
        <p className="text-center text-white/60 text-sm mb-6">Timer-free — go at your own pace</p>
        <form
          className="flex gap-2 mb-5"
          onSubmit={(e) => {
            e.preventDefault()
            addItem()
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={challenge.placeholder}
            className="flex-1 rounded-full px-4 py-3 bg-white/15 border border-white/20 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-white/40"
            aria-label={`Add a ${challenge.label.slice(0, -1).toLowerCase()}`}
          />
          <button type="submit" className="px-5 rounded-full bg-white text-slate-800 font-bold text-sm">
            Add
          </button>
        </form>
        <ul className="flex flex-wrap gap-2">
          {items.map((item) => (
            <li key={item} className="px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-sm font-medium">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </ExperienceShell>
  )
}

export function ObjectFocusExperience(props: ExperiencePlayerProps) {
  const [step, setStep] = useState(0)
  const [notes, setNotes] = useState<Record<number, string>>({})
  const [completed, setCompleted] = useState(false)
  const prompt = OBJECT_FOCUS_PROMPTS[step]

  const restart = () => {
    setStep(0)
    setNotes({})
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
      progress={((step + 1) / OBJECT_FOCUS_PROMPTS.length) * 100}
      progressLabel={`${step + 1}/${OBJECT_FOCUS_PROMPTS.length}`}
      onExit={props.onExit}
      footer={
        <ExperienceControls
          onPrevious={() => setStep((s) => Math.max(0, s - 1))}
          previousDisabled={step === 0}
          onNext={() => {
            if (step >= OBJECT_FOCUS_PROMPTS.length - 1) setCompleted(true)
            else setStep((s) => s + 1)
          }}
          nextLabel={step >= OBJECT_FOCUS_PROMPTS.length - 1 ? "Finish" : "Next"}
          showRestart
          onRestart={restart}
        />
      }
    >
      <div className="text-white py-4">
        <p className="text-center text-white/60 text-[11px] font-black uppercase tracking-[0.2em] mb-3">
          Observe nearby
        </p>
        <h3 className="text-center text-2xl font-bold mb-6">{prompt}</h3>
        <textarea
          value={notes[step] ?? ""}
          onChange={(e) => setNotes((n) => ({ ...n, [step]: e.target.value }))}
          rows={5}
          placeholder="Write what you notice…"
          className="w-full rounded-2xl bg-white/15 border border-white/20 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-white/40 resize-none"
        />
      </div>
    </ExperienceShell>
  )
}
