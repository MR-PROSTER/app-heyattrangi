"use client"

import { useEffect, useState } from "react"
import ProfileCard from "../ui/ProfileCard"
import ProfileHeader from "../ui/ProfileHeader"
import { PROFILE_FIELD_GRID } from "../ui/profileChrome"
import EmergencyContactField from "./EmergencyContactField"
import { useProfile } from "../ProfileProvider"
import {
  readStoredRelationship,
  validateEmergencyName,
  validateIndianMobile,
  validateRelationship,
  writeStoredRelationship,
} from "./emergencyUtils"

type EditableKey = "name" | "relationship" | "phone"

export default function EmergencyContactCard() {
  const {
    user,
    identitySnapshot,
    healthConcerns,
    setSaving,
    setEmergencyFields,
  } = useProfile()
  const onSavingChange = setSaving
  const onEmergencyValuesChange = setEmergencyFields

  const [name, setName] = useState(user.patient?.emergencyContactName || "")
  const [phone, setPhone] = useState(user.patient?.emergencyContactPhone || "")
  const [relationship, setRelationship] = useState("")

  const [editing, setEditing] = useState<EditableKey | null>(null)
  const [draft, setDraft] = useState("")
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [savingField, setSavingField] = useState<EditableKey | null>(null)

  useEffect(() => {
    setName(user.patient?.emergencyContactName || "")
    setPhone(user.patient?.emergencyContactPhone || "")
  }, [user.patient?.emergencyContactName, user.patient?.emergencyContactPhone])

  useEffect(() => {
    setRelationship(
      readStoredRelationship(user.id, user.patient?.emergencyRelationship)
    )
  }, [user.id, user.patient?.emergencyRelationship])

  useEffect(() => {
    onEmergencyValuesChange({
      emergencyContact: name,
      emergencyPhone: phone,
    })
  }, [name, phone, onEmergencyValuesChange])

  const startEdit = (key: EditableKey) => {
    if (savingField) return
    setEditing(key)
    setFieldError(null)
    setDraft(key === "name" ? name : key === "phone" ? phone : relationship)
  }

  const cancelEdit = () => {
    if (savingField) return
    setEditing(null)
    setDraft("")
    setFieldError(null)
  }

  const saveEdit = async () => {
    if (!editing || savingField) return

    const validators: Record<EditableKey, (v: string) => string | null> = {
      name: validateEmergencyName,
      phone: validateIndianMobile,
      relationship: validateRelationship,
    }
    const err = validators[editing](draft)
    if (err) {
      setFieldError(err)
      return
    }

    setSavingField(editing)
    setFieldError(null)
    onSavingChange(true)

    try {
      if (editing === "relationship") {
        const next = draft.trim()
        writeStoredRelationship(user.id, next)
        setRelationship(next)
      } else {
        const nextName = editing === "name" ? draft.trim() : name
        const nextPhone = editing === "phone" ? draft.trim() : phone

        const response = await fetch("/api/profile/patient", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: identitySnapshot.name,
            age: identitySnapshot.age ? parseInt(identitySnapshot.age, 10) : null,
            gender: identitySnapshot.gender || null,
            healthConcerns: healthConcerns
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            emergencyContact: nextName || null,
            emergencyPhone: nextPhone || null,
          }),
        })

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error || "Failed to save")
        }

        setName(nextName)
        setPhone(nextPhone)
      }

      setEditing(null)
      setDraft("")
    } catch (e) {
      setFieldError(e instanceof Error ? e.message : "Failed to save")
    } finally {
      setSavingField(null)
      window.setTimeout(() => onSavingChange(false), 600)
    }
  }

  return (
    <ProfileCard id="emergency" aria-labelledby="emergency-heading">
      <div>
        <ProfileHeader
          titleId="emergency-heading"
          title="Emergency Contact"
          description="Someone we can reach if you need urgent support."
        />

        <div className={`${PROFILE_FIELD_GRID}`}>
          <EmergencyContactField
            label="Name"
            value={editing === "name" ? draft : name}
            type="text"
            autoComplete="name"
            isEditing={editing === "name"}
            isSaving={savingField === "name"}
            error={editing === "name" ? fieldError : null}
            onStartEdit={() => startEdit("name")}
            onChange={setDraft}
            onSave={saveEdit}
            onCancel={cancelEdit}
          />

          <EmergencyContactField
            label="Relationship"
            value={editing === "relationship" ? draft : relationship}
            type="relationship"
            isEditing={editing === "relationship"}
            isSaving={savingField === "relationship"}
            error={editing === "relationship" ? fieldError : null}
            onStartEdit={() => startEdit("relationship")}
            onChange={setDraft}
            onSave={saveEdit}
            onCancel={cancelEdit}
          />

          <EmergencyContactField
            label="Phone"
            value={editing === "phone" ? draft : phone}
            type="tel"
            autoComplete="tel"
            placeholder="10-digit Indian mobile"
            className="md:col-span-2"
            isEditing={editing === "phone"}
            isSaving={savingField === "phone"}
            error={editing === "phone" ? fieldError : null}
            onStartEdit={() => startEdit("phone")}
            onChange={setDraft}
            onSave={saveEdit}
            onCancel={cancelEdit}
          />
        </div>
      </div>
    </ProfileCard>
  )
}
