"use client"

import { useState, useEffect } from "react"
import { Building, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createPortal } from "react-dom"

export default function AddOrganizationModal() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const [formData, setFormData] = useState({
    name: "",
    domains: "",
    sessionLimit: "",
    studentLimit: ""
  })

  const handleOpen = () => setIsOpen(true)
  const handleClose = () => {
    setIsOpen(false)
    setFormData({ name: "", domains: "", sessionLimit: "", studentLimit: "" })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error("Organization name is required")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create organization")
      }

      toast.success("Organization created successfully")
      handleClose()
      router.refresh()
    } catch (error: any) {
      console.error("Error:", error)
      toast.error(error.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const modalContent = isOpen && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Add New Institution</h2>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
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
              placeholder="e.g. Stanford University"
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

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
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
                "Create"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return (
    <>
      <button 
        onClick={handleOpen}
        className="bg-orange-500 text-white font-bold px-4 py-2 rounded-xl hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/20 text-sm flex items-center gap-2"
      >
        <Building size={16} />
        Add Institution
      </button>

      {mounted && modalContent && createPortal(modalContent, document.body)}
    </>
  )

}
