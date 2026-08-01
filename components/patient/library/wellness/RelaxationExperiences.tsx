"use client"

import { useState } from "react"
import type { ExperiencePlayerProps } from "@/lib/data/wellnessExperienceConfig"
import {
  BODY_SCAN_REGIONS,
  MICRO_MOVEMENTS,
  PMR_MUSCLE_GROUPS,
} from "@/lib/data/wellnessExperienceConfig"
import ExperienceShell from "./ExperienceShell"
import ExperienceCompletion from "./ExperienceCompletion"
import ExperienceControls from "./ExperienceControls"

const BODY_HIGHLIGHT: Record<string, string> = {
  head: "top-[8%] left-1/2 -translate-x-1/2 w-10 h-10",
  face: "top-[12%] left-1/2 -translate-x-1/2 w-10 h-8",
  shoulders: "top-[22%] left-1/2 -translate-x-1/2 w-28 h-4",
  chest: "top-[30%] left-1/2 -translate-x-1/2 w-16 h-14",
  arms: "top-[28%] left-1/2 -translate-x-1/2 w-36 h-8",
  hands: "top-[48%] left-1/2 -translate-x-1/2 w-28 h-4",
  thighs: "top-[52%] left-1/2 -translate-x-1/2 w-16 h-16",
  calves: "top-[68%] left-1/2 -translate-x-1/2 w-12 h-14",
  legs: "top-[55%] left-1/2 -translate-x-1/2 w-16 h-24",
  feet: "top-[86%] left-1/2 -translate-x-1/2 w-16 h-4",
}

function BodySilhouette({ activeId }: { activeId: string }) {
  return (
    <div className="relative mx-auto w-40 h-64 mb-6" aria-hidden>
      <div className="absolute inset-x-12 top-2 bottom-2 rounded-[40px] bg-white/10 border border-white/20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white/15 border border-white/25" />
      <div
        className={`absolute rounded-full bg-white/50 shadow-[0_0_24px_rgba(255,255,255,0.55)] transition-all duration-500 ${
          BODY_HIGHLIGHT[activeId] ?? BODY_HIGHLIGHT.chest
        }`}
      />
    </div>
  )
}

export function ProgressiveMuscleExperience(props: ExperiencePlayerProps) {
  const [step, setStep] = useState(0)
  const [completed, setCompleted] = useState(false)
  const group = PMR_MUSCLE_GROUPS[step]

  const restart = () => {
    setStep(0)
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
      progress={((step + 1) / PMR_MUSCLE_GROUPS.length) * 100}
      progressLabel={`${step + 1}/${PMR_MUSCLE_GROUPS.length}`}
      onExit={props.onExit}
      footer={
        <ExperienceControls
          onPrevious={() => setStep((s) => Math.max(0, s - 1))}
          previousDisabled={step === 0}
          onNext={() => {
            if (step >= PMR_MUSCLE_GROUPS.length - 1) setCompleted(true)
            else setStep((s) => s + 1)
          }}
          nextLabel={step >= PMR_MUSCLE_GROUPS.length - 1 ? "Finish" : "Done"}
          showRestart
          onRestart={restart}
        />
      }
    >
      <div className="text-white text-center py-2">
        <BodySilhouette activeId={group.id} />
        <h3 className="text-2xl font-bold mb-2">{group.label}</h3>
        <p className="text-white/75 text-sm leading-relaxed max-w-sm mx-auto">{group.hint}</p>
        <p className="text-white/45 text-xs mt-4">Press Done when you’ve tensed and released</p>
      </div>
    </ExperienceShell>
  )
}

export function BodyScanExperience(props: ExperiencePlayerProps) {
  const [step, setStep] = useState(0)
  const [completed, setCompleted] = useState(false)
  const region = BODY_SCAN_REGIONS[step]

  const restart = () => {
    setStep(0)
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
      progress={((step + 1) / BODY_SCAN_REGIONS.length) * 100}
      progressLabel={`${step + 1}/${BODY_SCAN_REGIONS.length}`}
      onExit={props.onExit}
      footer={
        <ExperienceControls
          onPrevious={() => setStep((s) => Math.max(0, s - 1))}
          previousDisabled={step === 0}
          onNext={() => {
            if (step >= BODY_SCAN_REGIONS.length - 1) setCompleted(true)
            else setStep((s) => s + 1)
          }}
          nextLabel={step >= BODY_SCAN_REGIONS.length - 1 ? "Finish" : "Next"}
          showRestart
          onRestart={restart}
        />
      }
    >
      <div className="text-white text-center py-2">
        <BodySilhouette activeId={region.id} />
        <p className="text-white/60 text-[11px] font-black uppercase tracking-[0.2em] mb-2">Attention here</p>
        <h3 className="text-2xl font-bold mb-2">{region.label}</h3>
        <p className="text-white/75 text-sm leading-relaxed max-w-sm mx-auto">{region.hint}</p>
      </div>
    </ExperienceShell>
  )
}

export function MicroMovementExperience(props: ExperiencePlayerProps) {
  const [done, setDone] = useState<Record<string, boolean>>({})
  const [completed, setCompleted] = useState(false)
  const finishedCount = Object.values(done).filter(Boolean).length
  const progress = (finishedCount / MICRO_MOVEMENTS.length) * 100

  const restart = () => {
    setDone({})
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
      progress={progress}
      progressLabel={`${finishedCount}/${MICRO_MOVEMENTS.length}`}
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
      <div className="space-y-3 py-2">
        {MICRO_MOVEMENTS.map((move) => {
          const isDone = !!done[move.id]
          return (
            <div
              key={move.id}
              className={`rounded-2xl border px-4 py-4 transition-all ${
                isDone ? "bg-white/20 border-white/35" : "bg-white/10 border-white/15"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-white font-bold mb-1">{move.label}</h4>
                  <p className="text-white/70 text-sm">{move.hint}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDone((d) => ({ ...d, [move.id]: !d[move.id] }))}
                  className={`shrink-0 px-3 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${
                    isDone
                      ? "bg-white text-slate-800"
                      : "bg-white/15 text-white border border-white/25 hover:bg-white/25"
                  }`}
                >
                  {isDone ? "Done" : "Complete"}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </ExperienceShell>
  )
}
