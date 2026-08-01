"use client"

import type { ReactNode } from "react"

interface RecorderBodyProps {
  children: ReactNode
  isPaused: boolean
}

export default function RecorderBody({ children, isPaused }: RecorderBodyProps) {
  return (
    <main
      className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-center px-6 py-8"
      aria-busy={isPaused ? undefined : false}
      data-paused={isPaused ? "true" : "false"}
    >
      {children}
    </main>
  )
}
