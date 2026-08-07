"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { toast, Toaster } from "sonner"
import {
  Bell,
  User,
  Globe,
  Lock,
  Fingerprint,
  LifeBuoy,
  CreditCard,
  LogOut,
  Trash2,
  ChevronRight,
} from "lucide-react"
import { performClientSignOut } from "@/lib/auth/performClientSignOut"

const DeleteAccountDialog = dynamic(
  () => import("@/components/profile/account/DeleteAccountDialog"),
  { ssr: false }
)

interface SettingsClientProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    plan?: string | null
    patient?: {
      id: string
    } | null
  }
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [fingerprintEnabled, setFingerprintEnabled] = useState(false)
  const signoutInFlight = useRef(false)
  const deleteInFlight = useRef(false)

  const handleSignOut = async () => {
    if (signoutInFlight.current || isSigningOut) return
    signoutInFlight.current = true
    setIsSigningOut(true)

    try {
      const result = await performClientSignOut({ redirectOnError: false })
      if (!result.ok) {
        toast.error(result.error || "Couldn't sign out. Please try again.")
        setIsSigningOut(false)
        signoutInFlight.current = false
      }
    } catch {
      toast.error("Couldn't sign out. Please try again.")
      setIsSigningOut(false)
      signoutInFlight.current = false
    }
  }

  const handleDeleteConfirm = async () => {
    if (deleteConfirmation !== "DELETE" || isDeleting || deleteInFlight.current) return
    deleteInFlight.current = true
    setIsDeleting(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const result = await performClientSignOut({ redirectOnError: false })
      if (!result.ok) {
        toast.error(result.error || "Couldn't delete account. Please try again.")
        setIsDeleting(false)
        deleteInFlight.current = false
      }
    } catch {
      toast.error("Couldn't delete account. Please try again.")
      setIsDeleting(false)
      deleteInFlight.current = false
    }
  }

  const handleCopyId = () => {
    const idToCopy = user.patient?.id || user.id
    navigator.clipboard.writeText(idToCopy)
    toast.success("ID copied to clipboard!")
  }

  const toggleFingerprint = () => {
    setFingerprintEnabled(!fingerprintEnabled)
    toast.info(`Fingerprint auth turned ${!fingerprintEnabled ? "On" : "Off"}`)
  }

  return (
    <div className="space-y-6 pb-12 select-none animate-in fade-in duration-300">
      <Toaster position="top-center" richColors closeButton />

      {/* Unlock All Features Card (Upgrade Banner) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#FFF8D6] to-[#FFF1BE] rounded-3xl p-6 border border-amber-200/50 shadow-sm flex items-center justify-between">
        <div className="space-y-3.5 max-w-[70%]">
          <h2 className="text-zinc-900 font-extrabold text-[20px] tracking-tight">Unlock All Features</h2>
          <p className="text-zinc-600 text-[13px] font-semibold leading-relaxed">
            AI Insights, Weekly Summaries, Advanced Dashboard, Longer Recordings and more.
          </p>
          <Link
            href="/dashboard/settings/subscription"
            className="inline-block bg-[#1A1A1A] hover:bg-[#333333] active:scale-[0.98] text-white text-[13px] font-extrabold px-6 py-3 rounded-2xl shadow-sm transition-all text-center"
          >
            Upgrade to Premium
          </Link>
        </div>
        <div className="w-16 h-16 shrink-0 text-amber-500/80 drop-shadow-md pr-1">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M12 2L2 12l10 10 10-10L12 2zm0 3.2L18.8 12 12 18.8 5.2 12 12 5.2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
      </div>

      {/* Group 1: General Info */}
      <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden divide-y divide-zinc-50">
        <Link
          href="/dashboard/settings/notifications"
          className="flex items-center justify-between p-4 hover:bg-zinc-50/80 transition-all group"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <span className="text-[15px] font-bold text-zinc-800 ml-4">Notifications</span>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          href="/dashboard/settings/personal-details"
          className="flex items-center justify-between p-4 hover:bg-zinc-50/80 transition-all group"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <span className="text-[15px] font-bold text-zinc-800 ml-4">Edit Name</span>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          href="/dashboard/settings/language"
          className="flex items-center justify-between p-4 hover:bg-zinc-50/80 transition-all group"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <span className="text-[15px] font-bold text-zinc-800 ml-4">Language</span>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Group 2: Privacy / Biometrics commented out per user request
      <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden divide-y divide-zinc-50">
        <Link
          href="/dashboard/settings/privacy"
          className="flex items-center justify-between p-4 hover:bg-zinc-50/80 transition-all group"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <span className="text-[15px] font-bold text-zinc-800 ml-4">Set Up Passcode</span>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <button
          onClick={toggleFingerprint}
          className="w-full flex items-center justify-between p-4 hover:bg-zinc-50/80 transition-all text-left"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-500 flex items-center justify-center">
              <Fingerprint className="w-5 h-5" />
            </div>
            <span className="text-[15px] font-bold text-zinc-800 ml-4">Fingerprint</span>
          </div>
          <span className="text-sm font-bold text-zinc-400 pr-1">{fingerprintEnabled ? "On" : "Off"}</span>
        </button>
      </div>
      */}

      {/* Group 3: Support */}
      <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden divide-y divide-zinc-50">
        <Link
          href="/patient/messages"
          className="flex items-center justify-between p-4 hover:bg-zinc-50/80 transition-all group"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <span className="text-[15px] font-bold text-zinc-800 ml-4">Contact Support</span>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        {/* Copy My ID button commented out per user request
        <button
          onClick={handleCopyId}
          className="w-full flex items-center justify-between p-4 hover:bg-zinc-50/80 transition-all text-left group"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 text-zinc-500 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-[15px] font-bold text-zinc-800 ml-4">Copy My ID</span>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
        */}
      </div>

      {/* Group 4: Account Danger Zone (Sign Out & Delete Account) */}
      <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden divide-y divide-zinc-50">
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full flex items-center justify-between p-4 hover:bg-red-50/50 active:bg-red-50/80 transition-all text-left disabled:opacity-50"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="text-[15px] font-bold text-red-600 ml-4">Sign Out</span>
          </div>
          <ChevronRight className="w-5 h-5 text-red-300" />
        </button>

        <button
          onClick={() => setShowDeleteDialog(true)}
          className="w-full flex items-center justify-between p-4 hover:bg-red-100/30 active:bg-red-100/50 transition-all text-left"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-2xl bg-red-100/50 text-red-700 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <span className="text-[15px] font-bold text-red-700 ml-4">Delete Account</span>
          </div>
          <ChevronRight className="w-5 h-5 text-red-400" />
        </button>
      </div>

      {/* Delete Account Dialog */}
      <DeleteAccountDialog
        open={showDeleteDialog}
        confirmation={deleteConfirmation}
        onConfirmationChange={setDeleteConfirmation}
        isDeleting={isDeleting}
        onCancel={() => {
          setShowDeleteDialog(false)
          setDeleteConfirmation("")
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
