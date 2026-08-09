"use client"

import { useRouter } from "next/navigation"

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

interface ProfileAvatarProps {
  name: string
  image?: string | null
  className?: string
}

/**
 * Circular initials or photo avatar — sole entry point to Profile (Phase 1).
 */
export default function ProfileAvatar({ name, image, className = "" }: ProfileAvatarProps) {
  const router = useRouter()
  const initials = getInitials(name || "User")

  const openProfile = () => {
    router.push("/dashboard/profile")
  }

  return (
    <button
      type="button"
      aria-label="Open profile"
      onClick={openProfile}
      className={`inline-flex items-center justify-center shrink-0 size-11 min-w-11 min-h-11 rounded-full bg-white text-slate-800 text-sm font-bold border border-slate-200/90 shadow-[0_2px_8px_rgba(15,23,42,0.08)] cursor-pointer transition-transform duration-200 ease-out hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 overflow-hidden ${className}`}
    >
      {image ? (
        <img src={image} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </button>
  )
}
