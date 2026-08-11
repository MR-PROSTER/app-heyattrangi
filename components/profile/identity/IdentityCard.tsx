"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { User, Patient, PlanType } from "@prisma/client"
import { useRouter } from "next/navigation"
import ProfileCard from "../ui/ProfileCard"
import ProfileDivider from "../ui/ProfileDivider"
import { PROFILE_FIELD_GRID, PROFILE_SCROLL_MT } from "../ui/profileChrome"
import IdentityAvatar from "./IdentityAvatar"
import IdentityField from "./IdentityField"
import ReadonlyField from "./ReadonlyField"
import ProfileStreakCard from "./ProfileStreakCard"
import ProfileMobileCalendar from "./ProfileMobileCalendar"
import EditProfileScreen, { type EditProfileValues } from "./EditProfileScreen"
import {
  formatMemberId,
  formatMemberSince,
  formatPlanLabel,
  formatRelativeUpdated,
  validateAge,
  validateGender,
  validateName,
  validatePhone,
} from "./identityUtils"

type EditableKey = "name" | "phone" | "age" | "gender"

interface IdentityCardProps {
  user: User & {
    patient?: Patient | null
  }
  onSavingChange: (isSaving: boolean) => void
  /** Latest emergency + health values so identity saves do not wipe other profile data. */
  companionFields: {
    healthConcerns: string
    emergencyContact: string
    emergencyPhone: string
  }
  onIdentityValuesChange?: (values: { name: string; age: string; gender: string }) => void
}

function phoneStorageKey(userId: string) {
  return `attrangi:profile-phone:${userId}`
}

function readStoredPhone(userId: string): string {
  if (typeof window === "undefined") return ""
  try {
    return localStorage.getItem(phoneStorageKey(userId)) || ""
  } catch {
    return ""
  }
}

function writeStoredPhone(userId: string, phone: string) {
  try {
    if (!phone.trim()) localStorage.removeItem(phoneStorageKey(userId))
    else localStorage.setItem(phoneStorageKey(userId), phone.trim())
  } catch {
    /* ignore quota / private mode */
  }
}

export default function IdentityCard({
  user,
  onSavingChange,
  companionFields,
  onIdentityValuesChange,
}: IdentityCardProps) {
  const router = useRouter()

  const [name, setName] = useState(user.name || "")
  const [age, setAge] = useState(user.patient?.age?.toString() || "")
  const [gender, setGender] = useState(user.patient?.gender || "")
  const [phone, setPhone] = useState("")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [showCalendar, setShowCalendar] = useState(true)
  const [showEditProfile, setShowEditProfile] = useState(false)

  const [editing, setEditing] = useState<EditableKey | null>(null)
  const [draft, setDraft] = useState("")
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [savingField, setSavingField] = useState<EditableKey | null>(null)

  const serverUpdatedAt = useMemo(() => {
    const times = [user.updatedAt, user.patient?.updatedAt]
      .filter(Boolean)
      .map((d) => new Date(d as Date).getTime())
    return times.length ? new Date(Math.max(...times)) : new Date(user.createdAt)
  }, [user.updatedAt, user.patient?.updatedAt, user.createdAt])

  const [lastUpdatedAt, setLastUpdatedAt] = useState(serverUpdatedAt)
  const [relativeLabel, setRelativeLabel] = useState(() => formatRelativeUpdated(serverUpdatedAt))

  useEffect(() => {
    onIdentityValuesChange?.({ name, age, gender })
  }, [name, age, gender, onIdentityValuesChange])

  useEffect(() => {
    setName(user.name || "")
    setAge(user.patient?.age?.toString() || "")
    setGender(user.patient?.gender || "")
    setLastUpdatedAt(serverUpdatedAt)
  }, [user.name, user.patient?.age, user.patient?.gender, serverUpdatedAt])

  useEffect(() => {
    setPhone(readStoredPhone(user.id))
  }, [user.id])

  useEffect(() => {
    setRelativeLabel(formatRelativeUpdated(lastUpdatedAt))
    const id = window.setInterval(() => {
      setRelativeLabel(formatRelativeUpdated(lastUpdatedAt))
    }, 30_000)
    return () => window.clearInterval(id)
  }, [lastUpdatedAt])

  const displayName = (name || user.email || "Individual User").trim()
  const memberSince = formatMemberSince(user.createdAt)
  const planLabel = formatPlanLabel(user.plan as PlanType | string)
  const memberIdFull = user.id
  const memberIdShort = formatMemberId(user.id)
  const createdLabel = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const patchProfile = useCallback(
    async (next: { name: string; age: string; gender: string }) => {
      const response = await fetch("/api/profile/patient", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: next.name,
          age: next.age ? parseInt(next.age, 10) : null,
          gender: next.gender || null,
          healthConcerns: companionFields.healthConcerns
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          emergencyContact: companionFields.emergencyContact || null,
          emergencyPhone: companionFields.emergencyPhone || null,
        }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Failed to save")
      }
      router.refresh()
    },
    [companionFields, router]
  )

  const startEdit = (key: EditableKey) => {
    if (savingField) return
    setEditing(key)
    setFieldError(null)
    const current =
      key === "name" ? name : key === "phone" ? phone : key === "age" ? age : gender
    setDraft(current)
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
      name: validateName,
      phone: validatePhone,
      age: validateAge,
      gender: validateGender,
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
      if (editing === "phone") {
        // Patient phone is not in the current PATCH contract — persist locally per user until API supports it.
        const nextPhone = draft.trim()
        writeStoredPhone(user.id, nextPhone)
        setPhone(nextPhone)
        setLastUpdatedAt(new Date())
      } else {
        const next = {
          name: editing === "name" ? draft.trim() : name,
          age: editing === "age" ? draft.trim() : age,
          gender: editing === "gender" ? draft : gender,
        }
        await patchProfile(next)
        setName(next.name)
        setAge(next.age)
        setGender(next.gender)
        setLastUpdatedAt(new Date())
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

  const handleFileSelect = (file: File) => {
    const reader = new FileReader()
    reader.onloadend = () => setPreviewUrl(reader.result as string)
    reader.readAsDataURL(file)
    void uploadProfilePhoto(file)
  }

  const uploadProfilePhoto = async (file: File) => {
    setIsUploading(true)
    onSavingChange(true)
    try {
      const uploadData = new FormData()
      uploadData.append("photo", file)
      const response = await fetch("/api/profile/patient/upload-photo", {
        method: "POST",
        body: uploadData,
      })
      if (response.ok) {
        router.refresh()
        setPreviewUrl(null)
        setLastUpdatedAt(new Date())
      }
    } catch (error) {
      console.error("Error uploading profile photo:", error)
    } finally {
      setIsUploading(false)
      onSavingChange(false)
    }
  }

  const removePhoto = async () => {
    onSavingChange(true)
    try {
      const response = await fetch("/api/profile/patient", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          image: null,
        }),
      })
      if (response.ok) {
        router.refresh()
        setPreviewUrl(null)
        setLastUpdatedAt(new Date())
      }
    } catch (error) {
      console.error("Failed to reset photo:", error)
    } finally {
      window.setTimeout(() => onSavingChange(false), 600)
    }
  }

  const saveEditProfile = async (values: EditProfileValues) => {
    onSavingChange(true)
    try {
      writeStoredPhone(user.id, values.phone.trim())
      setPhone(values.phone.trim())

      const nameChanged = values.name !== name
      const ageChanged = values.age !== age
      const genderChanged = values.gender !== gender

      if (nameChanged || ageChanged || genderChanged) {
        await patchProfile({
          name: values.name,
          age: values.age,
          gender: values.gender,
        })
        setName(values.name)
        setAge(values.age)
        setGender(values.gender)
      }

      setLastUpdatedAt(new Date())
    } finally {
      window.setTimeout(() => onSavingChange(false), 600)
    }
  }

  const streakDays = user.patient?.currentStreak ?? 0

  const fieldsBlock = (
    <div className={PROFILE_FIELD_GRID}>
      <div className="space-y-5">
        <IdentityField
          label="Full Name"
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
        <IdentityField
          label="Phone"
          value={editing === "phone" ? draft : phone}
          type="tel"
          autoComplete="tel"
          placeholder="10-digit or +country code"
          isEditing={editing === "phone"}
          isSaving={savingField === "phone"}
          error={editing === "phone" ? fieldError : null}
          onStartEdit={() => startEdit("phone")}
          onChange={setDraft}
          onSave={saveEdit}
          onCancel={cancelEdit}
        />
        <IdentityField
          label="Age"
          value={editing === "age" ? draft : age}
          type="number"
          isEditing={editing === "age"}
          isSaving={savingField === "age"}
          error={editing === "age" ? fieldError : null}
          onStartEdit={() => startEdit("age")}
          onChange={setDraft}
          onSave={saveEdit}
          onCancel={cancelEdit}
        />
      </div>

      <div className="space-y-5">
        <ReadonlyField
          label="Email"
          value={user.email || "—"}
          hint="Managed by your sign-in provider (OAuth)"
        />
        <IdentityField
          label="Gender"
          value={editing === "gender" ? draft : gender}
          type="select"
          options={[
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" },
            { value: "Other", label: "Other" },
            { value: "Prefer not to say", label: "Prefer not to say" },
          ]}
          isEditing={editing === "gender"}
          isSaving={savingField === "gender"}
          error={editing === "gender" ? fieldError : null}
          onStartEdit={() => startEdit("gender")}
          onChange={setDraft}
          onSave={saveEdit}
          onCancel={cancelEdit}
        />
        <ReadonlyField
          label="Member ID"
          value={memberIdShort}
          title={memberIdFull}
          hint="Read only"
        />
        <ReadonlyField label="Created Date" value={createdLabel} hint="Account creation date" />
      </div>
    </div>
  )

  return (
    <section id="identity" aria-labelledby="identity-heading" className={PROFILE_SCROLL_MT}>
      {/* Mobile — Image 1 profile-home pattern */}
      <div className="md:hidden -mx-4 sm:-mx-6">
        <div className="bg-gradient-to-b from-[#E8EAF6] via-[#EEF0F8] to-[#F5F6FB] px-4 sm:px-6 pt-2 pb-6">
          <div className="flex flex-col items-center text-center pt-2 pb-5">
            <IdentityAvatar
              size="lg"
              name={name}
              email={user.email}
              image={user.image}
              previewUrl={previewUrl}
              isUploading={isUploading}
              onSelectFile={handleFileSelect}
              onRemovePhoto={user.image ? removePhoto : undefined}
            />

            <h2
              id="identity-heading"
              className="mt-4 text-[22px] font-bold text-gray-900 tracking-tight max-w-[90%] truncate"
            >
              {displayName}
            </h2>

            <div className="mt-1.5 flex items-center justify-center gap-1.5 max-w-[92%]">
              <p className="text-sm font-medium text-gray-500 truncate">{user.email || "—"}</p>
              {user.email ? (
                <span
                  className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#22C55E] text-white"
                  title="Verified email"
                  aria-label="Verified email"
                >
                  <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => setShowEditProfile(true)}
                aria-label="Edit profile"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400
                  hover:bg-white/70 hover:text-gray-700 transition-colors duration-150
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
            </div>

            <p className="mt-2 text-xs font-medium text-gray-400">
              {memberSince}
              <span className="mx-1.5 text-gray-300" aria-hidden="true">
                ·
              </span>
              {planLabel} plan
            </p>
          </div>

          <ProfileStreakCard streakDays={streakDays} className="mb-5" />
        </div>

        {showCalendar ? (
          <ProfileMobileCalendar onClose={() => setShowCalendar(false)} />
        ) : (
          <div className="bg-white px-4 pt-3 pb-1">
            <button
              type="button"
              onClick={() => setShowCalendar(true)}
              className="w-full min-h-11 rounded-2xl border border-gray-100 bg-gray-50 text-sm font-semibold text-gray-700
                hover:bg-gray-100 transition-colors duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Show calendar
            </button>
          </div>
        )}

        <div className="bg-white px-4 sm:px-6 pt-5 pb-2 border-t border-gray-50">
          <div className="flex items-center justify-between gap-3 mb-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">
              Identity details
            </p>
            <button
              type="button"
              onClick={() => setShowEditProfile(true)}
              className="text-sm font-bold text-[#4A6CF7] hover:text-[#3B5BDB] transition-colors duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            >
              Edit
            </button>
          </div>
          {fieldsBlock}
        </div>
      </div>

      <EditProfileScreen
        open={showEditProfile}
        name={name}
        email={user.email}
        image={user.image}
        previewUrl={previewUrl}
        isUploading={isUploading}
        age={age}
        phone={phone}
        gender={gender}
        isSaving={Boolean(savingField)}
        onClose={() => setShowEditProfile(false)}
        onSave={saveEditProfile}
        onSelectFile={handleFileSelect}
        onRemovePhoto={user.image ? removePhoto : undefined}
      />

      {/* Desktop — existing settings card */}
      <div className="hidden md:block">
        <ProfileCard aria-labelledby="identity-heading-desktop" className="!scroll-mt-10">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 mb-5 sm:mb-6">
              <IdentityAvatar
                name={name}
                email={user.email}
                image={user.image}
                previewUrl={previewUrl}
                isUploading={isUploading}
                onSelectFile={handleFileSelect}
                onRemovePhoto={user.image ? removePhoto : undefined}
              />

              <div className="min-w-0 flex-1">
                <h2
                  id="identity-heading-desktop"
                  className="text-lg sm:text-xl font-black text-gray-900 tracking-tight uppercase truncate"
                >
                  {displayName}
                </h2>
                <p className="mt-1 text-sm font-medium text-gray-500">
                  {memberSince}
                  <span className="text-gray-300 mx-2" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-gray-600">{planLabel} plan</span>
                </p>
                <p className="mt-1 text-xs font-medium text-gray-400" aria-live="polite">
                  Last updated {relativeLabel}
                </p>
              </div>
            </div>

            <ProfileDivider className="my-5" />
            {fieldsBlock}
          </div>
        </ProfileCard>
      </div>
    </section>
  )
}
