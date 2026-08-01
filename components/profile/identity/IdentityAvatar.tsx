"use client"

import { useEffect, useId, useRef, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

interface IdentityAvatarProps {
  name: string | null | undefined
  email: string | null | undefined
  image: string | null | undefined
  previewUrl?: string | null
  isUploading?: boolean
  onSelectFile: (file: File) => void
  onRemovePhoto?: () => void
  /** md = settings row; lg = mobile profile hero */
  size?: "md" | "lg"
  /** camera = photo control; edit = blue pencil (Edit Profile screen) */
  badge?: "camera" | "edit"
  className?: string
}

export default function IdentityAvatar({
  name,
  email,
  image,
  previewUrl = null,
  isUploading = false,
  onSelectFile,
  onRemovePhoto,
  size = "md",
  badge = "camera",
  className = "",
}: IdentityAvatarProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const reduceMotion = useReducedMotion()
  const menuId = useId()
  const displayPhoto = imageFailed ? null : previewUrl || image
  const hasPhoto = Boolean(displayPhoto)
  const initial = (name || email || "U")[0].toUpperCase()
  const isLg = size === "lg"

  useEffect(() => {
    setImageFailed(false)
  }, [image, previewUrl])

  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [menuOpen])

  const openPicker = () => {
    setMenuOpen(false)
    inputRef.current?.click()
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onSelectFile(file)
    e.target.value = ""
  }

  const frameClass = isLg
    ? "w-24 h-24 sm:w-28 sm:h-28"
    : "w-14 h-14 md:w-16 md:h-16"

  const initialText = isLg ? "text-3xl sm:text-4xl" : "text-xl md:text-2xl"
  const isEditBadge = badge === "edit"

  const badgeButtonClass = isEditBadge
    ? `inline-flex items-center justify-center rounded-full bg-[#4A6CF7] text-white w-9 h-9
        shadow-md border-2 border-white hover:bg-[#3B5BDB] transition-colors duration-150
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
        disabled:opacity-50`
    : isLg
      ? `inline-flex items-center justify-center rounded-full bg-gray-900 text-white w-9 h-9
          shadow-md border-2 border-white hover:bg-black transition-colors duration-150
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
          disabled:opacity-50`
      : `inline-flex items-center gap-1.5 rounded-full bg-gray-900 text-white pl-2.5 pr-3 min-h-9
          shadow-md border border-white/20 hover:bg-black transition-colors duration-150 text-[10px] font-bold
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
          disabled:opacity-50`

  const badgeIcon = isEditBadge ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" className="w-3.5 h-3.5" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={isLg || hasPhoto ? "w-3.5 h-3.5" : "w-3 h-3"} aria-hidden="true">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )

  return (
    <div className={`relative shrink-0 ${className}`} ref={menuRef}>
      <div
        className={`relative ${frameClass} rounded-full overflow-hidden
          border-[3px] border-white shadow-[0_8px_24px_rgba(15,23,42,0.12)] bg-gray-100
          ring-1 ring-black/5 transition-[box-shadow] duration-150
          hover:shadow-[0_10px_28px_rgba(15,23,42,0.16)]`}
      >
        {displayPhoto ? (
          <Image
            src={displayPhoto}
            alt={name || "Profile photo"}
            fill
            className="object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-500 text-white font-bold ${initialText}`}
            aria-hidden="true"
          >
            {initial}
          </div>
        )}
        {isUploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center" aria-live="polite">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white motion-reduce:animate-none" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />

      <div className={`absolute ${isLg || isEditBadge ? "-bottom-0.5 -right-0.5" : "-bottom-1 -right-1"}`}>
        {hasPhoto && onRemovePhoto ? (
          <>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              disabled={isUploading}
              onClick={() => setMenuOpen((o) => !o)}
              className={
                isEditBadge
                  ? badgeButtonClass
                  : `inline-flex items-center justify-center rounded-full bg-gray-900 text-white
                shadow-md border-2 border-white hover:bg-black transition-colors duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                disabled:opacity-50 ${isLg ? "w-9 h-9" : "w-9 h-9"}`
              }
              aria-label={isEditBadge ? "Edit photo" : "Photo options"}
            >
              {badgeIcon}
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  id={menuId}
                  role="menu"
                  aria-label="Photo options"
                  initial={reduceMotion ? false : { opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 z-20 min-w-[148px] rounded-xl border border-gray-100 bg-white py-1 shadow-lg"
                >
                  <button
                    type="button"
                    role="menuitem"
                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-gray-800 hover:bg-gray-50 transition-colors duration-150
                      focus-visible:outline-none focus-visible:bg-gray-50"
                    onClick={openPicker}
                  >
                    Change Photo
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors duration-150
                      focus-visible:outline-none focus-visible:bg-red-50"
                    onClick={() => {
                      setMenuOpen(false)
                      onRemovePhoto()
                    }}
                  >
                    Remove Photo
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <button
            type="button"
            disabled={isUploading}
            onClick={openPicker}
            className={badgeButtonClass}
            aria-label={isEditBadge ? "Edit photo" : "Change photo"}
          >
            {badgeIcon}
            {!isLg && !isEditBadge ? "Change Photo" : null}
          </button>
        )}
      </div>
    </div>
  )
}
