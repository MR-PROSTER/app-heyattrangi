"use client"

import { useState, useEffect } from "react"
import IdentityCard from "./identity/IdentityCard"
import { useProfile } from "./ProfileProvider"

/**
 * Identity surface only. Emergency Contact lives in its own card.
 * companionFields carry emergency values so Identity saves do not wipe them.
 */
export default function PersonalInfoSection() {
  const {
    user,
    setSaving,
    emergencyFields,
    setIdentitySnapshot,
  } = useProfile()

  const [companionFields, setCompanionFields] = useState({
    healthConcerns: user.patient?.healthConcerns?.join(", ") || "",
    emergencyContact: emergencyFields.emergencyContact,
    emergencyPhone: emergencyFields.emergencyPhone,
  })

  useEffect(() => {
    setCompanionFields((prev) => ({
      ...prev,
      healthConcerns: user.patient?.healthConcerns?.join(", ") || "",
    }))
  }, [user.patient?.healthConcerns])

  useEffect(() => {
    setCompanionFields((prev) => ({
      ...prev,
      emergencyContact: emergencyFields.emergencyContact,
      emergencyPhone: emergencyFields.emergencyPhone,
    }))
  }, [emergencyFields])

  return (
    <IdentityCard
      user={user}
      onSavingChange={setSaving}
      companionFields={companionFields}
      onIdentityValuesChange={setIdentitySnapshot}
    />
  )
}
