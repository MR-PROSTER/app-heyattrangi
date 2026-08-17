"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Camera, Loader2 } from "lucide-react"

interface AvatarUploadProps {
  initialImage: string | null | undefined
  displayName: string
}

export default function AvatarUpload({ initialImage, displayName }: AvatarUploadProps) {
  const [image, setImage] = useState<string | null>(
    typeof initialImage === "string" && initialImage !== "/images/default_user.png" && !initialImage.includes("default_user") ? initialImage : null
  )
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show local preview immediately
    const reader = new FileReader()
    reader.onloadend = () => {
      setImage(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    setIsUploading(true)
    try {
      const uploadData = new FormData()
      uploadData.append("photo", file)

      const response = await fetch("/api/profile/patient/upload-photo", {
        method: "POST",
        body: uploadData,
      })

      if (response.ok) {
        router.refresh()
      } else {
        console.error("Failed to upload profile photo")
      }
    } catch (error) {
      console.error("Error uploading profile photo:", error)
    } finally {
      setIsUploading(false)
    }
  }

  // Calculate initials from name
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U"

  return (
    <div className="relative group">
      {/* Avatar Container */}
      <div 
        onClick={handleAvatarClick}
        className="relative w-24 h-24 rounded-full overflow-hidden border-[3px] border-white shadow-md ring-1 ring-black/5 cursor-pointer bg-[#0F4C3A] flex items-center justify-center transition-all duration-300 hover:opacity-95"
      >
        {image ? (
          <Image
            src={image}
            alt={displayName}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <span className="text-white font-bold text-[36px] tracking-tight font-sans select-none">
            {initials}
          </span>
        )}

        {/* Hover overlay with text */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1">
          <Camera className="w-5 h-5 text-white" />
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">Edit</span>
        </div>

        {/* Loading Spinner */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Edit Badge Button (at bottom right corner) */}
      <button
        type="button"
        onClick={handleAvatarClick}
        className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#E8722A] hover:bg-[#C05C1A] text-white flex items-center justify-center shadow-md border-2 border-white transition-all active:scale-90"
        aria-label="Upload profile picture"
      >
        <Camera className="w-4 h-4" />
      </button>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  )
}
