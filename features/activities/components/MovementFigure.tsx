"use client"

import type { BodyRegion } from "../types"
import { BodyFigure } from "./BodyFigure"

interface MovementFigureProps {
  region: BodyRegion
}

/** Micro Movement figure — thin wrapper over shared BodyFigure. */
export function MovementFigure({ region }: MovementFigureProps) {
  return (
    <BodyFigure
      region={region}
      blurPx={32}
      pulseDurationSec={4}
      glowPeakOpacity={0.5}
      testId="movement-figure"
    />
  )
}
