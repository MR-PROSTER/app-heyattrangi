"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useSpeechToText } from "../../../hooks/useSpeechToText"

interface MoodCheckInModalProps {
  isOpen: boolean
  onClose: () => void
  initialScore?: number
  initialNote?: string
  maxNoteChars?: number
  onSubmit: (score: number, note: string) => void
}

const MOOD_CONFIG: Record<
  number,
  {
    label: string
    background: string
    primary: string
    muted: string
    image: string
    textLight: string
  }
> = {
  0: {
    label: "LOW",
    background: "linear-gradient(to bottom, #E9C9FF, #D284FA)",
    primary: "#4d179a",
    muted: "rgba(77, 23, 154, 0.3)",
    image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786799192/Low-emotion_vbpanv.png",
    textLight: "#E9C9FF",
  },
  1: {
    label: "MEH",
    background: "linear-gradient(to bottom, #C2DDF8, #86BDF3)",
    primary: "#024a70",
    muted: "rgba(2, 74, 112, 0.3)",
    image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730630/Meh-emotion_nozhzi.png",
    textLight: "#C2DDF8",
  },
  2: {
    label: "OKAY",
    background: "linear-gradient(to bottom, #FFD5B7, #FE9E57)",
    primary: "#733E0A",
    muted: "rgba(115, 62, 10, 0.3)",
    image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730633/Okay-emotion_sscj34.png",
    textLight: "#FFD5B7",
  },
  3: {
    label: "GOOD",
    background: "linear-gradient(to bottom, #CEF8A4, #A4F06A)",
    primary: "#132D0E",
    muted: "rgba(19, 45, 14, 0.3)",
    image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730633/Good-emotion_jimbfs.png",
    textLight: "#CEF8A4",
  },
  4: {
    label: "GREAT",
    background: "linear-gradient(to bottom, #FCE5AF, #FFC141)",
    primary: "#733e0a",
    muted: "rgba(115, 62, 10, 0.3)",
    image: "https://res.cloudinary.com/dxoiluua8/image/upload/v1786730630/Great-emotion_rbwtzb.png",
    textLight: "#FCE5AF",
  },
}

export default function MoodCheckInModal({
  isOpen,
  onClose,
  initialScore = 2,
  initialNote = "",
  maxNoteChars = 1000,
  onSubmit,
}: MoodCheckInModalProps) {
  const [score, setScore] = useState<number>(initialScore)
  const [note, setNote] = useState<string>(initialNote)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState(false)

  const handleTranscript = useCallback((text: string) => {
    setNote((prev) => {
      const next = prev.trim() ? `${prev} ${text}` : text
      return next.slice(0, maxNoteChars)
    })
  }, [maxNoteChars])

  const {
      isRecording,
      isTranscribing,
      toggleRecording,
  } = useSpeechToText(handleTranscript)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Sync initial values when modal opens
  useEffect(() => {
    if (isOpen) {
      setScore(initialScore)
      setNote(initialNote.slice(0, maxNoteChars))
      setErrorMsg(null)
      setIsSubmitting(false)
      setIsFocused(false)
    }
  }, [isOpen, initialScore, initialNote, maxNoteChars])

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
      setErrorMsg(err instanceof Error ? err.message : "Couldn't save your mood. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Determine if we should show the expanded input card matching image 2
  const isExpanded = isFocused || note.length > 0

  return (
    <AnimatePresence>
      <motion.div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mood-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-6 transition-colors duration-300 select-none overflow-y-auto"
        style={{ background: activeMood.background }}
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
            // @ts-expect-error CSS variable for focus ring color
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
        <div className="w-full max-w-[440px] flex flex-col items-center justify-center py-8">
          
          {/* Main Title & Slider/Label - Animates out of layout in expanded state */}
          <motion.div
            animate={{ 
              height: isExpanded ? 0 : "auto", 
              opacity: isExpanded ? 0 : 1,
              marginBottom: isExpanded ? 0 : 28
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full flex flex-col items-center overflow-hidden"
          >
            <h2
              id="mood-title"
              className="font-sans font-extrabold text-[24px] sm:text-[32px] text-center tracking-[-0.5px] mb-7 sm:mb-9"
              style={{ color: activeMood.primary }}
            >
              How is your Mood?
            </h2>
          </motion.div>

          {/* Dynamic Mood Face Image */}
          <motion.div 
            animate={{ 
              scale: isExpanded ? 0.75 : 1,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-[280px] h-[190px] sm:w-[320px] sm:h-[220px] flex items-center justify-center transition-all duration-300 select-none pointer-events-none"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={score}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  y: [0, -4, 0] // Subtle idle breathing animation
                }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{
                  opacity: { duration: 0.3, ease: "easeInOut" },
                  scale: { duration: 0.3, ease: "easeInOut" },
                  y: {
                    repeat: Infinity,
                    duration: 4,
                    ease: "easeInOut"
                  }
                }}
                className="relative w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] flex items-center justify-center"
              >
                <Image
                  src={activeMood.image}
                  alt={`${activeMood.label} mood`}
                  fill
                  priority
                  className="object-contain animate-fade-in"
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Large Mood Text Label - Animates out in expanded state */}
          <motion.div
            animate={{ 
              height: isExpanded ? 0 : 60, 
              opacity: isExpanded ? 0 : 1,
              marginTop: isExpanded ? 0 : 28
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex items-center justify-center overflow-hidden"
          >
            <span
              className="font-sans font-black text-[46px] sm:text-[54px] tracking-[-0.5px] select-none text-center leading-none"
              style={{ color: activeMood.primary }}
            >
              {activeMood.label}
            </span>
          </motion.div>

          {/* Custom Range Slider - Animates out in expanded state */}
          <motion.div
            animate={{ 
              height: isExpanded ? 0 : "auto", 
              opacity: isExpanded ? 0 : 1,
              marginTop: isExpanded ? 0 : 16,
              pointerEvents: isExpanded ? "none" : "auto"
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full px-2 py-4 overflow-visible"
          >
            {/* Slider wrapper with safe horizontal padding */}
            <div className="relative px-5 py-4 w-full overflow-visible">
              
              {/* Slider Track (background & progress fill, overflow: hidden) */}
              <div
                className="relative w-full h-[3px] rounded-full overflow-hidden"
                style={{ backgroundColor: activeMood.muted }}
              >
                {/* Visual track progress fill */}
                <motion.div
                  className="absolute left-0 top-0 bottom-0 rounded-full"
                  style={{ backgroundColor: activeMood.primary }}
                  animate={{
                    width:
                      score === 0 ? "0%" :
                      score === 1 ? "25%" :
                      score === 2 ? "50%" :
                      score === 3 ? "75%" : "100%",
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              </div>

              {/* Snap Point Dots (Rendered above track background but below thumb) */}
              <div className="absolute left-5 right-5 inset-y-0 pointer-events-none overflow-visible z-10 flex items-center">
                <div className="relative w-full h-0 overflow-visible">
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
                </div>
              </div>

              {/* Thumb Layer (renders sibling to track, overflow: visible, z-20) */}
              <div className="absolute left-5 right-5 inset-y-0 pointer-events-none overflow-visible z-20 flex items-center">
                <div className="relative w-full h-0 overflow-visible">
                  {/* Large Selected Thumb */}
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-lg flex items-center justify-center overflow-visible"
                    style={{ backgroundColor: activeMood.primary }}
                    animate={{
                      left:
                        score === 0 ? "0%" :
                        score === 1 ? "25%" :
                        score === 2 ? "50%" :
                        score === 3 ? "75%" : "100%",
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  >
                    {/* Visual pulse/ring and scale animation on selection change */}
                    <motion.div
                      key={score}
                      initial={{ scale: 0.85, opacity: 0.7 }}
                      animate={{ 
                        scale: [0.85, 1.12, 1.0],
                        opacity: 1
                      }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="w-full h-full rounded-full bg-current relative flex items-center justify-center overflow-visible"
                      style={{ color: activeMood.primary }}
                    >
                      {/* Subtle outer glowing ring */}
                      <motion.div
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="absolute inset-0 rounded-full border-2"
                        style={{ borderColor: activeMood.primary }}
                      />
                    </motion.div>
                  </motion.div>
                </div>
              </div>

            </div>

            {/* Slider Labels */}
            <div className="flex justify-between px-5 mt-4">
              <button
                type="button"
                onClick={() => setScore(0)}
                className="font-sans text-[13px] font-bold tracking-[-0.5px] transition-all focus-visible:outline-none"
                style={{
                  color: activeMood.primary,
                  opacity: score === 0 ? 1 : 0.5,
                }}
              >
                Low
              </button>
              <button
                type="button"
                onClick={() => setScore(1)}
                className="font-sans text-[13px] font-bold tracking-[-0.5px] transition-all focus-visible:outline-none"
                style={{
                  color: activeMood.primary,
                  opacity: score === 1 ? 1 : 0.5,
                }}
              >
                Meh
              </button>
              <button
                type="button"
                onClick={() => setScore(2)}
                className="font-sans text-[13px] font-bold tracking-[-0.5px] transition-all focus-visible:outline-none"
                style={{
                  color: activeMood.primary,
                  opacity: score === 2 ? 1 : 0.5,
                }}
              >
                Okay
              </button>
              <button
                type="button"
                onClick={() => setScore(3)}
                className="font-sans text-[13px] font-bold tracking-[-0.5px] transition-all focus-visible:outline-none"
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
                className="font-sans text-[13px] font-bold tracking-[-0.5px] transition-all focus-visible:outline-none"
                style={{
                  color: activeMood.primary,
                  opacity: score === 4 ? 1 : 0.5,
                }}
              >
                Great
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
              className="absolute inset-y-0 left-5 right-5 w-auto opacity-0 cursor-pointer"
            />
          </motion.div>

          {/* Footer Area with Note field & Submit */}
          <form
            onSubmit={handleSubmit}
            className="w-full pt-4 relative z-10"
          >
            {errorMsg && (
              <p className="text-[13px] font-extrabold text-center mb-2" style={{ color: activeMood.primary }}>
                {errorMsg}
              </p>
            )}

            {/* Beautiful expanded Card wrapper matching Image 2 */}
            <motion.div
              animate={{
                borderRadius: isExpanded ? "32px" : "28px",
                height: isExpanded ? "210px" : "56px",
                padding: isExpanded ? "20px" : "4px 8px 4px 12px",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex w-full relative transition-colors duration-300 border border-transparent"
              style={{ 
                flexDirection: isExpanded ? "column" : "row",
                alignItems: isExpanded ? "stretch" : "center",
                backgroundColor: "rgba(0, 0, 0, 0.08)",
                borderColor: isExpanded ? "rgba(0, 0, 0, 0.15)" : "transparent"
              }}
            >
              <textarea
                ref={textareaRef}
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, maxNoteChars))}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Add note"
                aria-label="Add optional note"
                maxLength={maxNoteChars}
                className="bg-transparent px-4 border-none outline-none resize-none overflow-y-auto leading-[36px] placeholder-current focus:ring-0 flex-1 min-h-[36px]"
                style={{
                  color: activeMood.primary,
                  opacity: 0.8,
                  paddingTop: isExpanded ? "8px" : "0px",
                  paddingBottom: isExpanded ? "8px" : "0px",
                  lineHeight: isExpanded ? "1.5" : "36px",
                  height: isExpanded ? "100%" : "36px",
                  fontWeight: 500,
                  fontSize: "16px",
                }}
                />

              {isExpanded && (
                <div className="flex items-center justify-between px-4 pt-1 text-[11px] font-bold" style={{ color: activeMood.primary }}>
                  <span>Optional note</span>
                  <span>{note.length}/{maxNoteChars}</span>
                </div>
              )}
              
              {/* Action buttons section - aligns inline when collapsed, opposite sides when expanded */}
              <div 
                className={`flex items-center shrink-0 ${isExpanded ? "w-full justify-between" : "justify-end gap-2"}`} 
                style={{ marginTop: isExpanded ? "8px" : "0px" }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    toggleRecording()
                    if (!isExpanded) setIsFocused(true) // Ensure it expands to show transcription space
                  }}
                  className={`inline-flex items-center justify-center p-2.5 rounded-full transition-all ${
                      isRecording || isTranscribing ? "bg-red-50 text-red-500 animate-pulse outline outline-1 outline-red-200" : "hover:bg-black/5"
                  }`}
                  style={{ color: isRecording || isTranscribing ? undefined : activeMood.primary }}
                  title="Speak to type"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  {isExpanded && (isTranscribing || isRecording) && (
                    <span className="ml-2 text-[12px] font-bold">
                      {isTranscribing ? "Transcribing..." : "Listening..."}
                    </span>
                  )}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="shrink-0 inline-flex items-center gap-1.5 px-6 py-3 rounded-full text-[14px] font-black hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                  style={{ backgroundColor: activeMood.primary, color: activeMood.textLight }}
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
            </motion.div>
          </form>

          {/* Preload mood images for seamless transition */}
          <div className="hidden" aria-hidden="true">
            <img src="https://res.cloudinary.com/dxoiluua8/image/upload/v1786799192/Low-emotion_vbpanv.png" alt="" />
            <img src="https://res.cloudinary.com/dxoiluua8/image/upload/v1786730630/Meh-emotion_nozhzi.png" alt="" />
            <img src="https://res.cloudinary.com/dxoiluua8/image/upload/v1786730633/Okay-emotion_sscj34.png" alt="" />
            <img src="https://res.cloudinary.com/dxoiluua8/image/upload/v1786730633/Good-emotion_jimbfs.png" alt="" />
            <img src="https://res.cloudinary.com/dxoiluua8/image/upload/v1786730630/Great-emotion_rbwtzb.png" alt="" />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
