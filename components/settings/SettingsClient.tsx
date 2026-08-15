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
  ChevronRight,
  HelpCircle,
} from "lucide-react"
import { performClientSignOut } from "@/lib/auth/performClientSignOut"
import UnlockFeaturesCard from "@/components/premium/UnlockFeaturesCard"

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



      {/* Group 1: ACCOUNT */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-extrabold text-zinc-400 tracking-[0.14em] uppercase ml-1">Account</span>
        <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden divide-y divide-zinc-50">
          <Link
            href="/dashboard/settings/personal-details"
            className="flex items-center justify-between p-3 min-[360px]:p-4 hover:bg-zinc-50/80 transition-all group"
          >
            <div className="flex items-center">
              <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 rounded-[12px] min-[360px]:rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
                <User className="w-[18px] h-[18px] min-[360px]:w-5 min-[360px]:h-5" />
              </div>
              <span className="text-[clamp(13.5px,4.0vw,15px)] font-bold text-zinc-800 ml-3 min-[360px]:ml-4">Personal information</span>
            </div>
            <ChevronRight className="w-[18px] h-[18px] min-[360px]:w-5 min-[360px]:h-5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/dashboard/settings/subscription"
            className="flex items-center justify-between p-3 min-[360px]:p-4 hover:bg-zinc-50/80 transition-all group"
          >
            <div className="flex items-center">
              <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 rounded-[12px] min-[360px]:rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Bell className="w-[18px] h-[18px] min-[360px]:w-5 min-[360px]:h-5" />
              </div>
              <span className="text-[clamp(13.5px,4.0vw,15px)] font-bold text-zinc-800 ml-3 min-[360px]:ml-4">Subscription & billing</span>
            </div>
            <ChevronRight className="w-[18px] h-[18px] min-[360px]:w-5 min-[360px]:h-5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Group 2: PREFERENCES */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-extrabold text-zinc-400 tracking-[0.14em] uppercase ml-1">Preferences</span>
        <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden divide-y divide-zinc-50">
          <Link
            href="/dashboard/settings/notifications"
            className="flex items-center justify-between p-3 min-[360px]:p-4 hover:bg-zinc-50/80 transition-all group"
          >
            <div className="flex items-center">
              <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 rounded-[12px] min-[360px]:rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Bell className="w-[18px] h-[18px] min-[360px]:w-5 min-[360px]:h-5" />
              </div>
              <span className="text-[clamp(13.5px,4.0vw,15px)] font-bold text-zinc-800 ml-3 min-[360px]:ml-4">Reminders</span>
            </div>
            <ChevronRight className="w-[18px] h-[18px] min-[360px]:w-5 min-[360px]:h-5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/dashboard/settings/appearance"
            className="flex items-center justify-between p-3 min-[360px]:p-4 hover:bg-zinc-50/80 transition-all group"
          >
            <div className="flex items-center">
              <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 rounded-[12px] min-[360px]:rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center">
                <HelpCircle className="w-[18px] h-[18px] min-[360px]:w-5 min-[360px]:h-5" />
              </div>
              <span className="text-[clamp(13.5px,4.0vw,15px)] font-bold text-zinc-800 ml-3 min-[360px]:ml-4">Appearance</span>
            </div>
            <ChevronRight className="w-[18px] h-[18px] min-[360px]:w-5 min-[360px]:h-5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/dashboard/settings/language"
            className="flex items-center justify-between p-3 min-[360px]:p-4 hover:bg-zinc-50/80 transition-all group"
          >
            <div className="flex items-center">
              <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 rounded-[12px] min-[360px]:rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center">
                <Globe className="w-[18px] h-[18px] min-[360px]:w-5 min-[360px]:h-5" />
              </div>
              <span className="text-[clamp(13.5px,4.0vw,15px)] font-bold text-zinc-800 ml-3 min-[360px]:ml-4">Language</span>
            </div>
            <ChevronRight className="w-[18px] h-[18px] min-[360px]:w-5 min-[360px]:h-5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Group 3: SUPPORT */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-extrabold text-zinc-400 tracking-[0.14em] uppercase ml-1">Support</span>
        <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden divide-y divide-zinc-50">
          <Link
            href="/dashboard/settings/contact-support"
            className="flex items-center justify-between p-3 min-[360px]:p-4 hover:bg-zinc-50/80 transition-all group"
          >
            <div className="flex items-center">
              <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 rounded-[12px] min-[360px]:rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center">
                <HelpCircle className="w-[18px] h-[18px] min-[360px]:w-5 min-[360px]:h-5" />
              </div>
              <span className="text-[clamp(13.5px,4.0vw,15px)] font-bold text-zinc-800 ml-3 min-[360px]:ml-4">Help & support</span>
            </div>
            <ChevronRight className="w-[18px] h-[18px] min-[360px]:w-5 min-[360px]:h-5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/dashboard/settings/privacy"
            className="flex items-center justify-between p-3 min-[360px]:p-4 hover:bg-zinc-50/80 transition-all group"
          >
            <div className="flex items-center">
              <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 rounded-[12px] min-[360px]:rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Bell className="w-[18px] h-[18px] min-[360px]:w-5 min-[360px]:h-5" />
              </div>
              <span className="text-[clamp(13.5px,4.0vw,15px)] font-bold text-zinc-800 ml-3 min-[360px]:ml-4">Privacy & data</span>
            </div>
            <ChevronRight className="w-[18px] h-[18px] min-[360px]:w-5 min-[360px]:h-5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Group 4: Account Actions */}
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
            <span className="text-[clamp(13.5px,4.0vw,15px)] font-bold text-red-600 ml-3 min-[360px]:ml-4">Sign out</span>
          </div>
          <ChevronRight className="w-[18px] h-[18px] min-[360px]:w-5 min-[360px]:h-5 text-red-300" />
        </button>

        <button
          onClick={() => setShowDeleteDialog(true)}
          className="w-full flex items-center justify-between p-3 min-[360px]:p-4 hover:bg-red-100/30 active:bg-red-100/50 transition-all text-left cursor-pointer"
        >
          <div className="flex items-center">
            <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 rounded-[12px] min-[360px]:rounded-2xl bg-red-100/50 text-red-700 flex items-center justify-center overflow-hidden">
              <img
                src="https://res.cloudinary.com/dxoiluua8/image/upload/v1786785602/Sign_out_vwjtfv.png"
                alt="Delete account"
                className="w-[18px] h-[18px] min-[360px]:w-5 min-[360px]:h-5 object-contain"
              />
            </div>
            <span className="text-[clamp(13.5px,4.0vw,15px)] font-bold text-red-700 ml-3 min-[360px]:ml-4">Delete account</span>
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
