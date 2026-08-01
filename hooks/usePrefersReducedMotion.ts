"use client"

import { useEffect, useState } from "react"

/**
 * True when the user prefers reduced motion.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  return reduced
}

/** Shared Framer Motion transition that collapses when reduced motion is on. */
export function exploreMotionTransition(
  reduced: boolean,
  duration = 0.3
): { duration: number; ease: number[] } {
  if (reduced) {
    return { duration: 0.01, ease: [0, 0, 1, 1] }
  }
  return { duration, ease: [0.22, 1, 0.36, 1] }
}
