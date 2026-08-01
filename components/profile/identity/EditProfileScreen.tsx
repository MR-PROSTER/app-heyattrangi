"use client"

import { useEffect, useId, useRef, useState } from "react"
import { createPortal } from "react-dom"
import IdentityAvatar from "./IdentityAvatar"
import {
  validateAge,
  validateGender,
  validateName,
  validatePhone,
} from "./identityUtils"

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
  { value: "Prefer not to say", label: "Prefer not to say" },
] as const

const COUNTRY_OPTIONS = [
  { code: "+91", label: "+91 (IN)" },
  { code: "+1", label: "+1 (US)" },
  { code: "+44", label: "+44 (UK)" },
] as const

export interface EditProfileValues {
  name: string
  age: string
  phone: string
  gender: string
}

interface EditProfileScreenProps {
  open: boolean
  name: string
  email: string | null | undefined
  image: string | null | undefined
  previewUrl?: string | null
  isUploading?: boolean
  age: string
  phone: string
  gender: string
  isSaving?: boolean
  onClose: () => void
  onSave: (values: EditProfileValues) => Promise<void> | void
  onSelectFile: (file: File) => void
  onRemovePhoto?: () => void
}

function parsePhone(phone: string): { country: string; national: string } {
  const trimmed = phone.trim()
  if (!trimmed) return { country: "+91", national: "" }
  const match = COUNTRY_OPTIONS.find((c) => trimmed.startsWith(c.code))
  if (match) {
    return {
      country: match.code,
      national: trimmed.slice(match.code.length).replace(/[\s\-()]/g, ""),
    }
  }
  if (/^[6-9]\d{9}$/.test(trimmed.replace(/\D/g, ""))) {
    return { country: "+91", national: trimmed.replace(/\D/g, "") }
  }
  return { country: "+91", national: trimmed.replace(/^\+/, "").replace(/\D/g, "") }
}

const fieldShell =
  "flex w-full min-h-[52px] items-center gap-3 rounded-xl border border-gray-200 bg-white px-3.5 text-sm font-medium text-gray-900 transition-[border-color,box-shadow] duration-150 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20"

function IconUser({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  )
}

function IconCalendar({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  )
}

function IconMail({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  )
}

/**
 * Mobile Edit Profile screen — Image 2 pattern.
 * Uses existing identity fields; email remains read-only (OAuth).
 */
export default function EditProfileScreen({
  open,
  name,
  email,
  image,
  previewUrl = null,
  isUploading = false,
  age,
  phone,
  gender,
  isSaving = false,
  onClose,
  onSave,
  onSelectFile,
  onRemovePhoto,
}: EditProfileScreenProps) {
  const titleId = useId()
  const genderListId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  const [draftName, setDraftName] = useState(name)
  const [draftAge, setDraftAge] = useState(age)
  const [draftGender, setDraftGender] = useState(gender)
  const parsed = parsePhone(phone)
  const [country, setCountry] = useState(parsed.country)
  const [national, setNational] = useState(parsed.national)
  const [error, setError] = useState<string | null>(null)
  const [genderOpen, setGenderOpen] = useState(false)
  const [countryOpen, setCountryOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    setDraftName(name)
    setDraftAge(age)
    setDraftGender(gender)
    const next = parsePhone(phone)
    setCountry(next.country)
    setNational(next.national)
    setError(null)
    setGenderOpen(false)
    setCountryOpen(false)
  }, [open, name, age, gender, phone])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onKey)
    }
  }, [open, onClose, submitting])

  if (!mounted || !open) return null

  const composedPhone = national.trim()
    ? `${country}${national.trim().replace(/\D/g, "")}`
    : ""

  const handleSave = async () => {
    if (submitting || isSaving) return
    const nameErr = validateName(draftName)
    if (nameErr) {
      setError(nameErr)
      return
    }
    const ageErr = validateAge(draftAge)
    if (ageErr) {
      setError(ageErr)
      return
    }
    const phoneErr = validatePhone(composedPhone)
    if (phoneErr) {
      setError(phoneErr)
      return
    }
    const genderErr = validateGender(draftGender)
    if (genderErr) {
      setError(genderErr)
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await onSave({
        name: draftName.trim(),
        age: draftAge.trim(),
        phone: composedPhone,
        gender: draftGender,
      })
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save")
    } finally {
      setSubmitting(false)
    }
  }

  const genderLabel =
    GENDER_OPTIONS.find((o) => o.value === draftGender)?.label || "Gender"

  return createPortal(
    <div
      className="fixed inset-0 z-[80] md:hidden bg-white flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      ref={panelRef}
    >
      <header className="sticky top-0 z-10 flex items-center gap-1 border-b border-gray-100 bg-white px-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          aria-label="Back"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-gray-900
            hover:bg-gray-50 transition-colors duration-150
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 id={titleId} className="flex-1 text-lg font-bold text-gray-900 tracking-tight">
          Edit Profile
        </h2>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={submitting || isSaving}
          className="min-h-11 px-3 text-sm font-bold text-[#4A6CF7]
            hover:text-[#3B5BDB] transition-colors duration-150
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg
            disabled:opacity-50"
        >
          {submitting || isSaving ? "Saving…" : "Save"}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="flex justify-center pt-6 pb-7">
          <IdentityAvatar
            size="lg"
            badge="edit"
            name={draftName}
            email={email}
            image={image}
            previewUrl={previewUrl}
            isUploading={isUploading}
            onSelectFile={onSelectFile}
            onRemovePhoto={onRemovePhoto}
          />
        </div>

        <div className="space-y-3">
          <label className={fieldShell}>
            <span className="text-gray-800 shrink-0">
              <IconUser />
            </span>
            <input
              type="text"
              value={draftName}
              autoComplete="name"
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="Full name"
              className="min-w-0 flex-1 bg-transparent py-3 outline-none placeholder:text-gray-400"
            />
          </label>

          <label className={fieldShell}>
            <span className="text-gray-800 shrink-0">
              <IconCalendar />
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={120}
              value={draftAge}
              onChange={(e) => setDraftAge(e.target.value)}
              placeholder="Age"
              aria-label="Age"
              className="min-w-0 flex-1 bg-transparent py-3 outline-none placeholder:text-gray-400 tabular-nums"
            />
          </label>

          <div
            className={`${fieldShell} bg-gray-50/80`}
            title="Managed by your sign-in provider"
          >
            <span className="text-gray-800 shrink-0">
              <IconMail />
            </span>
            <p className="min-w-0 flex-1 truncate py-3 text-gray-700">{email || "—"}</p>
            <span className="sr-only">Email is managed by your sign-in provider</span>
          </div>

          <div className="flex gap-2.5">
            <div className="relative shrink-0">
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={countryOpen}
                onClick={() => {
                  setCountryOpen((o) => !o)
                  setGenderOpen(false)
                }}
                className="inline-flex min-h-[52px] items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-900
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {COUNTRY_OPTIONS.find((c) => c.code === country)?.label || country}
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {countryOpen ? (
                <ul
                  role="listbox"
                  className="absolute left-0 top-full z-20 mt-1 min-w-[8.5rem] overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg"
                >
                  {COUNTRY_OPTIONS.map((opt) => (
                    <li key={opt.code} role="option" aria-selected={opt.code === country}>
                      <button
                        type="button"
                        className="w-full px-3.5 py-2.5 text-left text-sm font-medium text-gray-800 hover:bg-gray-50"
                        onClick={() => {
                          setCountry(opt.code)
                          setCountryOpen(false)
                        }}
                      >
                        {opt.label}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <label className={`${fieldShell} flex-1`}>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                value={national}
                onChange={(e) => setNational(e.target.value)}
                placeholder="Phone number"
                className="min-w-0 flex-1 bg-transparent py-3 outline-none placeholder:text-gray-400"
              />
            </label>
          </div>

          <div className="relative">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={genderOpen}
              aria-controls={genderListId}
              onClick={() => {
                setGenderOpen((o) => !o)
                setCountryOpen(false)
              }}
              className={`${fieldShell} w-full justify-between text-left`}
            >
              <span className={draftGender ? "text-gray-900" : "text-gray-400"}>{genderLabel}</span>
              <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            {genderOpen ? (
              <ul
                id={genderListId}
                role="listbox"
                className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg"
              >
                {GENDER_OPTIONS.map((opt) => (
                  <li key={opt.value} role="option" aria-selected={opt.value === draftGender}>
                    <button
                      type="button"
                      className="w-full px-4 py-3 text-left text-sm font-medium text-gray-800 hover:bg-gray-50"
                      onClick={() => {
                        setDraftGender(opt.value)
                        setGenderOpen(false)
                      }}
                    >
                      {opt.label}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        {error ? (
          <p className="mt-4 text-sm font-semibold text-red-500" role="alert">
            {error}
          </p>
        ) : (
          <p className="mt-4 text-xs font-medium text-gray-400 leading-relaxed">
            Email is managed by your sign-in provider and can’t be changed here.
          </p>
        )}
      </div>
    </div>,
    document.body
  )
}
