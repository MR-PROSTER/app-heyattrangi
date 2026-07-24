"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { UserRole } from "@prisma/client"
import PatientOnboarding from "@/components/onboarding/PatientOnboarding"

import DoctorOnboarding from "@/components/onboarding/DoctorOnboarding"
import AdminOnboarding from "@/components/onboarding/AdminOnboarding"

function OnboardingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialRole = searchParams.get("role") as UserRole | null
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)

  useEffect(() => {
    if (initialRole) {
      setSelectedRole(initialRole)
    }
  }, [initialRole])

  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 py-12 px-4 flex items-center justify-center font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-2">Welcome to Hey Attrangi!</h2>
          <p className="text-gray-500 text-center mb-8 font-medium">Please select your profile type to continue onboarding</p>
          
          <div className="space-y-4">
            <button
              onClick={() => setSelectedRole("PATIENT")}
              className="w-full p-5 text-left bg-white hover:bg-gray-50 border-2 border-gray-100 hover:border-[#ff6b00] rounded-2xl transition-all"
            >
              <h3 className="font-bold text-gray-900">I am a Patient</h3>
              <p className="text-xs text-gray-400 mt-1 font-medium">Find therapy and track wellbeing</p>
            </button>

            <button
              onClick={() => setSelectedRole("DOCTOR")}
              className="w-full p-5 text-left bg-white hover:bg-gray-50 border-2 border-gray-100 hover:border-[#ff6b00] rounded-2xl transition-all"
            >
              <h3 className="font-bold text-gray-900">I am a Therapist</h3>
              <p className="text-xs text-gray-400 mt-1 font-medium">Manage practice and connect</p>
            </button>


          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative font-sans">

      {selectedRole === "PATIENT" ? (
        <PatientOnboarding />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 py-12 px-4">
          <div className="max-w-3xl mx-auto pt-6">

            {selectedRole === "DOCTOR" && <DoctorOnboarding />}
            {selectedRole === "ADMIN" && <AdminOnboarding />}
          </div>
        </div>
      )}
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-blue-50">
      <p className="text-gray-600">Loading onboarding form...</p>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OnboardingContent />
    </Suspense>
  )
}
