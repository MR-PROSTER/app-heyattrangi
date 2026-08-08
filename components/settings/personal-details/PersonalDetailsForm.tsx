"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast, Toaster } from "sonner"
import SettingsInput from "../SettingsInput"
import { validateName, validatePhone } from "@/components/profile/identity/identityUtils"
import {
  pendingEmailKey,
  phoneStorageKey,
  readLocal,
  validateEmail,
  writeLocal,
} from "@/lib/settings/personalDetails"

export interface PersonalDetailsInitial {
  userId: string
  name: string | null
  email: string | null
  /** Google OAuth → email read-only */
  emailEditable: boolean
}

type FieldKey = "name" | "phone" | "email"

interface PersonalDetailsFormProps {
  initial: PersonalDetailsInitial
}

/**
 * Inline-editable Personal Details: Full Name, Phone, Email.
 * Email editability depends on auth provider (handoff).
 */
export default function PersonalDetailsForm({ initial }: PersonalDetailsFormProps) {
  const router = useRouter()
  const { update } = useSession()
  const [name, setName] = useState(initial.name || "")
  const [phone, setPhone] = useState("")
  const email = initial.email || ""
  const [editing, setEditing] = useState<FieldKey | null>(null)
  const [draft, setDraft] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)

  useEffect(() => {
    setPhone(readLocal(phoneStorageKey(initial.userId)))
    const pending = readLocal(pendingEmailKey(initial.userId))
    setPendingEmail(pending || null)
  }, [initial.userId])

  const startEdit = (field: FieldKey) => {
    if (field === "email" && !initial.emailEditable) return
    setError(null)
    setEditing(field)
    setDraft(field === "name" ? name : field === "phone" ? phone : email)
  }

  const cancelEdit = () => {
    setEditing(null)
    setDraft("")
    setError(null)
  }

  const validateDraft = useCallback(
    (field: FieldKey, value: string): string | null => {
      if (field === "name") return validateName(value)
      if (field === "phone") return validatePhone(value)
      return validateEmail(value)
    },
    []
  )

  const saveField = async () => {
    if (!editing || saving) return
    const err = validateDraft(editing, draft)
    if (err) {
      setError(err)
      return
    }
    setSaving(true)
    try {
      if (editing === "name") {
        const response = await fetch("/api/profile/patient", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: draft.trim() }),
        })
        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error((data as { error?: string }).error || "Failed to save name")
        }
        setName(draft.trim())
        await update()
        toast.success("Name saved")
        router.refresh()
      } else if (editing === "phone") {
        writeLocal(phoneStorageKey(initial.userId), draft.trim())
        setPhone(draft.trim())
        toast.success("Phone saved")
      } else if (editing === "email") {
        const next = draft.trim().toLowerCase()
        if (next === (initial.email || "").toLowerCase()) {
          toast.message("Email unchanged")
        } else {
          // Verification flow placeholder (handoff) — do not update account email yet.
          writeLocal(pendingEmailKey(initial.userId), next)
          setPendingEmail(next)
          toast.success("Verification email placeholder — confirm to finish updating.")
        }
      }
      cancelEdit()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save changes")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3 pt-2">
      <Toaster position="top-center" richColors closeButton />

      <InlineField
        label="Full Name"
        value={name || "—"}
        editing={editing === "name"}
        draft={draft}
        error={editing === "name" ? error : null}
        saving={saving}
        onEdit={() => startEdit("name")}
        onCancel={cancelEdit}
        onSave={() => void saveField()}
        onDraftChange={setDraft}
        inputType="text"
        autoComplete="name"
      />

      <InlineField
        label="Phone"
        value={phone || "—"}
        editing={editing === "phone"}
        draft={draft}
        error={editing === "phone" ? error : null}
        saving={saving}
        onEdit={() => startEdit("phone")}
        onCancel={cancelEdit}
        onSave={() => void saveField()}
        onDraftChange={setDraft}
        inputType="tel"
        autoComplete="tel"
      />

      <InlineField
        label="Email"
        value={email || "—"}
        editing={editing === "email"}
        draft={draft}
        error={editing === "email" ? error : null}
        saving={saving}
        editable={initial.emailEditable}
        hint={
          !initial.emailEditable
            ? "Managed by your Google account"
            : pendingEmail
              ? `Pending verification: ${pendingEmail}`
              : undefined
        }
        onEdit={() => startEdit("email")}
        onCancel={cancelEdit}
        onSave={() => void saveField()}
        onDraftChange={setDraft}
        inputType="email"
        autoComplete="email"
      />
    </div>
  )
}

function InlineField({
  label,
  value,
  editing,
  draft,
  error,
  saving,
  editable = true,
  hint,
  onEdit,
  onCancel,
  onSave,
  onDraftChange,
  inputType,
  autoComplete,
}: {
  label: string
  value: string
  editing: boolean
  draft: string
  error: string | null
  saving: boolean
  editable?: boolean
  hint?: string
  onEdit: () => void
  onCancel: () => void
  onSave: () => void
  onDraftChange: (v: string) => void
  inputType: string
  autoComplete?: string
}) {
  if (editing) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3">
        <SettingsInput
          label={label}
          type={inputType}
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          autoComplete={autoComplete}
          error={error}
          autoFocus
        />
        <div className="flex flex-col-reverse sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-[var(--radius-md)]
              border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-[var(--text-sm)] font-semibold
              text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] transition-colors duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-[var(--radius-md)]
              bg-[var(--color-brand)] px-4 text-[var(--text-sm)] font-semibold text-white
              hover:bg-[var(--color-brand-dark)] transition-colors duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2
              disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-11 items-start justify-between gap-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3.5">
      <div className="min-w-0">
        <p className="text-[var(--text-xs)] font-bold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
          {label}
        </p>
        <p className="mt-1 break-words text-[var(--text-base)] font-medium text-[var(--color-text-primary)]">
          {value}
        </p>
        {hint ? (
          <p className="mt-1 text-[var(--text-xs)] font-medium text-[var(--color-text-secondary)]">{hint}</p>
        ) : null}
      </div>
      {editable ? (
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${label}`}
          className="inline-flex min-h-11 shrink-0 items-center px-2 text-[var(--text-sm)] font-semibold text-[var(--color-brand)]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 rounded-[var(--radius-md)]"
        >
          Edit
        </button>
      ) : null}
    </div>
  )
}
