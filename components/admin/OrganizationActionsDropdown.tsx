"use client"

import { useState, useEffect, useRef } from "react"
import { MoreVertical, Edit2, Trash2, X, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createPortal } from "react-dom"

type Organization = {
  id: string
  name: string
  domains: string[]
  sessionLimit: number | null
  studentLimit: number | null
  status: string
}

export default function OrganizationActionsDropdown({ org }: { org: Organization }) {
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // --- Edit Form State ---
  const [formData, setFormData] = useState({
    name: org.name,
    domains: org.domains.join(", "),
    sessionLimit: org.sessionLimit?.toString() || "",
    studentLimit: org.studentLimit?.toString() || "",
    status: org.status
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error("Organization name is required")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/admin/organizations/${org.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update organization")
      }

      toast.success("Organization updated successfully")
      setIsEditModalOpen(false)
      router.refresh()
    } catch (error: any) {
      console.error("Error:", error)
      toast.error(error.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // --- Delete Handler ---
  const handleDeleteConfirm = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/admin/organizations/${org.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete organization")
      }

      toast.success("Organization deleted successfully")
      setIsDeleteModalOpen(false)
      router.refresh()
    } catch (error: any) {
      console.error("Error:", error)
      toast.error(error.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // --- Modals Rendered in Portal ---
  const editModalContent = isEditModalOpen && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Edit Institution</h2>
          <button 
            onClick={() => setIsEditModalOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Institution Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Allowed Domains
            </label>
            <input
              type="text"
              name="domains"
              value={formData.domains}
              onChange={handleChange}
              placeholder="e.g. stanford.edu, mit.edu (comma separated)"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-900 placeholder:text-gray-400"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty to allow any domain</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Limit
              </label>
              <input
                type="number"
                name="sessionLimit"
                value={formData.sessionLimit}
                onChange={handleChange}
                min="1"
                placeholder="Unlimited"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student Limit
              </label>
              <input
                type="number"
                name="studentLimit"
                value={formData.studentLimit}
                onChange={handleChange}
                min="1"
                placeholder="Unlimited"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-900 bg-white"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-5 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="px-5 py-2.5 rounded-xl font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  const deleteModalContent = isDeleteModalOpen && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Delete Institution?</h2>
          <p className="text-gray-500 text-sm">
            Are you sure you want to delete <strong>{org.name}</strong>? This action cannot be undone and will remove all associated data, users, and batches.
          </p>
        </div>
        
        <div className="p-6 pt-0 flex gap-3">
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(false)}
            className="flex-1 px-5 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteConfirm}
            disabled={isLoading}
            className="flex-1 px-5 py-3 rounded-xl font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              "Yes, Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`text-gray-400 hover:text-orange-500 transition-colors p-2 rounded-full hover:bg-orange-50 ${isDropdownOpen ? 'bg-orange-50 text-orange-500' : ''}`}
      >
        <MoreVertical size={20} />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
          <button
            onClick={() => {
              setIsDropdownOpen(false)
              setIsEditModalOpen(true)
            }}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2 transition-colors"
          >
            <Edit2 size={16} />
            Edit Institution
          </button>
          <button
            onClick={() => {
              setIsDropdownOpen(false)
              setIsDeleteModalOpen(true)
            }}
            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      )}

      {mounted && editModalContent && createPortal(editModalContent, document.body)}
      {mounted && deleteModalContent && createPortal(deleteModalContent, document.body)}
    </div>
  )
}
