"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast, Toaster } from "sonner"
import SettingsInput, { SettingsSelect } from "../SettingsInput"
import {
  RELATIONSHIP_OPTIONS,
  validateEmergencyName,
  validateIndianMobile,
  validateRelationship,
} from "@/components/profile/emergency/emergencyUtils"

export interface EmergencyInitial {
  name: string
  age: string
  gender: string
  healthConcerns: string[]
  contactName: string
  contactPhone: string
  relationship: string
}

interface EmergencyContactFormProps {
  initial: EmergencyInitial
}

/** Single emergency contact — Name, Relationship, Phone. No OTP. */
export default function EmergencyContactForm({ initial }: EmergencyContactFormProps) {
  const router = useRouter()
  const [contactName, setContactName] = useState(initial.contactName)
  const [relationship, setRelationship] = useState(initial.relationship)
  const [phone, setPhone] = useState(initial.contactPhone)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const baseline = useRef("")

  useEffect(() => {
    baseline.current = JSON.stringify({
      contactName: initial.contactName,
      relationship: initial.relationship,
      phone: initial.contactPhone,
    })
  }, [initial.contactName, initial.contactPhone, initial.relationship])

  const snap = JSON.stringify({ contactName, relationship, phone })
  const isDirty = Boolean(baseline.current) && snap !== baseline.current

  const validate = () => {
    const next: Record<string, string> = {}
    const n = validateEmergencyName(contactName)
    if (n) next.contactName = n
    const r = validateRelationship(relationship)
    if (r) next.relationship = r
    if (!phone.trim()) next.phone = "Phone number is required"
    else {
      const p = validateIndianMobile(phone)
      if (p) next.phone = p
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSave = async () => {
    if (saving) return
    if (!validate()) {
      toast.error("Please fix the highlighted fields.")
      return
    }
    setSaving(true)
    try {
      const response = await fetch("/api/profile/patient", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: initial.name,
          age: initial.age ? parseInt(initial.age, 10) : null,
          gender: initial.gender || null,
          healthConcerns: initial.healthConcerns,
          emergencyContact: contactName.trim(),
          emergencyPhone: phone.trim(),
          emergencyRelationship: relationship || null,
        }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error || "Failed to save")
      }
      baseline.current = snap
      toast.success("Emergency contact saved")
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save changes")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (isDirty) {
      setContactName(initial.contactName)
      setRelationship(initial.relationship)
      setPhone(initial.contactPhone)
      setErrors({})
    }
    router.push("/dashboard/settings")
  }

  return (
    <form
      className="space-y-4 pt-2"
      onSubmit={(e) => {
        e.preventDefault()
        void handleSave()
      }}
    >
      <Toaster position="top-center" richColors closeButton />
      <SettingsInput
        label="Name"
        value={contactName}
        onChange={(e) => setContactName(e.target.value)}
        autoComplete="name"
        error={errors.contactName}
        required
      />
      <SettingsSelect
        label="Relationship"
        value={relationship}
        onChange={(e) => setRelationship(e.target.value)}
        options={RELATIONSHIP_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        placeholder="Select…"
        error={errors.relationship}
      />
      <SettingsInput
        label="Phone Number"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        autoComplete="tel"
        error={errors.phone}
        required
      />

      <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-4">
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-[var(--radius-md)]
            border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-[var(--text-sm)] font-semibold
            text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] transition-colors duration-150
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !isDirty}
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-[var(--radius-md)]
            bg-[var(--color-brand)] px-4 text-[var(--text-sm)] font-semibold text-white
            hover:bg-[var(--color-brand-dark)] transition-colors duration-150
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2
            disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  )
}
