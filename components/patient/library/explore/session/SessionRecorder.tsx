"use client"

import { useCallback, useEffect, useState, type ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"
import type { ExploreActivity } from "@/data/exploreActivities"
import {
  createInitialSessionState,
  type SessionPhase,
  type SessionState,
} from "@/components/patient/library/explore/session/SessionState"
import { useSessionTimer } from "@/components/patient/library/explore/session/useSessionTimer"
import RecorderHeader from "@/components/patient/library/explore/session/RecorderHeader"
import RecorderBody from "@/components/patient/library/explore/session/RecorderBody"
import RecorderControls from "@/components/patient/library/explore/session/RecorderControls"
import ActivityRenderer from "@/components/patient/library/explore/engines/ActivityRenderer"

export type { SessionState, SessionPhase }

interface SessionRecorderProps {
  activity: ExploreActivity
  onExit: () => void
  onFinish: (state: SessionState) => void
  /** Optional override for activity-specific content */
  children?: ReactNode
}

export default function SessionRecorder({
  activity,
  onExit,
  onFinish,
  children,
}: SessionRecorderProps) {
  const [phase, setPhase] = useState<SessionPhase>("running")
  const isRunning = phase === "running"
  const isPaused = phase === "paused"
  const { elapsedMs, reset } = useSessionTimer(isRunning)

  const buildState = useCallback(
    (nextPhase: SessionPhase): SessionState => ({
      ...createInitialSessionState(activity),
      phase: nextPhase,
      elapsedMs,
    }),
    [activity, elapsedMs]
  )

  const handleExit = useCallback(() => {
    reset()
    setPhase("idle")
    onExit()
  }, [onExit, reset])

  const handleTogglePause = useCallback(() => {
    setPhase((prev) => {
      if (prev === "running") return "paused"
      if (prev === "paused") return "running"
      return prev
    })
  }, [])

  const handleFinish = useCallback(() => {
    setPhase("finished")
    onFinish(buildState("finished"))
  }, [buildState, onFinish])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return
      }

      if (e.key === "Escape") {
        e.preventDefault()
        handleExit()
        return
      }

      if (e.key === " " || e.code === "Space") {
        e.preventDefault()
        handleTogglePause()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [handleExit, handleTogglePause])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="session-recorder"
        role="region"
        aria-label={`${activity.title} session`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 h-full min-h-0 w-full bg-[#FFF9F8] text-slate-800 flex flex-col font-sans"
      >
        <RecorderHeader
          title={activity.title}
          elapsedMs={elapsedMs}
          isPaused={isPaused}
          onExit={handleExit}
        />

        <RecorderBody isPaused={isPaused}>
          {children ?? (
            <ActivityRenderer activity={activity} isPaused={isPaused} />
          )}
        </RecorderBody>

        <RecorderControls
          isPaused={isPaused}
          onTogglePause={handleTogglePause}
          onFinish={handleFinish}
        />
      </motion.div>
    </AnimatePresence>
  )
}
