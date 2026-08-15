"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast, Toaster } from "sonner"
import SettingsInput from "../SettingsInput"
import { validateName, validatePhone } from "@/components/profile/identity/identityUtils"
import Image from "next/image"
import { User, Calendar, Mail, ChevronDown, ChevronRight } from "lucide-react"
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
  const { data: session, update } = useSession()
  const [name, setName] = useState(initial.name || "")
  const [phone, setPhone] = useState("")
  const email = initial.email || ""
  const [editing, setEditing] = useState<FieldKey | "dob" | "gender" | null>(null)
  const [draft, setDraft] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)

  // Extra profile fields matching Image 2 (DOB, Gender, Country Code)
  const [dob, setDob] = useState("01/01/1988")
  const [gender, setGender] = useState("Gender")
  const [countryCode, setCountryCode] = useState("+91")

  useEffect(() => {
    setPhone(readLocal(phoneStorageKey(initial.userId)) || "(308) 555-0121")
    const pending = readLocal(pendingEmailKey(initial.userId))
    setPendingEmail(pending || null)

    const storedDob = readLocal(`dob_${initial.userId}`)
    if (storedDob) setDob(storedDob)
    const storedGender = readLocal(`gender_${initial.userId}`)
    if (storedGender) setGender(storedGender)
    const storedCc = readLocal(`cc_${initial.userId}`)
    if (storedCc) setCountryCode(storedCc)
  }, [initial.userId])

  const startEdit = (field: FieldKey | "dob" | "gender") => {
    if (field === "email" && !initial.emailEditable) return
    setError(null)
    setEditing(field)
    if (field === "name") setDraft(name)
    else if (field === "phone") setDraft(phone)
    else if (field === "email") setDraft(email)
    else if (field === "dob") setDraft(dob)
    else if (field === "gender") setDraft(gender)
  }

  const cancelEdit = () => {
    setEditing(null)
    setDraft("")
    setError(null)
  }

  const validateDraft = useCallback(
    (field: FieldKey | "dob" | "gender", value: string): string | null => {
      if (field === "name") return validateName(value)
      if (field === "phone") return validatePhone(value)
      if (field === "email") return validateEmail(value)
      if (field === "dob") {
        if (!value.trim()) return "Date of birth is required"
        return null
      }
      return null
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
          writeLocal(pendingEmailKey(initial.userId), next)
          setPendingEmail(next)
          toast.success("Verification email placeholder — confirm to finish updating.")
        }
      } else if (editing === "dob") {
        writeLocal(`dob_${initial.userId}`, draft.trim())
        setDob(draft.trim())
        toast.success("Date of birth saved")
      } else if (editing === "gender") {
        writeLocal(`gender_${initial.userId}`, draft.trim())
        setGender(draft.trim())
        toast.success("Gender saved")
      }
      cancelEdit()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save changes")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 pt-2 select-none">
      <Toaster position="top-center" richColors closeButton />

      {/* Profile Avatar Header */}
      <div className="flex flex-col items-center py-4 select-none">
        <div className="relative w-28 h-28 rounded-full overflow-hidden bg-sky-100/60 border-[3px] border-white shadow-sm ring-1 ring-black/5">
          <Image
            src={session?.user?.image || "/images/default_user.png"}
            alt="Profile Photo"
            fill
            className="object-cover bg-[#E0F2FE]"
          />
          {/* Blue pencil edit button */}
          <button className="absolute bottom-1 right-1 w-8 h-8 bg-[#2563EB] hover:bg-[#1D4ED8] rounded-full border-2 border-white flex items-center justify-center text-white shadow-md transition-all active:scale-95 cursor-pointer">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Fields List */}
      <div className="space-y-4">
        {/* Name Field */}
        {editing === "name" ? (
          <div className="w-full flex flex-col gap-2 rounded-[20px] border border-zinc-200 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-zinc-800 shrink-0 stroke-[2]" />
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                autoFocus
                className="flex-1 text-[15px] font-semibold text-zinc-800 placeholder-zinc-400 bg-transparent border-none outline-none focus:ring-0 p-0"
              />
            </div>
            {error && <p className="text-xs text-red-500 font-bold ml-8">{error}</p>}
            <div className="flex justify-end gap-2 mt-1">
              <button onClick={cancelEdit} className="px-4 py-1.5 rounded-full border border-zinc-200 text-xs font-black text-zinc-650 hover:bg-zinc-50 cursor-pointer">Cancel</button>
              <button onClick={() => void saveField()} className="px-4 py-1.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-black cursor-pointer shadow-sm">Save</button>
            </div>
          </div>
        ) : (
          <div onClick={() => startEdit("name")} className="w-full flex items-center justify-between gap-3 rounded-[20px] border border-zinc-200 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] cursor-pointer hover:border-zinc-300 transition-colors">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <User className="w-5 h-5 text-zinc-800 shrink-0 stroke-[2]" />
              <span className="text-[15px] font-semibold text-zinc-800 break-words leading-tight">{name || "—"}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0 stroke-[2.5]" />
          </div>
        )}

        {/* Date of Birth Field */}
        {editing === "dob" ? (
          <div className="w-full flex flex-col gap-2 rounded-[20px] border border-zinc-200 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-zinc-800 shrink-0 stroke-[2]" />
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                autoFocus
                placeholder="DD/MM/YYYY"
                className="flex-1 text-[15px] font-semibold text-zinc-800 placeholder-zinc-400 bg-transparent border-none outline-none focus:ring-0 p-0"
              />
            </div>
            {error && <p className="text-xs text-red-500 font-bold ml-8">{error}</p>}
            <div className="flex justify-end gap-2 mt-1">
              <button onClick={cancelEdit} className="px-4 py-1.5 rounded-full border border-zinc-200 text-xs font-black text-zinc-650 hover:bg-zinc-50 cursor-pointer">Cancel</button>
              <button onClick={() => void saveField()} className="px-4 py-1.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-black cursor-pointer shadow-sm">Save</button>
            </div>
          </div>
        ) : (
          <div onClick={() => startEdit("dob")} className="w-full flex items-center justify-between gap-3 rounded-[20px] border border-zinc-200 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] cursor-pointer hover:border-zinc-300 transition-colors">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Calendar className="w-5 h-5 text-zinc-800 shrink-0 stroke-[2]" />
              <span className="text-[15px] font-semibold text-zinc-800 break-words leading-tight">{dob}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0 stroke-[2.5]" />
          </div>
        )}

        {/* Email Field */}
        {editing === "email" ? (
          <div className="w-full flex flex-col gap-2 rounded-[20px] border border-zinc-200 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-zinc-800 shrink-0 stroke-[2]" />
              <input
                type="email"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                autoFocus
                className="flex-1 text-[15px] font-semibold text-zinc-800 placeholder-zinc-400 bg-transparent border-none outline-none focus:ring-0 p-0"
              />
            </div>
            {error && <p className="text-xs text-red-500 font-bold ml-8">{error}</p>}
            <div className="flex justify-end gap-2 mt-1">
              <button onClick={cancelEdit} className="px-4 py-1.5 rounded-full border border-zinc-200 text-xs font-black text-zinc-650 hover:bg-zinc-50 cursor-pointer">Cancel</button>
              <button onClick={() => void saveField()} className="px-4 py-1.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-black cursor-pointer shadow-sm">Save</button>
            </div>
          </div>
        ) : (
          <div
            onClick={initial.emailEditable ? () => startEdit("email") : undefined}
            className={`w-full flex items-center justify-between gap-3 rounded-[20px] border border-zinc-200 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] ${initial.emailEditable ? 'cursor-pointer hover:border-zinc-300 transition-colors' : 'opacity-90'}`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Mail className="w-5 h-5 text-zinc-800 shrink-0 stroke-[2]" />
              <div className="min-w-0 flex-1">
                <span className="text-[15px] font-semibold text-zinc-850 break-words leading-tight">{email || "—"}</span>
                {!initial.emailEditable && (
                  <p className="text-[11px] font-bold text-zinc-400 leading-none mt-0.5">Managed by your Google account</p>
                )}
                {pendingEmail && (
                  <p className="text-[11px] font-bold text-amber-500 leading-none mt-0.5">Pending verification: {pendingEmail}</p>
                )}
              </div>
            </div>
            {initial.emailEditable && (
              <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0 stroke-[2.5]" />
            )}
          </div>
        )}

        {/* Phone Field */}
        <div className="flex gap-3 w-full">
          {/* Country Code dropdown select box */}
          <div className="relative flex items-center bg-white rounded-[20px] border border-zinc-200 p-4 w-[96px] shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
            <select
              value={countryCode}
              onChange={(e) => {
                setCountryCode(e.target.value)
                writeLocal(`cc_${initial.userId}`, e.target.value)
              }}
              className="w-full appearance-none pr-5 text-[15px] font-semibold text-zinc-800 bg-transparent border-none outline-none focus:ring-0 p-0 select-none cursor-pointer"
            >
              <option value="+91">+91</option>
              <option value="+1">+1</option>
              <option value="+44">+44</option>
              <option value="+61">+61</option>
            </select>
            <ChevronDown className="absolute right-4 w-4 h-4 text-zinc-500 pointer-events-none stroke-[2]" />
          </div>

          {/* Number edit / input box */}
          {editing === "phone" ? (
            <div className="flex-1 flex flex-col gap-2 rounded-[20px] border border-zinc-200 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
              <input
                type="tel"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                autoFocus
                className="w-full text-[15px] font-semibold text-zinc-800 placeholder-zinc-400 bg-transparent border-none outline-none focus:ring-0 p-0"
              />
              {error && <p className="text-xs text-red-500 font-bold ml-1">{error}</p>}
              <div className="flex justify-end gap-2 mt-1">
                <button onClick={cancelEdit} className="px-4 py-1.5 rounded-full border border-zinc-200 text-xs font-black text-zinc-650 hover:bg-zinc-50 cursor-pointer">Cancel</button>
                <button onClick={() => void saveField()} className="px-4 py-1.5 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-black cursor-pointer shadow-sm">Save</button>
              </div>
            </div>
          ) : (
            <div onClick={() => startEdit("phone")} className="flex-1 flex items-center justify-between gap-3 rounded-[20px] border border-zinc-200 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] cursor-pointer hover:border-zinc-300 transition-colors">
              <span className="text-[15px] font-semibold text-zinc-800 break-words leading-tight">{phone}</span>
              <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0 stroke-[2.5]" />
            </div>
          )}
        </div>

        {/* Gender Field */}
        <div className="relative w-full flex items-center justify-between bg-white rounded-[20px] border border-zinc-200 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] cursor-pointer hover:border-zinc-300 transition-colors">
          <select
            value={gender}
            onChange={(e) => {
              setGender(e.target.value)
              writeLocal(`gender_${initial.userId}`, e.target.value)
              toast.success("Gender saved")
            }}
            className="w-full appearance-none pr-8 text-[15px] font-semibold text-zinc-800 bg-transparent border-none outline-none focus:ring-0 p-0 cursor-pointer"
          >
            <option value="Gender">Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <ChevronRight className="absolute right-4 w-4 h-4 text-zinc-800 pointer-events-none stroke-[2.5]" />
        </div>

      </div>
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
