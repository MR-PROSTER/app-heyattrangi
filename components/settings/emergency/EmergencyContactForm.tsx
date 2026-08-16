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

interface Contact {
  id?: string
  name: string
  phone: string
  relationship: string
}

interface EmergencyContactFormProps {
  initial: EmergencyInitial
  initialContacts: Contact[]
}

export default function EmergencyContactForm({ initial, initialContacts }: EmergencyContactFormProps) {
  const router = useRouter()

  // Ensure at least 2 contacts on start
  const getInitialContactsList = (): Contact[] => {
    const list = [...initialContacts]
    while (list.length < 2) {
      list.push({ name: "", phone: "", relationship: "" })
    }
    return list
  }

  const [contacts, setContacts] = useState<Contact[]>(getInitialContactsList)
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({})
  const [saving, setSaving] = useState(false)
  const baseline = useRef("")

  useEffect(() => {
    baseline.current = JSON.stringify(initialContacts)
  }, [initialContacts])

  const snap = JSON.stringify(contacts)
  const isDirty = snap !== baseline.current

  const validate = () => {
    const nextErrors: Record<number, Record<string, string>> = {}
    let isValid = true

    contacts.forEach((contact, idx) => {
      const itemErrors: Record<string, string> = {}
      
      const nErr = validateEmergencyName(contact.name)
      if (nErr) {
        itemErrors.name = nErr
        isValid = false
      }

      const rErr = validateRelationship(contact.relationship)
      if (rErr) {
        itemErrors.relationship = rErr
        isValid = false
      }

      if (!contact.phone.trim()) {
        itemErrors.phone = "Phone number is required"
        isValid = false
      } else {
        const pErr = validateIndianMobile(contact.phone)
        if (pErr) {
          itemErrors.phone = pErr
          isValid = false
        }
      }

      if (Object.keys(itemErrors).length > 0) {
        nextErrors[idx] = itemErrors
      }
    })

    setErrors(nextErrors)
    return isValid
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
          emergencyContacts: contacts.map(c => ({
            name: c.name.trim(),
            phone: c.phone.trim(),
            relationship: c.relationship,
          })),
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error((data as { error?: string, message?: string }).message || (data as { error?: string }).error || "Failed to save")
      }

      baseline.current = snap
      toast.success("Emergency contacts saved successfully")
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save changes")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (isDirty) {
      setContacts(getInitialContactsList())
      setErrors({})
    }
    router.push("/dashboard/settings")
  }

  const handleUpdateContact = (index: number, field: keyof Contact, value: string) => {
    setContacts(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
    // Clear error for field
    if (errors[index]?.[field]) {
      setErrors(prev => {
        const next = { ...prev }
        if (next[index]) {
          const itemErrors = { ...next[index] }
          delete itemErrors[field]
          if (Object.keys(itemErrors).length === 0) {
            delete next[index]
          } else {
            next[index] = itemErrors
          }
        }
        return next
      })
    }
  }

  const handleAddContact = () => {
    if (contacts.length >= 5) {
      toast.error("You can add at most 5 emergency contacts.")
      return
    }
    setContacts(prev => [...prev, { name: "", phone: "", relationship: "" }])
  }

  const handleRemoveContact = (index: number) => {
    if (contacts.length <= 2) {
      toast.error("You must have at least 2 emergency contacts.")
      return
    }
    setContacts(prev => prev.filter((_, idx) => idx !== index))
    setErrors(prev => {
      const next: Record<number, Record<string, string>> = {}
      let newIdx = 0
      Object.keys(prev).forEach(key => {
        const k = parseInt(key, 10)
        if (k !== index) {
          next[newIdx] = prev[k]
          newIdx++
        }
      })
      return next
    })
  }

  return (
    <div className="space-y-6 pt-2">
      <Toaster position="top-center" richColors closeButton />

      <div className="flex items-center justify-between">
        <span className="text-[12px] font-bold text-zinc-400 uppercase tracking-wider">
          Emergency Contacts ({contacts.length} of 5)
        </span>
      </div>

      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault()
          void handleSave()
        }}
      >
        <div className="space-y-6">
          {contacts.map((contact, index) => (
            <div
              key={index}
              className="p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] relative space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-extrabold text-[var(--color-text-primary)]">
                  Contact #{index + 1}
                </span>
                {contacts.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveContact(index)}
                    className="text-[12px] font-bold text-rose-500 hover:text-rose-600 transition-colors duration-150"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SettingsInput
                  label="Name"
                  value={contact.name}
                  onChange={(e) => handleUpdateContact(index, "name", e.target.value)}
                  error={errors[index]?.name}
                  required
                />
                <SettingsSelect
                  label="Relationship"
                  value={contact.relationship}
                  onChange={(e) => handleUpdateContact(index, "relationship", e.target.value)}
                  options={RELATIONSHIP_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                  placeholder="Select relationship…"
                  error={errors[index]?.relationship}
                />
              </div>

              <SettingsInput
                label="Phone Number"
                type="tel"
                value={contact.phone}
                onChange={(e) => handleUpdateContact(index, "phone", e.target.value)}
                error={errors[index]?.phone}
                required
              />
            </div>
          ))}
        </div>

        {contacts.length < 5 && (
          <button
            type="button"
            onClick={handleAddContact}
            className="w-full py-3 border-2 border-dashed border-[var(--color-border)] rounded-[var(--radius-md)]
              text-[var(--text-sm)] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]
              hover:border-[var(--color-text-primary)] transition-all duration-150 flex items-center justify-center gap-1.5"
          >
            + Add Another Contact
          </button>
        )}

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
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  )
}
