"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { performClientSignOut } from "@/lib/auth/performClientSignOut"
import {
  PROFILE_BTN_PRIMARY,
  PROFILE_INNER_CARD,
  PROFILE_SECTION_DESC,
  PROFILE_SUBHEAD,
} from "../ui/profileChrome"

const DeleteAccountDialog = dynamic(() => import("./DeleteAccountDialog"), {
  ssr: false,
})

interface DeleteAccountCardProps {
  className?: string
}

export default function DeleteAccountCard({ className = "" }: DeleteAccountCardProps) {
  const [open, setOpen] = useState(false)
  const [confirmation, setConfirmation] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const close = () => {
    if (isDeleting) return
    setOpen(false)
    setConfirmation("")
  }

  const handleConfirm = async () => {
    if (confirmation !== "DELETE" || isDeleting) return
    setIsDeleting(true)
    // UI-only deletion phase — success reuses the existing logout / redirect flow.
    await new Promise((resolve) => setTimeout(resolve, 500))
    await performClientSignOut()
  }

  return (
    <>
      <article className={`${PROFILE_INNER_CARD} ${className}`}>
        <h3 className={PROFILE_SUBHEAD}>Delete Account</h3>
        <p className={`${PROFILE_SECTION_DESC} max-w-prose`}>
          Delete your account and permanently remove your information.
        </p>
        <p className="mt-2 text-sm font-semibold text-gray-700">
          This action cannot be undone.
        </p>
        <div className="mt-4">
          <button type="button" onClick={() => setOpen(true)} className={PROFILE_BTN_PRIMARY}>
            Delete Account
          </button>
        </div>
      </article>

      {open ? (
        <DeleteAccountDialog
          open={open}
          confirmation={confirmation}
          onConfirmationChange={setConfirmation}
          isDeleting={isDeleting}
          onCancel={close}
          onConfirm={handleConfirm}
        />
      ) : null}
    </>
  )
}
