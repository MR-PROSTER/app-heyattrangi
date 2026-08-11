"use client"
 
import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, Mail, CheckCircle, Eye, X, Calendar, User, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import SignOutButton from "@/components/auth/SignOutButton"
import { toast, Toaster } from "sonner"
 
interface SupportMessage {
  id: string
  userId: string
  userName: string | null
  userEmail: string | null
  message: string
  status: string
  isRead: boolean
  createdAt: string
  updatedAt: string
}
 
export default function AdminSupportMessagesPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
 
  // State
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
 
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    resolved: 0,
  })
 
  // Fetch messages from backend
  const fetchMessages = useCallback(async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        search,
        status: statusFilter,
        page: page.toString(),
        limit: "10",
      })
      const res = await fetch(`/api/admin/support/messages?${queryParams.toString()}`)
      const data = await res.json()
 
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch support messages")
      }
 
      setMessages(data.messages)
      setTotalPages(data.pagination.totalPages)
      setTotalCount(data.pagination.total)
 
      // Fetch stats summary (just use simple endpoint aggregation or client count)
      // For simplicity, we fetch all to get counts or compute based on simple fetch
      const statsRes = await fetch("/api/admin/support/messages?limit=1000&status=all")
      const statsData = await statsRes.json()
      if (statsRes.ok && statsData.messages) {
        const list: SupportMessage[] = statsData.messages
        setStats({
          total: list.length,
          new: list.filter((m) => !m.isRead).length,
          resolved: list.filter((m) => m.status === "resolved").length,
        })
      }
    } catch (error: any) {
      toast.error(error.message || "Unable to load support messages.")
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, page])
 
  // Check authorization
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [sessionStatus, router])
 
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      if (session?.user?.role !== "ADMIN") {
        router.push("/auth/unauthorized")
      } else {
        fetchMessages()
      }
    }
  }, [sessionStatus, session, fetchMessages])
 
  // Handle mark as read and select
  const handleOpenMessage = async (msg: SupportMessage) => {
    setSelectedMessage(msg)
    
    // If message is new, mark as read on the backend
    if (!msg.isRead) {
      try {
        const res = await fetch(`/api/admin/support/messages/${msg.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isRead: true, status: "read" }),
        })
        if (res.ok) {
          // Update local state arrays
          setMessages((prev) =>
            prev.map((m) => (m.id === msg.id ? { ...m, isRead: true, status: "read" } : m))
          )
          setSelectedMessage((prev) => prev ? { ...prev, isRead: true, status: "read" } : null)
          // Decrement unread badge
          setStats((prev) => ({ ...prev, new: Math.max(0, prev.new - 1) }))
        }
      } catch (err) {
        console.error("Failed to mark message as read:", err)
      }
    }
  }
 
  // Update status resolve/new/read
  const handleUpdateStatus = async (statusVal: string) => {
    if (!selectedMessage || updatingStatus) return
    setUpdatingStatus(true)
    try {
      const res = await fetch(`/api/admin/support/messages/${selectedMessage.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: statusVal }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to update status")
      }
 
      toast.success(`Message status updated to ${statusVal}`)
      setMessages((prev) =>
        prev.map((m) => (m.id === selectedMessage.id ? { ...m, status: statusVal } : m))
      )
      setSelectedMessage((prev) => prev ? { ...prev, status: statusVal } : null)
      
      // Update statistics
      fetchMessages()
    } catch (error: any) {
      toast.error(error.message || "Failed to update status")
    } finally {
      setUpdatingStatus(false)
    }
  }
 
  if (sessionStatus === "loading" || session?.user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-[#fafcfd] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 text-gray-800 font-sans relative overflow-hidden pb-12">
      <Toaster position="top-center" richColors closeButton />
 
      {/* Subtle Background Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-rose-100/40 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-100/40 blur-[100px] rounded-full pointer-events-none" />
 
      {/* Navigation */}
      <nav className="relative z-10 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <Link href="/admin/dashboard" className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-[0_4px_14px_rgba(249,107,19,0.25)]">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
                <h1 className="text-xl font-black tracking-tight text-gray-900">Attrangi Admin</h1>
              </Link>
              <span className="text-gray-300 font-medium">/</span>
              <span className="text-sm font-bold text-gray-500">Support Messages</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/admin/dashboard" className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
                Dashboard
              </Link>
              <div className="h-4 w-px bg-gray-200" />
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>
 
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Support Messages</h1>
            <p className="text-gray-500 font-medium">Review, track, and manage messages submitted by users.</p>
          </div>
          <button
            onClick={fetchMessages}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-bold shadow-sm active:scale-95 transition-all cursor-pointer w-fit"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
 
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <span className="text-sm font-bold text-gray-400 block mb-1">Total Messages</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-gray-900">{stats.total}</span>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <span className="text-sm font-bold text-gray-400 block mb-1">Unread / New</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-rose-600">{stats.new}</span>
              {stats.new > 0 && <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">Pending</span>}
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <span className="text-sm font-bold text-gray-400 block mb-1">Resolved</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-green-600">{stats.resolved}</span>
            </div>
          </div>
        </div>
 
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or message..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-white placeholder-gray-400 focus:outline-none focus:border-orange-500 font-medium text-sm transition-all"
            />
          </div>
 
          {/* Status Filters */}
          <div className="flex gap-2 bg-gray-100/80 p-1.5 rounded-2xl self-start">
            {["all", "new", "read", "resolved"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setStatusFilter(tab)
                  setPage(1)
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  statusFilter === tab
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
 
        {/* Message List Table */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">User</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Message Preview</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Submitted Date</th>
                  <th className="px-6 py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {loading ? (
                  // Skeleton Loading Rows
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-5 whitespace-nowrap"><div className="h-4 w-28 bg-gray-100 rounded animate-pulse" /></td>
                      <td className="px-6 py-5"><div className="h-4 w-64 bg-gray-100 rounded animate-pulse" /></td>
                      <td className="px-6 py-5 whitespace-nowrap"><div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" /></td>
                      <td className="px-6 py-5 whitespace-nowrap"><div className="h-4 w-20 bg-gray-100 rounded animate-pulse" /></td>
                      <td className="px-6 py-5 whitespace-nowrap"><div className="h-8 w-16 bg-gray-100 rounded mx-auto animate-pulse" /></td>
                    </tr>
                  ))
                ) : messages.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="max-w-sm mx-auto flex flex-col items-center">
                        <Mail className="w-12 h-12 text-gray-300 mb-4" />
                        <h3 className="text-base font-black text-gray-800 mb-1">No support messages yet</h3>
                        <p className="text-sm text-gray-500 font-semibold">Messages sent from the Contact Support flow will show up here.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  messages.map((msg) => (
                    <tr
                      key={msg.id}
                      onClick={() => handleOpenMessage(msg)}
                      className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${
                        !msg.isRead ? "bg-orange-50/20 font-bold" : ""
                      }`}
                    >
                      {/* User Info */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center font-bold text-gray-600 text-sm mr-3">
                            {(msg.userName || "U")[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-black text-gray-900">{msg.userName || "Anonymous User"}</div>
                            <div className="text-xs text-gray-400 font-semibold">{msg.userEmail || "No Email"}</div>
                          </div>
                        </div>
                      </td>
                      {/* Message Preview */}
                      <td className="px-6 py-5 max-w-[300px]">
                        <p className="text-sm text-gray-600 font-semibold truncate leading-relaxed">
                          {msg.message}
                        </p>
                      </td>
                      {/* Status Badge */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-black rounded-full uppercase tracking-wider ${
                            msg.status === "resolved"
                              ? "bg-green-50 text-green-700"
                              : msg.status === "read"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {msg.status}
                        </span>
                      </td>
                      {/* Date */}
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500 font-semibold">
                        {new Date(msg.createdAt).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-5 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenMessage(msg)
                          }}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Open
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
 
          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">
                Showing page {page} of {totalPages} ({totalCount} total)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-50 hover:bg-gray-50 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-50 hover:bg-gray-50 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
 
      {/* Detail Overlay Drawer Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-black text-gray-900">Support Message</h2>
              <button
                onClick={() => setSelectedMessage(null)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 active:scale-90 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
 
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* User Identity info */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex gap-3 items-start">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-gray-450 uppercase tracking-wider block">From</span>
                  <p className="text-base font-black text-gray-900 leading-tight">
                    {selectedMessage.userName || "Anonymous"}
                  </p>
                  <p className="text-xs font-bold text-gray-500">{selectedMessage.userEmail || "No Email Address"}</p>
                </div>
              </div>
 
              {/* Message Meta Info */}
              <div className="flex items-center justify-between text-xs text-gray-500 font-bold border-b border-gray-100 pb-4">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>
                    {new Date(selectedMessage.createdAt).toLocaleString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-450">STATUS:</span>
                  <span className="uppercase text-orange-600">{selectedMessage.status}</span>
                </div>
              </div>
 
              {/* Complete Message Box */}
              <div className="space-y-2">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Message Content</span>
                <div className="bg-[#FAF5F0] border border-[#EDE6DF] rounded-2xl p-5 text-gray-800 text-sm font-semibold leading-relaxed whitespace-pre-wrap select-text max-h-[300px] overflow-y-auto">
                  {selectedMessage.message}
                </div>
              </div>
            </div>
 
            {/* Modal Actions Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col gap-3 shrink-0">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Mark Resolution Status</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleUpdateStatus("new")}
                  disabled={updatingStatus}
                  className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm active:scale-95 transition-all cursor-pointer ${
                    selectedMessage.status === "new"
                      ? "bg-rose-600 text-white"
                      : "bg-white border border-gray-200 text-rose-600 hover:bg-rose-50/30"
                  }`}
                >
                  New
                </button>
                <button
                  onClick={() => handleUpdateStatus("read")}
                  disabled={updatingStatus}
                  className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm active:scale-95 transition-all cursor-pointer ${
                    selectedMessage.status === "read"
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-gray-200 text-blue-600 hover:bg-blue-50/30"
                  }`}
                >
                  Read
                </button>
                <button
                  onClick={() => handleUpdateStatus("resolved")}
                  disabled={updatingStatus}
                  className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm active:scale-95 transition-all cursor-pointer ${
                    selectedMessage.status === "resolved"
                      ? "bg-green-600 text-white"
                      : "bg-white border border-gray-200 text-green-600 hover:bg-green-50/30"
                  }`}
                >
                  Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
