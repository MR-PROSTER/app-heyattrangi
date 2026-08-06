"use client"

import { useEffect, useRef, useState } from "react"
import type { BreathingEngineState } from "../../hooks/usePacedTimeline"
import { BoxCycleNudge, cycleMotivation } from "./BoxHelp"

interface BoxCycleNudgeSyncProps {
  engine: BreathingEngineState
}

export function BoxCycleNudgeSync({ engine }: BoxCycleNudgeSyncProps) {
  const lastCycleRef = useRef(0)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (engine.status !== "running") return
    if (engine.cycle <= lastCycleRef.current) return
    lastCycleRef.current = engine.cycle
    setMessage(cycleMotivation(engine.cycle))
  }, [engine.cycle, engine.status])

  return <BoxCycleNudge message={message} />
}
