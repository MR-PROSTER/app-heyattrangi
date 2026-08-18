"use client"

import { useRef, useState } from "react"
import dynamic from "next/dynamic"
import { toast, Toaster } from "sonner"
import { performClientSignOut } from "@/lib/auth/performClientSignOut"

const DeleteAccountDialog = dynamic(
  () => import("@/components/profile/account/DeleteAccountDialog"),
  { ssr: false }
)

interface DeleteAccountSectionProps {
  className?: string
}

export default function DeleteAccountSection({ className = "" }: DeleteAccountSectionProps) {
  const [open, setOpen] = useState(false)
  const [confirmation, setConfirmation] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const inFlight = useRef(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const close = () => {
    if (isDeleting || inFlight.current) return
    setOpen(false)
    setConfirmation("")
    // Dialog restores focus; reinforce trigger for reliability after portal unmount.
    window.setTimeout(() => triggerRef.current?.focus(), 0)
  }

  const handleConfirm = async () => {
    if (confirmation !== "DELETE" || isDeleting || inFlight.current) return
    inFlight.current = true
    setIsDeleting(true)

    try {
      const deleteRes = await fetch("/api/patient/delete-account", {
        method: "DELETE",
      })

      if (!deleteRes.ok) {
        const errorData = await deleteRes.json().catch(() => ({}))
        toast.error(errorData.error || "Couldn't delete account. Please try again.")
        setIsDeleting(false)
        inFlight.current = false
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 500))
      const result = await performClientSignOut({ redirectOnError: false })
      if (!result.ok) {
        toast.error(result.error || "Account deleted but failed to sign out. Please refresh.")
        setIsDeleting(false)
        inFlight.current = false
      }
    } catch {
      toast.error("Couldn't delete account. Please try again.")
      setIsDeleting(false)
      inFlight.current = false
    }
  }

  return (
    <>
      <Toaster position="top-center" richColors closeButton />
      <section
        aria-labelledby="profile-delete-heading"
        className={`rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)]
          p-5 shadow-[0_4px_16px_color-mix(in_srgb,var(--color-text-primary)_4%,transparent)] ${className}`}
      >
        <h3
          id="profile-delete-heading"
          className="text-[var(--text-sm)] font-bold text-[var(--color-text-primary)]"
        >
          Delete Account
        </h3>
        <p className="mt-1 max-w-prose text-[var(--text-sm)] font-medium leading-[var(--leading-base)] text-[var(--color-text-secondary)]">
          Delete your account and permanently remove your information.
        </p>
        <p className="mt-[var(--text-xs)] text-[var(--text-sm)] font-semibold text-[var(--color-text-primary)]">
          This action cannot be undone.
        </p>
        <div className="mt-[var(--text-base)]">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)]
              bg-[var(--color-text-primary)] px-4 py-2.5 text-[var(--text-sm)] font-semibold text-white
              transition-colors duration-150 hover:bg-black active:scale-[0.98]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2"
          >
            Delete Account
          </button>
        </div>
      </section>

      {open ? (
        <DeleteAccountDialog
          open={open}
          confirmation={confirmation}
          onConfirmationChange={setConfirmation}
          isDeleting={isDeleting}
          onCancel={close}
          onConfirm={() => void handleConfirm()}
        />
      ) : null}
    </>
  )
}
