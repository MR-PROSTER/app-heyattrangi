import { Suspense } from "react"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import ProfileSettings from "@/components/profile/ProfileSettings"


async function ProfileContent() {
  const user = await getCurrentUser()

  if (!user) return null

  return (
    <div className="flex-1 h-full min-h-0 w-full bg-white flex flex-col">
      <ProfileSettings
        user={{
          ...user,
          patient: user.patient || null,
        }}
      />
    </div>
  )
}

export default function PatientProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex-1 h-full flex items-center justify-center bg-white animate-pulse">
        <div className="text-gray-400 font-medium">Loading profile...</div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  )
}

