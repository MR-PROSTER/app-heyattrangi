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
    <div className="space-y-4 min-[360px]:space-y-6 pb-12 select-none animate-in fade-in duration-300">
      <Toaster position="top-center" richColors closeButton />

      {/* Unlock All Features Card (Upgrade Banner) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#FFF8D6] to-[#FFF1BE] rounded-3xl p-4 min-[360px]:p-6 border border-amber-200/50 shadow-sm flex items-center justify-between gap-3 min-[360px]:gap-4">
        <div className="space-y-2.5 min-[360px]:space-y-3.5 max-w-[72%]">
          <h2 className="text-zinc-900 font-extrabold text-[clamp(16px,4.8vw,20px)] tracking-tight whitespace-nowrap">Unlock All Features</h2>
          <p className="text-zinc-600 text-[clamp(11.5px,3.6vw,13px)] font-semibold leading-relaxed">
            AI Insights, Weekly Summaries, Advanced Dashboard, Longer Recordings and more.
          </p>
          <Link
            href="/dashboard/settings/subscription"
            className="inline-block bg-[#1A1A1A] hover:bg-[#333333] active:scale-[0.98] text-white text-[clamp(12px,3.8vw,13px)] font-extrabold px-4 py-2.5 min-[360px]:px-6 min-[360px]:py-3 rounded-xl min-[360px]:rounded-2xl shadow-sm transition-all text-center whitespace-nowrap"
          >
            Upgrade to Premium
          </Link>
        </div>
        <div className="w-[clamp(44px,15vw,64px)] h-[clamp(44px,15vw,64px)] shrink-0 text-amber-500/80 drop-shadow-md pr-1">
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
          className="flex items-center justify-between p-3 min-[360px]:p-4 hover:bg-zinc-50/80 transition-all group"
        >
          <div className="flex items-center">
            <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 rounded-[12px] min-[360px]:rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Bell className="w-[18px] h-[18px] min-[360px]:w-5 min-[360px]:h-5" />
            </div>
            <span className="text-[clamp(13.5px,4.0vw,15px)] font-bold text-zinc-800 ml-3 min-[360px]:ml-4">Notifications</span>
          </div>
          <ChevronRight className="w-[18px] h-[18px] min-[360px]:w-5 min-[360px]:h-5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          href="/dashboard/settings/personal-details"
          className="flex items-center justify-between p-3 min-[360px]:p-4 hover:bg-zinc-50/80 transition-all group"
        >
          <div className="flex items-center">
            <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 rounded-[12px] min-[360px]:rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <User className="w-[18px] h-[18px] min-[360px]:w-5 min-[360px]:h-5" />
            </div>
            <span className="text-[clamp(13.5px,4.0vw,15px)] font-bold text-zinc-800 ml-3 min-[360px]:ml-4">Edit Name</span>
          </div>
          <ChevronRight className="w-[18px] h-[18px] min-[360px]:w-5 min-[360px]:h-5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Group 2: Privacy / Biometrics commented out per user request */}

      {/* Group 3: Support */}
      <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden divide-y divide-zinc-50">
        <Link
          href="/dashboard/settings/contact-support"
          className="flex items-center justify-between p-3 min-[360px]:p-4 hover:bg-zinc-50/80 transition-all group"
        >
          <div className="flex items-center">
            <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 rounded-[12px] min-[360px]:rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <LifeBuoy className="w-[18px] h-[18px] min-[360px]:w-5 min-[360px]:h-5" />
            </div>
            <span className="text-[clamp(13.5px,4.0vw,15px)] font-bold text-zinc-800 ml-3 min-[360px]:ml-4">Contact Support</span>
          </div>
          <ChevronRight className="w-[18px] h-[18px] min-[360px]:w-5 min-[360px]:h-5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Group 4: Account Danger Zone (Sign Out & Delete Account) */}
      <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden divide-y divide-zinc-50">
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full flex items-center justify-between p-3 min-[360px]:p-4 hover:bg-red-50/50 active:bg-red-50/80 transition-all text-left disabled:opacity-50 cursor-pointer"
        >
          <div className="flex items-center">
            <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 rounded-[12px] min-[360px]:rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
              <LogOut className="w-[18px] h-[18px] min-[360px]:w-5 min-[360px]:h-5" />
            </div>
            <span className="text-[clamp(13.5px,4.0vw,15px)] font-bold text-red-600 ml-3 min-[360px]:ml-4">Sign Out</span>
          </div>
          <ChevronRight className="w-[18px] h-[18px] min-[360px]:w-5 min-[360px]:h-5 text-red-300" />
        </button>

        <button
          onClick={() => setShowDeleteDialog(true)}
          className="w-full flex items-center justify-between p-3 min-[360px]:p-4 hover:bg-red-100/30 active:bg-red-100/50 transition-all text-left cursor-pointer"
        >
          <div className="flex items-center">
            <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 rounded-[12px] min-[360px]:rounded-2xl bg-red-100/50 text-red-700 flex items-center justify-center">
              <Trash2 className="w-[18px] h-[18px] min-[360px]:w-5 min-[360px]:h-5" />
            </div>
            <span className="text-[clamp(13.5px,4.0vw,15px)] font-bold text-red-700 ml-3 min-[360px]:ml-4">Delete Account</span>
          </div>
          <ChevronRight className="w-[18px] h-[18px] min-[360px]:w-5 min-[360px]:h-5 text-red-400" />
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
