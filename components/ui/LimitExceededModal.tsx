"use client"

import { useEffect, useId, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"

export interface LimitExceededInfo {
  /** Human-readable feature name, e.g. "AI Companion" */
  feature: string
  /** The backend message, e.g. "Daily voice message limit reached" */
  message: string
  /** Seconds until the limit window resets (optional) */
  resetInSeconds?: number
  /** Whether the limit can be bypassed by upgrading */
  upgradeable?: boolean
}

interface Props {
  info: LimitExceededInfo | null
  onClose: () => void
}

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return "soon"
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const parts: string[] = []
  if (h > 0) parts.push(`${h}h`)
  if (m > 0) parts.push(`${m}m`)
  if (s > 0 || parts.length === 0) parts.push(`${s}s`)
  return parts.join(" ")
}

export default function LimitExceededModal({ info, onClose }: Props) {
  const router = useRouter()
  const titleId = useId()
  const descId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  const [remaining, setRemaining] = useState<number>(info?.resetInSeconds ?? 0)

  // Reset countdown when info changes
  useEffect(() => {
    setRemaining(info?.resetInSeconds ?? 0)
  }, [info?.resetInSeconds])

  // Live countdown ticker
  useEffect(() => {
    if (!info || remaining <= 0) return
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id)
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [info, remaining])

  // Focus trap + scroll lock
  useEffect(() => {
    if (!info) return
    previouslyFocused.current = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const focusFirst = () => {
      const panel = panelRef.current
      if (!panel) return
      const el = panel.querySelector<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      el?.focus()
    }
    const timer = window.setTimeout(focusFirst, 10)

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return }
      if (e.key !== "Tab" || !panelRef.current) return
      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      )
      if (!focusables.length) return
      const first = focusables[0], last = focusables[focusables.length - 1]
      const active = document.activeElement as HTMLElement | null
      if (e.shiftKey && active === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus() }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => {
      clearTimeout(timer)
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = prevOverflow
      previouslyFocused.current?.focus?.()
    }
  }, [info, onClose])

  if (typeof document === "undefined" || !info) return null

  const hasCountdown = (info.resetInSeconds ?? 0) > 0
  const upgradeable = info.upgradeable !== false

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/50 backdrop-blur-[3px]"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative z-10 w-full sm:max-w-[420px] rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-xl)]
          border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl overflow-hidden"
      >
        {/* Top accent bar */}
        <div
          className="h-1 w-full"
          style={{ background: "linear-gradient(90deg, var(--color-brand), var(--color-brand-soft, #f97316))" }}
        />

        <div className="p-6 sm:p-7">
          {/* Icon */}
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 border border-orange-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2a10 10 0 1 1 0 20A10 10 0 0 1 12 2Z" stroke="var(--color-brand)" strokeWidth="1.5" />
              <path d="M12 7v5" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="15.5" r="1" fill="var(--color-brand)" />
            </svg>
          </div>

          {/* Title */}
          <h2
            id={titleId}
            className="text-[var(--text-lg)] font-bold text-[var(--color-text-primary)] tracking-tight"
          >
            {info.feature} Limit Reached
          </h2>

          {/* Description */}
          <p
            id={descId}
            className="mt-2 text-[var(--text-sm)] text-[var(--color-text-secondary)] leading-[var(--leading-base)]"
          >
            {info.message}
          </p>

          {/* Countdown pill */}
          {hasCountdown && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)]
              bg-[var(--color-surface-raised)] px-3 py-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
                <circle cx="12" cy="12" r="10" stroke="var(--color-text-secondary)" strokeWidth="1.5" />
                <path d="M12 7v5l3 3" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="text-[var(--text-xs)] font-semibold text-[var(--color-text-secondary)]">
                Resets in&nbsp;
                <span className="tabular-nums text-[var(--color-text-primary)]">
                  {remaining > 0 ? formatCountdown(remaining) : "a moment"}
                </span>
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-2.5">
            {upgradeable && (
              <button
                type="button"
                id="limit-modal-upgrade-btn"
                onClick={() => { onClose(); router.push("/dashboard/settings/subscription") }}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-md)]
                  px-5 text-[var(--text-sm)] font-semibold text-white transition-all duration-150
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2"
                style={{ background: "linear-gradient(135deg, var(--color-brand), var(--color-brand-soft, #f97316))" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"
                    fill="currentColor" />
                </svg>
                Upgrade to Premium
              </button>
            )}
            <button
              type="button"
              id="limit-modal-close-btn"
              onClick={onClose}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-md)]
                border border-[var(--color-border)] bg-[var(--color-surface)] px-5
                text-[var(--text-sm)] font-semibold text-[var(--color-text-primary)]
                hover:bg-[var(--color-surface-raised)] transition-colors duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
