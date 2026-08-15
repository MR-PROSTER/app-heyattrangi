"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { User, Patient, PlanType } from "@prisma/client"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import ProfileCard from "../ui/ProfileCard"
import ProfileDivider from "../ui/ProfileDivider"
import { PROFILE_FIELD_GRID, PROFILE_SCROLL_MT } from "../ui/profileChrome"
import IdentityAvatar from "./IdentityAvatar"
import IdentityField from "./IdentityField"
import ReadonlyField from "./ReadonlyField"
import ProfileStreakCard from "./ProfileStreakCard"
import ProfileMobileCalendar from "./ProfileMobileCalendar"
import EditProfileScreen, { type EditProfileValues } from "./EditProfileScreen"
import { ChevronLeft, ChevronRight, Settings, Trophy, Smile, Edit3, Bell } from "lucide-react"
import UnlockFeaturesCard from "@/components/premium/UnlockFeaturesCard"
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
      <div className="md:hidden -mx-4 sm:-mx-6 min-h-screen px-4 pb-24 flex flex-col gap-6" style={{ backgroundColor: "#ffffff" }}>
        
        {/* Custom Header */}
        <header className="flex items-center justify-between py-4 select-none">
          <Link href="/patient/dashboard" className="text-slate-800 hover:opacity-80 transition-opacity">
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </Link>
          
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Profile</h1>
          
          <button
            onClick={() => setShowEditProfile(true)}
            className="text-slate-800 hover:opacity-80 transition-opacity"
            aria-label="Edit Profile"
          >
            <Settings className="w-6 h-6" />
          </button>
        </header>

        {/* Avatar & Details Section */}
        <div className="flex flex-col items-center pt-2 select-none">
          {/* Avatar */}
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-sky-100/60 border-[3px] border-white shadow-sm ring-1 ring-black/5">
            <Image
              src={user.image || "/images/default_user.png"}
              alt={displayName}
              fill
              className="object-cover bg-[#E0F2FE]"
              priority
            />
          </div>
          
          {/* Name */}
          <h2 className="mt-4 text-xl font-bold text-slate-850 tracking-tight text-center">
            {displayName}
          </h2>
          
          {/* Email & Checkmark */}
          <div className="mt-1 flex items-center gap-1.5 justify-center">
            <span className="text-sm font-medium text-slate-500">{user.email || "—"}</span>
            {user.email && (
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#22C55E] text-white shadow-sm">
                <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
          </div>
        </div>

        {/* Card 1 (Stats Card) */}
        <div className="w-full rounded-[28px] border border-slate-900 p-4 sm:p-5 flex flex-row items-center justify-between text-center select-none shadow-[0_4px_20px_rgba(0,0,0,0.01)] mt-2" style={{ backgroundColor: "#FFF9F6" }}>
          {/* Active Days */}
          <div className="flex-1 flex flex-col items-center">
            <Trophy className="w-5 h-5 text-[#3B82F6] stroke-[2]" />
            <span className="text-xl sm:text-2xl font-black text-slate-800 mt-1">
              {streakDays || 8}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-bold mt-0.5">
              Active days
            </span>
          </div>

          <div className="h-10 border-r border-slate-100" />

          {/* Mood check-ins */}
          <div className="flex-1 flex flex-col items-center">
            <Smile className="w-5 h-5 text-[#3B82F6] stroke-[2]" />
            <span className="text-xl sm:text-2xl font-black text-slate-800 mt-1">
              {streakDays ? streakDays + 2 : 6}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-bold mt-0.5">
              Mood check-ins
            </span>
          </div>

          <div className="h-10 border-r border-slate-100" />

          {/* Reflections */}
          <div className="flex-1 flex flex-col items-center">
            <Edit3 className="w-5 h-5 text-[#3B82F6] stroke-[2]" />
            <span className="text-xl sm:text-2xl font-black text-slate-800 mt-1">
              {streakDays ? Math.max(1, Math.floor(streakDays / 3)) : 2}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-bold mt-0.5">
              Reflections
            </span>
          </div>
        </div>

        <UnlockFeaturesCard />

        {/* Card 3 (Founder Card) */}
        <Link href="/dashboard/founder-message" className="w-full mt-auto block">
          <div className="w-full bg-white rounded-[24px] p-4 flex items-center gap-4 border border-slate-100 hover:border-slate-200 transition-colors shadow-[0_2px_12px_rgba(0,0,0,0.015)] cursor-pointer select-none">
            <div className="w-11 h-11 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 shrink-0 shadow-sm border border-orange-100/30">
              <Bell className="w-5 h-5 fill-current" />
            </div>
            <span className="text-[12px] font-black tracking-wide text-slate-800 font-sans">
              A MESSAGE FROM OUR FOUNDER
            </span>
            <ChevronRight className="w-5 h-5 text-slate-400 ml-auto stroke-[2.5]" />
          </div>
        </Link>

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
