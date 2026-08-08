"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

interface MoodCheckInModalProps {
  isOpen: boolean
  onClose: () => void
  initialScore?: number
  initialNote?: string
  onSubmit: (score: number, note: string) => void
}

const MOOD_CONFIG: Record<
  number,
  {
    label: string
    background: string
    primary: string
    muted: string
    face: {
      eyeLeft: { x: number; y: number; width: number; height: number; rx: number }
      eyeRight: { x: number; y: number; width: number; height: number; rx: number }
      mouthD: string
    }
  }
> = {
  0: {
    // SAD
    label: "SAD",
    background: "#a684ff",
    primary: "#4d179a",
    muted: "rgba(77, 23, 154, 0.3)",
    face: {
      eyeLeft: { x: 50, y: 43, width: 50, height: 18, rx: 9 },
      eyeRight: { x: 140, y: 43, width: 50, height: 18, rx: 9 },
      mouthD: "M 85,120 Q 120,88 155,120",
    },
  },
  1: {
    // BAD
    label: "BAD",
    background: "#0069a8",
    primary: "#024a70",
    muted: "rgba(2, 74, 112, 0.3)",
    face: {
      eyeLeft: { x: 51, y: 31, width: 48, height: 48, rx: 24 },
      eyeRight: { x: 141, y: 31, width: 48, height: 48, rx: 24 },
      mouthD: "M 85,120 Q 120,88 155,120",
    },
  },
  2: {
    // NOT BAD
    label: "NOT BAD",
    background: "#F4A462",
    primary: "#733E0A",
    muted: "rgba(115, 62, 10, 0.3)",
    face: {
      eyeLeft: { x: 50, y: 43, width: 50, height: 18, rx: 9 },
      eyeRight: { x: 140, y: 43, width: 50, height: 18, rx: 9 },
      mouthD: "M 85,110 L 155,110",
    },
  },
  3: {
    // GOOD
    label: "GOOD",
    background: "#AADB1E",
    primary: "#132D0E",
    muted: "rgba(19, 45, 14, 0.3)",
    face: {
      eyeLeft: { x: 51, y: 31, width: 48, height: 48, rx: 24 },
      eyeRight: { x: 141, y: 31, width: 48, height: 48, rx: 24 },
      mouthD: "M 85,95 Q 120,130 155,95",
    },
  },
  4: {
    // HAPPY
    label: "HAPPY",
    background: "#ffd966",
    primary: "#733e0a",
    muted: "rgba(115, 62, 10, 0.3)",
    face: {
      eyeLeft: { x: 50, y: 43, width: 50, height: 18, rx: 9 },
      eyeRight: { x: 140, y: 43, width: 50, height: 18, rx: 9 },
      mouthD: "M 80,95 Q 120,135 160,95",
    },
  },
}

export default function MoodCheckInModal({
  isOpen,
  onClose,
  initialScore = 2,
  initialNote = "",
  onSubmit,
}: MoodCheckInModalProps) {
  const [score, setScore] = useState<number>(initialScore)
  const [note, setNote] = useState<string>(initialNote)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Sync initial values when modal opens
  useEffect(() => {
    if (isOpen) {
      setScore(initialScore)
      setNote(initialNote)
      setErrorMsg(null)
      setIsSubmitting(false)
    }
  }, [isOpen, initialScore, initialNote])

  // Body scroll lock & focus trap
  useEffect(() => {
    if (!isOpen) return

    // Lock body scroll
    const originalStyle = document.body.style.overflow
    document.body.style.overflow = "hidden"

    // Focus close button on open
    setTimeout(() => {
      closeButtonRef.current?.focus()
    }, 100)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex="0"]'
        )
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = originalStyle
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  // Auto-resize note textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [note, isOpen])

  if (!isOpen) return null

  const activeMood = MOOD_CONFIG[score] || MOOD_CONFIG[2]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      await onSubmit(score, note)
      onClose()
    } catch (err) {
      setErrorMsg("Couldn't save your mood. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mood-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-6 transition-colors duration-300 select-none overflow-y-auto"
        style={{ backgroundColor: activeMood.background }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Absolute Close Button - Top Left */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close mood check-in"
          className="absolute top-6 left-6 sm:top-10 sm:left-10 w-11 h-11 rounded-full flex items-center justify-center bg-black/10 hover:bg-black/15 transition-colors focus-visible:outline-none focus-visible:ring-2"
          style={{ 
            color: activeMood.primary,
            // @ts-ignore
            "--tw-ring-color": activeMood.primary 
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            className="w-5 h-5"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Centered Card Content Flow */}
        <div className="w-full max-w-[440px] flex flex-col items-center justify-center space-y-7 sm:space-y-9 py-8">
          
          {/* Main Title */}
          <h2
            id="mood-title"
            className="font-extrabold text-[24px] sm:text-[32px] text-center tracking-tight"
            style={{ color: activeMood.primary }}
          >
            How is your Mood?
          </h2>

          {/* Animated Mood Face */}
          <div className="w-[280px] h-[190px] sm:w-[320px] sm:h-[220px] flex items-center justify-center transition-all duration-300">
            <svg viewBox="0 0 240 160" className="w-full h-full">
              {/* Left Eye */}
              <motion.rect
                animate={{
                  x: activeMood.face.eyeLeft.x,
                  y: activeMood.face.eyeLeft.y,
                  width: activeMood.face.eyeLeft.width,
                  height: activeMood.face.eyeLeft.height,
                  rx: activeMood.face.eyeLeft.rx,
                }}
                transition={{ type: "spring", stiffness: 220, damping: 26 }}
                fill={activeMood.primary}
              />
              {/* Right Eye */}
              <motion.rect
                animate={{
                  x: activeMood.face.eyeRight.x,
                  y: activeMood.face.eyeRight.y,
                  width: activeMood.face.eyeRight.width,
                  height: activeMood.face.eyeRight.height,
                  rx: activeMood.face.eyeRight.rx,
                }}
                transition={{ type: "spring", stiffness: 220, damping: 26 }}
                fill={activeMood.primary}
              />
              {/* Mouth */}
              <motion.path
                animate={{ d: activeMood.face.mouthD }}
                transition={{ type: "spring", stiffness: 220, damping: 26 }}
                fill="none"
                stroke={activeMood.primary}
                strokeWidth="12"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Large Mood Text Label */}
          <div className="h-[60px] flex items-center justify-center">
            <span
              className="font-black text-[46px] sm:text-[54px] tracking-wider select-none text-center leading-none"
              style={{ color: activeMood.primary }}
            >
              {activeMood.label}
            </span>
          </div>

          {/* Custom Range Slider */}
          <div className="relative w-full px-2 py-4">
            <div
              className="relative w-full h-[3px] rounded-full"
              style={{ backgroundColor: activeMood.muted }}
            >
              {/* Snap Point Dots */}
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: activeMood.primary }}
              />
              <div
                className="absolute left-[25%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: activeMood.primary }}
              />
              <div
                className="absolute left-[50%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: activeMood.primary }}
              />
              <div
                className="absolute left-[75%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: activeMood.primary }}
              />
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: activeMood.primary }}
              />

              {/* Large Selected Thumb */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-lg pointer-events-none"
                style={{ backgroundColor: activeMood.primary }}
                animate={{
                  left:
                    score === 0 ? "0%" :
                    score === 1 ? "25%" :
                    score === 2 ? "50%" :
                    score === 3 ? "75%" : "100%",
                }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            </div>

            {/* Slider Labels */}
            <div className="flex justify-between mt-4">
              <button
                type="button"
                onClick={() => setScore(0)}
                className="text-[13px] font-bold tracking-wide transition-all focus-visible:outline-none"
                style={{
                  color: activeMood.primary,
                  opacity: score === 0 ? 1 : 0.5,
                }}
              >
                Sad
              </button>
              <button
                type="button"
                onClick={() => setScore(1)}
                className="text-[13px] font-bold tracking-wide transition-all focus-visible:outline-none"
                style={{
                  color: activeMood.primary,
                  opacity: score === 1 ? 1 : 0.5,
                }}
              >
                Bad
              </button>
              <button
                type="button"
                onClick={() => setScore(2)}
                className="text-[13px] font-bold tracking-wide transition-all focus-visible:outline-none"
                style={{
                  color: activeMood.primary,
                  opacity: score === 2 ? 1 : 0.5,
                }}
              >
                Not bad
              </button>
              <button
                type="button"
                onClick={() => setScore(3)}
                className="text-[13px] font-bold tracking-wide transition-all focus-visible:outline-none"
                style={{
                  color: activeMood.primary,
                  opacity: score === 3 ? 1 : 0.5,
                }}
              >
                Good
              </button>
              <button
                type="button"
                onClick={() => setScore(4)}
                className="text-[13px] font-bold tracking-wide transition-all focus-visible:outline-none"
                style={{
                  color: activeMood.primary,
                  opacity: score === 4 ? 1 : 0.5,
                }}
              >
                Happy
              </button>
            </div>

            {/* Range input overlay */}
            <input
              type="range"
              min="0"
              max="4"
              step="1"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              aria-label="How is your mood today?"
              aria-valuemin={0}
              aria-valuemax={4}
              aria-valuenow={score}
              aria-valuetext={activeMood.label}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Footer Area with Note field & Submit */}
          <form
            onSubmit={handleSubmit}
            className="w-full space-y-4 pt-4 relative z-10"
          >
            {errorMsg && (
              <p className="text-[13px] font-extrabold text-center" style={{ color: activeMood.primary }}>
                {errorMsg}
              </p>
            )}

            <div
              className="flex items-center w-full p-2.5 rounded-[28px] transition-colors duration-300"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.08)" }}
            >
              <textarea
                ref={textareaRef}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add note"
                rows={1}
                aria-label="Add optional note"
                className="flex-1 bg-transparent px-4 py-3 text-[15px] font-bold border-none outline-none resize-none overflow-hidden leading-snug placeholder-current focus:ring-0"
                style={{
                  color: activeMood.primary,
                }}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="shrink-0 inline-flex items-center gap-1.5 px-6 py-3 rounded-full text-[14px] font-black text-white hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                style={{ backgroundColor: activeMood.primary }}
              >
                <span>{isSubmitting ? "Saving..." : "Submit"}</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  className="w-4 h-4"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
