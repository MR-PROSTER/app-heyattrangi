"use client"

import { useEffect, useMemo, useState } from "react"
import type { ExperiencePlayerProps } from "@/lib/data/wellnessExperienceConfig"
import { BREATH_PATTERNS } from "@/lib/data/wellnessExperienceConfig"
import BreathingCircleExperience from "./BreathingCircleExperience"
import ExperienceShell from "./ExperienceShell"
import ExperienceCompletion from "./ExperienceCompletion"
import ExperienceControls from "./ExperienceControls"

/** Physiological sigh: three manual/guided stages with lung animation */
export function PhysiologicalSighExperience(props: ExperiencePlayerProps) {
  const stages = [
    { label: "Small inhale", hint: "Take a gentle first breath in through your nose.", scale: 1.05 },
    { label: "Second inhale", hint: "Add a short top-up inhale.", scale: 1.2 },
    { label: "Long exhale", hint: "Release slowly through your mouth.", scale: 0.75 },
  ]
  const [step, setStep] = useState(0)
  const [reps, setReps] = useState(1)
  const [completed, setCompleted] = useState(false)
  const maxReps = 3

  const restart = () => {
    setStep(0)
    setReps(1)
    setCompleted(false)
  }

  const next = () => {
    if (step < stages.length - 1) {
      setStep((s) => s + 1)
      return
    }
    if (reps >= maxReps) {
      setCompleted(true)
      return
    }
    setReps((r) => r + 1)
    setStep(0)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") props.onExit()
      if (completed) return
      if (e.key === "Enter" || e.key === "ArrowRight") {
        e.preventDefault()
        if (step < stages.length - 1) setStep((s) => s + 1)
        else if (reps >= maxReps) setCompleted(true)
        else {
          setReps((r) => r + 1)
          setStep(0)
        }
      }
      if (e.key === "ArrowLeft" && step > 0) setStep((s) => s - 1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [completed, step, reps, props])

  if (completed) {
    return (
      <ExperienceShell title={props.title} color={props.color} progress={100} onExit={props.onExit}>
        <ExperienceCompletion
          title={props.title}
          estimatedDuration={props.estimatedDuration}
          seed={props.activityId}
          onRestart={restart}
          onDone={props.onDone}
        />
      </ExperienceShell>
    )
  }

  const stage = stages[step]
  const progress = ((reps - 1) * stages.length + step + 1) / (maxReps * stages.length) * 100

  return (
    <ExperienceShell
      title={props.title}
      color={props.color}
      progress={progress}
      progressLabel={`${reps}/${maxReps}`}
      onExit={props.onExit}
      footer={
        <ExperienceControls
          onPrevious={() => setStep((s) => Math.max(0, s - 1))}
          previousDisabled={step === 0}
          onNext={next}
          nextLabel={step === stages.length - 1 && reps >= maxReps ? "Finish" : "Next"}
          showRestart
          onRestart={restart}
        />
      }
    >
      <div className="text-center text-white py-6">
        <p className="text-white/60 text-[11px] font-black uppercase tracking-[0.2em] mb-6">{stage.label}</p>
        <div className="relative mx-auto w-48 h-40 flex items-end justify-center gap-4 mb-8">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="w-16 rounded-t-full bg-gradient-to-t from-cyan-200/20 to-white/50 border border-white/30 transition-all duration-700 ease-in-out"
              style={{ height: 70 * stage.scale * (i === 0 ? 1 : 0.85) }}
            />
          ))}
        </div>
        <p className="text-xl font-semibold leading-snug max-w-sm mx-auto">{stage.hint}</p>
        <p className="text-white/50 text-sm mt-6">Round {reps} of {maxReps}</p>
      </div>
    </ExperienceShell>
  )
}

export function BoxBreathingExperience(props: ExperiencePlayerProps) {
  return (
    <BreathingCircleExperience
      {...props}
      pattern={BREATH_PATTERNS["box-breathing"]}
      variant="circle"
    />
  )
}

export function Breathing478Experience(props: ExperiencePlayerProps) {
  return (
    <BreathingCircleExperience
      {...props}
      pattern={BREATH_PATTERNS["breathing-4-7-8"]}
      variant="circle"
    />
  )
}

export function BellyBreathingExperience(props: ExperiencePlayerProps) {
  const pattern = useMemo(
    () => ({
      inhale: 4,
      hold1: 1,
      exhale: 4,
      hold2: 1,
      cycles: 5,
      labels: { inhale: "Belly rises", hold1: "Soft hold", exhale: "Belly falls", hold2: "Rest" },
    }),
    []
  )
  return <BreathingCircleExperience {...props} pattern={pattern} variant="belly" />
}
