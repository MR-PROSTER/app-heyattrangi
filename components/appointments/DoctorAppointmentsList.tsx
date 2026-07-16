"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"

interface Appointment {
  id: string
  appointmentDate: Date
  status: string
  meetingLink?: string | null
  patient: {
    id: string
    user: {
      name: string | null
      email: string | null
      image: string | null
    }
  } | null
  paymentStatus: string
  payment: {
    id: string
    amount: number
    status: string
    createdAt: Date
  } | null
}

interface DoctorAppointmentsListProps {
  upcomingAppointments: Appointment[]
  pastAppointments: Appointment[]
  doctorName?: string
}

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null)

  useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime()
      const distance = new Date(targetDate).getTime() - now
      if (distance < 0) return null
      return {
        d: Math.floor(distance / (1000 * 60 * 60 * 24)),
        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((distance % (1000 * 60)) / 1000)
      }
    }
    setTimeLeft(calculate())
    const timer = setInterval(() => setTimeLeft(calculate()), 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  if (!timeLeft) return <span className="text-gray-400 text-sm font-bold">Session passed</span>

  return (
    <p className="text-[22px] font-black text-blue-500 tracking-tight leading-tight">
      {timeLeft.d > 0 && `${timeLeft.d}d `}{timeLeft.h}h {timeLeft.m}m {timeLeft.s}s
    </p>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; dot: string; label: string }> = {
    CONFIRMED: { bg: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-500", label: "Confirmed" },
    PENDING:   { bg: "bg-amber-50 text-amber-600",   dot: "bg-amber-500",   label: "Pending" },
    COMPLETED: { bg: "bg-blue-50 text-blue-600",       dot: "bg-blue-500",   label: "Completed" },
    CANCELLED: { bg: "bg-red-50 text-red-500",          dot: "bg-red-400",    label: "Cancelled" },
  }
  const s = map[status] ?? { bg: "bg-gray-50 text-gray-500", dot: "bg-gray-400", label: status }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${s.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

export default function DoctorAppointmentsList({ upcomingAppointments, pastAppointments, doctorName = "Doctor" }: DoctorAppointmentsListProps) {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
  const router = useRouter()

  const handleJoinOrCreateSession = async (appointment: Appointment) => {
    // We now just use the internal `/meet/[id]` route. 
    // Old links might exist in DB (e.g. https://meet-heyattrangi.vercel.app/...), 
    // but we can just override it and navigate to internal route directly.
    
    const internalUrl = `/meet/${appointment.id}?user=${encodeURIComponent(doctorName)}&host=true`

    // Predict the link if it's missing but paid
    if (!appointment.meetingLink && appointment.paymentStatus === "PAID") {
      window.open(internalUrl, "_blank")
      // Optionally trigger the API in background to save it to DB (or we don't even need to save if it's predictable)
      fetch(`/api/appointments/${appointment.id}/meeting`, { method: 'POST' }).catch(console.error)
      return
    }

    if (appointment.meetingLink) {
      window.open(internalUrl, "_blank")
      return
    }

    // Fallback to existing API generation logic
    setIsGenerating(appointment.id)
    try {
      const res = await fetch(`/api/appointments/${appointment.id}/meeting`, {
        method: 'POST',
      })
      if (res.ok) {
        window.open(internalUrl, "_blank")
        router.refresh()
      } else {
        alert("Failed to generate meeting link. Please try again.")
      }
    } catch (e) {
      alert("An error occurred.")
    } finally {
      setIsGenerating(null)
    }
  }

  const handleCancel = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to cancel this patient's session?")) return
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/cancel`, { method: 'PATCH' })
      if (res.ok) window.location.reload()
    } catch (e) {
      alert("An error occurred.")
    }
  }

  const totalCount = upcomingAppointments.length + pastAppointments.length

  const displayList = useMemo(() => {
    const list = activeTab === "upcoming" ? upcomingAppointments : pastAppointments
    if (filterStatus === "all") return list
    return list.filter((apt) => apt.status === filterStatus)
  }, [activeTab, upcomingAppointments, pastAppointments, filterStatus])

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const appointmentDate = new Date(appointment.appointmentDate)
    const patientName = appointment.patient?.user?.name || "Patient"
    const dateStr = format(appointmentDate, "EEEE, do MMMM, yyyy")
    const timeStr = format(appointmentDate, "h:mm a")
    const avatar = appointment.patient?.user?.image
    const isUpcoming = activeTab === "upcoming"
    const loading = isGenerating === appointment.id

    return (
      <Link 
        href={`/doctor/appointments/${appointment.id}`}
        className="block flex flex-col md:flex-row md:items-center justify-between gap-6 py-6 px-6 border-b border-gray-50 last:border-0 hover:bg-blue-50/40 transition-all rounded-[32px] group relative"
      >
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-sm relative shrink-0 bg-gray-100 group-hover:scale-105 transition-transform">
            {avatar ? (
              <Image src={avatar} alt={patientName} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl font-black text-gray-300">
                {patientName[0]}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <p className="font-black text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">{patientName}</p>
              <StatusBadge status={appointment.status} />
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-gray-400 font-bold">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {dateStr}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                {timeStr}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10" onClick={(e) => e.stopPropagation()}>
          {isUpcoming && appointment.status !== "CANCELLED" && (
            <>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleJoinOrCreateSession(appointment);
                }}
                disabled={loading || appointment.paymentStatus !== "PAID"}
                className={`flex items-center gap-2 px-6 py-3 text-white text-sm font-black rounded-2xl transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed ${
                  appointment.paymentStatus === "PAID" ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400"
                }`}
              >
                {loading ? (
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
                {appointment.meetingLink ? "Join Session" : loading ? "Generating..." : appointment.paymentStatus === "PAID" ? "Start Session" : "Payment Pending"}
              </button>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCancel(appointment.id);
                }}
                className="px-6 py-3 text-red-500 hover:bg-red-50 text-sm font-black rounded-2xl transition-all"
              >
                Cancel
              </button>
            </>
          )}
          {!isUpcoming && (
             <span className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-black rounded-2xl transition-all">
                View Case Notes
             </span>
          )}
        </div>
      </Link>
    )
    
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 items-start">
      <div className="space-y-8">
        {/* Main List Card */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center gap-8 px-8 py-6 border-b border-gray-50">
            {(["upcoming", "past"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-lg font-black pb-1 relative transition-all ${
                  activeTab === tab ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab === "upcoming" ? "Upcoming Sessions" : "Session History"}
                {activeTab === tab && (
                  <div className="absolute -bottom-6 left-0 right-0 h-1 bg-blue-500 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="px-8 py-4 bg-gray-50/50 border-b border-gray-50 flex flex-wrap gap-2">
            {["All", "Confirmed", "Pending", "Completed", "Cancelled"].map(label => {
              const val = label === "All" ? "all" : label.toUpperCase()
              return (
                <button
                  key={label}
                  onClick={() => setFilterStatus(val)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black border transition-all ${
                    filterStatus === val 
                      ? "bg-white border-blue-200 text-blue-600 shadow-sm" 
                      : "bg-transparent border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>

          <div className="p-4">
            {displayList.length === 0 ? (
              <div className="py-20 text-center opacity-50">
                <p className="text-gray-400 font-bold">No sessions found in this category.</p>
              </div>
            ) : (
              displayList.map(apt => <AppointmentCard key={apt.id} appointment={apt} />)
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Statistics & Highlights */}
      <div className="space-y-6 sticky top-8">
        {/* Next Session Alert */}
        {upcomingAppointments.length > 0 && (
          <div className="bg-gray-900 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
            <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-4">Next Patient In</p>
            <CountdownTimer targetDate={upcomingAppointments[0].appointmentDate} />
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-sm font-black mb-1">{upcomingAppointments[0].patient?.user?.name || "Patient"}</p>
              <p className="text-[11px] text-white/40 font-bold uppercase tracking-wider">Session starts at {format(new Date(upcomingAppointments[0].appointmentDate), "hh:mm a")}</p>
            </div>
          </div>
        )}

        {/* Schedule Stats */}
        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
           <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Schedule Overview</h3>
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <span className="text-sm font-bold text-gray-500">Upcoming</span>
                 </div>
                 <span className="text-xl font-black text-gray-900">{upcomingAppointments.length}</span>
              </div>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <span className="text-sm font-bold text-gray-500">Completed</span>
                 </div>
                 <span className="text-xl font-black text-gray-900">{pastAppointments.filter(a => a.status === "COMPLETED").length}</span>
              </div>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M6 18L18 6M6 6l12 12" /></svg>
                    </div>
                    <span className="text-sm font-bold text-gray-500">Cancelled</span>
                 </div>
                 <span className="text-xl font-black text-gray-900">{pastAppointments.filter(a => a.status === "CANCELLED").length}</span>
              </div>
           </div>
        </div>

        {/* Tip Card */}
        <div className="bg-blue-50 rounded-[32px] p-8 border border-blue-100 group hover:bg-blue-100 transition-all">
           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
              💡
           </div>
           <h4 className="font-black text-gray-900 mb-2 text-sm">Professional Tip</h4>
           <p className="text-xs text-blue-800/70 font-bold leading-relaxed">
             Meeting links are generated automatically after successful payment. Ensure your patient has completed the payment to start the session.
           </p>
        </div>
      </div>
    </div>
  )
}
