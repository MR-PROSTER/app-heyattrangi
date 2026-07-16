"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { useSession } from "next-auth/react"

interface Appointment {
  id: string
  appointmentDate: Date
  status: string
  paymentStatus: string
  meetingLink?: string | null
  doctor: {
    id: string
    fullName: string | null
    primarySpecialization: string | null
    specialization: string | null
    consultationFee: number
    user: {
      name: string | null
      email: string | null
      image: string | null
    }
  }
  payment: {
    id: string
    amount: number
    status: string
    createdAt: Date
  } | null
}

interface AppointmentsListProps {
  upcomingAppointments: Appointment[]
  pastAppointments: Appointment[]
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
    <p className="text-[22px] font-black text-orange-500 tracking-tight leading-tight">
      {timeLeft.d > 0 && `${timeLeft.d}d `}{timeLeft.h}h {timeLeft.m}m {timeLeft.s}s
    </p>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; dot: string; label: string }> = {
    CONFIRMED: { bg: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-500", label: "Upcoming" },
    PENDING:   { bg: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-500", label: "Pending" },
    COMPLETED: { bg: "bg-blue-50 text-blue-600",       dot: "bg-blue-500",   label: "Completed" },
    CANCELLED: { bg: "bg-red-50 text-red-500",          dot: "bg-red-400",    label: "Cancelled" },
  }
  const s = map[status] ?? { bg: "bg-gray-50 text-gray-500", dot: "bg-gray-400", label: status }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${s.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

export default function AppointmentsList({ upcomingAppointments, pastAppointments }: AppointmentsListProps) {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")
  const router = useRouter()

  const handleJoinSession = (appointment: Appointment) => {
    let link = appointment.meetingLink
    
    // If no link exists but the appointment is confirmed, generate the predictable link
    if (!link && (appointment.status === "CONFIRMED" || appointment.status === "PENDING")) {
      link = `/meet/${appointment.id}`
    }

    if (!link) {
      alert("Meeting link is not available yet. Please check back soon.")
      return
    }

    // Adapt any existing external links to the new internal route format
    const baseUrl = link.split('?')[0].replace(/\/lobby$/, '').replace(/\/$/, '')
    const finalUrl = baseUrl.replace('https://meet-heyattrangi.vercel.app', '/meet')
    const userName = session?.user?.name || "Patient"
    link = `${finalUrl}?user=${encodeURIComponent(userName)}`

    window.open(link, "_blank")
  }

  const handleReschedule = (doctorId: string) => {
    router.push(`/patient/therapists/${doctorId}`)
  }

  const handleCancel = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to cancel this session? This action cannot be undone.")) return
    
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: 'PATCH'
      })
      if (res.ok) {
        window.location.reload()
      } else {
        alert("Failed to cancel appointment. Please try again.")
      }
    } catch (e) {
      alert("An error occurred. Please try again.")
    }
  }

  const handleRedirect = (id: string) => {
    router.push(`/patient/appointments/${id}`)
  }

  const totalCount = upcomingAppointments.length + pastAppointments.length

  const filteredUpcoming = useMemo(() => {
    if (filterStatus === "all") return upcomingAppointments
    return upcomingAppointments.filter((apt) => apt.status === filterStatus)
  }, [upcomingAppointments, filterStatus])

  const filteredPast = useMemo(() => {
    if (filterStatus === "all") return pastAppointments
    return pastAppointments.filter((apt) => apt.status === filterStatus)
  }, [pastAppointments, filterStatus])

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const appointmentDate = new Date(appointment.appointmentDate)
    const doctorName = appointment.doctor?.fullName || appointment.doctor?.user?.name || "Therapist"
    const dateStr = format(appointmentDate, "EEEE, do MMMM, yyyy")
    const timeStr = format(appointmentDate, "h:mm a")
    const isUpcoming = appointment.status === "CONFIRMED" || appointment.status === "PENDING"
    const avatar = appointment.doctor?.user?.image

    return (
      <div 
        onClick={() => handleRedirect(appointment.id)}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 px-2 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 cursor-pointer rounded-xl transition-colors group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 relative shrink-0 bg-gray-50">
            {avatar ? (
              <Image src={avatar} alt={doctorName} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-300">
                {doctorName[0]}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="font-bold text-gray-900 text-[15px] group-hover:text-orange-500 transition-colors">{doctorName}</p>
              <StatusBadge status={appointment.status || "PENDING"} />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-gray-400 font-medium">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {dateStr}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                {timeStr} (60 min)
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          {isUpcoming && (
            <button 
              onClick={() => handleJoinSession(appointment)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#22C55E] hover:bg-[#16A34A] text-white text-[13px] font-bold rounded-xl transition-all shadow-sm shadow-emerald-100"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Join Session
            </button>
          )}
          <button 
            onClick={() => handleReschedule(appointment.doctor.id)}
            className="px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-[13px] font-medium rounded-xl transition-all"
          >
            Reschedule
          </button>
          <button 
            onClick={() => handleCancel(appointment.id)}
            className="px-4 py-2 text-red-500 hover:text-red-600 text-[13px] font-medium rounded-xl transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  if (totalCount === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-20 text-center shadow-sm">
        <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">No sessions booked yet</h3>
        <p className="text-gray-400 text-sm max-w-xs mx-auto mb-6">Start your healing journey by exploring our verified therapists.</p>
        <Link href="/patient/therapists" className="inline-flex items-center px-6 py-3 bg-orange-500 text-white font-bold rounded-xl transition-all hover:bg-orange-600 shadow-md shadow-orange-100">
          Browse therapists
        </Link>
      </div>
    )
  }

  const displayList = activeTab === "upcoming" ? filteredUpcoming : filteredPast

  return (
    <div className="pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
        
        {/* Left Column */}
        <div className="space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "TOTAL SESSIONS", value: totalCount, iconBg: "bg-orange-50", iconColor: "text-orange-500", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
              { label: "UPCOMING",       value: upcomingAppointments.length, iconBg: "bg-emerald-50", iconColor: "text-emerald-500", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> },
              { label: "PAST",           value: pastAppointments.length, iconBg: "bg-blue-50", iconColor: "text-blue-500", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />, strokeWidth: 3 },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl p-5 flex items-center gap-4 border border-gray-100 shadow-sm">
                <div className={`w-11 h-11 rounded-xl ${stat.iconBg} flex items-center justify-center ${stat.iconColor} shrink-0`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stat.strokeWidth ?? 2}>
                    {stat.icon}
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{stat.label}</p>
                  <p className="text-[26px] font-black text-gray-900 leading-none">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Sessions List Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <div className="flex items-center gap-6">
                {(["upcoming", "past"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-[14px] font-bold pb-1 relative transition-colors ${
                      activeTab === tab ? "text-orange-500" : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {tab === "upcoming" ? "Upcoming Sessions" : "Past Sessions"}
                    {activeTab === tab && (
                      <div className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-orange-500 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-1 p-0.5 bg-gray-50 rounded-lg">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white text-orange-500 shadow-sm" : "text-gray-400"}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                </button>
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`p-1.5 rounded-md transition-all ${viewMode === "calendar" ? "bg-white text-orange-500 shadow-sm" : "text-gray-400"}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-gray-50">
              <div className="flex flex-wrap gap-2">
                {["All", "Upcoming", "Pending", "Confirmed", "Completed"].map(label => {
                  const val = label === "All" ? "all" : label.toUpperCase()
                  const active = filterStatus === val
                  return (
                    <button
                      key={label}
                      onClick={() => setFilterStatus(val)}
                      className={`px-3.5 py-1 rounded-full text-[12px] font-bold border transition-all ${
                        active ? "bg-orange-50 border-orange-400 text-orange-500" : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
              <button className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500 hover:text-gray-700">
                Sort by: Soonest
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M19 9l-7 7-7-7"/></svg>
              </button>
            </div>

            {/* List */}
            <div className="px-6 py-2">
              {displayList.length === 0 ? (
                <div className="py-14 text-center">
                  <p className="text-gray-300 font-bold">No sessions in this category</p>
                </div>
              ) : (
                displayList.map(apt => <AppointmentCard key={apt.id} appointment={apt} />)
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4 sticky top-6">
          
          {/* Next Session */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-[11px] font-black text-gray-700 uppercase tracking-widest mb-3">Next Session</p>
            {upcomingAppointments.length > 0 ? (
              <div 
                onClick={() => handleRedirect(upcomingAppointments[0].id)}
                className="bg-orange-50/60 rounded-xl p-4 border border-orange-100/50 cursor-pointer hover:bg-orange-50 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-orange-100 flex items-center justify-center text-base shrink-0">📅</div>
                  <div>
                    <p className="text-[14px] font-bold text-gray-900 leading-tight">
                      {upcomingAppointments[0].doctor?.fullName || upcomingAppointments[0].doctor?.user?.name}
                    </p>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                      {format(new Date(upcomingAppointments[0].appointmentDate), "EEEE, do MMM, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-medium mb-3">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {format(new Date(upcomingAppointments[0].appointmentDate), "h:mm a")} (60 min)
                </div>
                <div className="text-center pt-3 border-t border-orange-100/60">
                  <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Starts in</p>
                  <CountdownTimer targetDate={upcomingAppointments[0].appointmentDate} />
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 font-medium text-center py-4">No upcoming sessions</p>
            )}
          </div>

          {/* Quick Overview */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-[11px] font-black text-gray-700 uppercase tracking-widest mb-4">Quick Overview</p>
            <div className="space-y-4">
              {[
                { label: "Total Sessions", value: totalCount, iconBg: "bg-orange-50 text-orange-500", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
                { label: "Upcoming",       value: upcomingAppointments.length, iconBg: "bg-emerald-50 text-emerald-500", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> },
                { label: "Past",           value: pastAppointments.length, iconBg: "bg-blue-50 text-blue-500", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />, sw: 3 },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.iconBg}`}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={item.sw ?? 2}>{item.icon}</svg>
                    </div>
                    <span className="text-[13px] font-medium text-gray-500">{item.label}</span>
                  </div>
                  <span className="text-[18px] font-black text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Need Support */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[14px] font-black text-gray-900 mb-1">Need support?</p>
              <p className="text-gray-400 text-[12px] font-medium mb-5 leading-relaxed">Find the best therapist tailored to your needs.</p>
              <Link
                href="/patient/therapists"
                className="flex items-center justify-between w-full px-4 py-3 border border-orange-200 rounded-xl bg-white text-orange-500 font-bold text-[12px] transition-all hover:bg-orange-50"
              >
                Explore Therapists
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
              </Link>
            </div>
            <svg className="w-24 h-24 absolute -right-2 bottom-4 text-gray-100 opacity-60 select-none pointer-events-none group-hover:scale-110 transition-all duration-500" viewBox="0 0 100 100" fill="currentColor">
              <circle cx="50" cy="45" r="25" />
              <path d="M20 90c0-10 10-20 30-20s30 10 30 20v10H20V90z" />
              <path d="M25 45a25 25 0 0 1 50 0" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
              <rect x="20" y="40" width="10" height="15" rx="4" />
              <rect x="70" y="40" width="10" height="15" rx="4" />
              <path d="M75 55l8 12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <circle cx="85" cy="70" r="3" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
