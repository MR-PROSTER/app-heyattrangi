"use client"

import { useEffect, useId, useRef } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { createPortal } from "react-dom"
import DeleteConfirmationInput from "./DeleteConfirmationInput"

interface DeleteAccountDialogProps {
  open: boolean
  confirmation: string
  onConfirmationChange: (value: string) => void
  isDeleting: boolean
  onCancel: () => void
  onConfirm: () => void
}

const CONFIRM_WORD = "DELETE"

export default function DeleteAccountDialog({
  open,
  confirmation,
  onConfirmationChange,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteAccountDialogProps) {
  const reduceMotion = useReducedMotion()
  const titleId = useId()
  const descId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)
  const canDelete = confirmation === CONFIRM_WORD && !isDeleting

  useEffect(() => {
    if (!open) return

    previouslyFocused.current = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const focusFirst = () => {
      const panel = panelRef.current
      if (!panel) return
      const focusable = panel.querySelector<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      focusable?.focus()
    }

    const timer = window.setTimeout(focusFirst, 10)

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) {
        e.preventDefault()
        onCancel()
        return
      }

      if (e.key !== "Tab" || !panelRef.current) return

      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1)

      if (focusables.length === 0) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown)

    return () => {
      window.clearTimeout(timer)
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused.current?.focus?.()
    }
  }, [open, isDeleting, onCancel])

  if (typeof document === "undefined") return null

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.button
            type="button"
            aria-label="Close dialog"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => {
              if (!isDeleting) onCancel()
            }}
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative z-10 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-gray-100 bg-white p-6 sm:p-7 shadow-xl"
          >
            <h2 id={titleId} className="text-lg font-bold text-gray-900 tracking-tight">
              Delete your account?
            </h2>
            <p id={descId} className="mt-3 text-sm font-medium text-gray-600 leading-relaxed">
              Your profile, conversations, journal entries, Mind Matrix history, emergency contact,
              and preferences will be permanently deleted.
            </p>
            <p className="mt-2 text-sm font-semibold text-gray-800">
              This action cannot be undone.
            </p>

            <div className="mt-5">
              <DeleteConfirmationInput
                value={confirmation}
                onChange={onConfirmationChange}
                disabled={isDeleting}
              />
            </div>

            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
              <button
                type="button"
                onClick={onCancel}
                disabled={isDeleting}
                className="inline-flex items-center justify-center min-h-11 rounded-xl border border-gray-200 bg-white px-4 py-2.5
                  text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors duration-150
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={!canDelete}
                aria-disabled={!canDelete}
                className="inline-flex items-center justify-center gap-2 min-h-11 rounded-xl bg-gray-900 px-4 py-2.5
                  text-sm font-semibold text-white hover:bg-black transition-colors duration-150
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-900"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 motion-reduce:animate-none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Deleting…
                  </>
                ) : (
                  "Delete Account"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  )
}
