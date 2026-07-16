"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface Appointment {
  id: string
  status: string
  meetingLink?: string | null
  doctorNotes?: string | null
  actualDuration?: number | null
  patientRating?: number | null
  patientFeedback?: string | null
  formattedDate: string
  formattedTime: string
  isToday: boolean
  formattedAlertDate: string
  formattedBookingDate: string
  doctor: {
    id: string
    fullName: string | null
    primarySpecialization: string | null
    specialization: string | null
    consultationFee: number
    user: {
      name: string | null
      image: string | null
    }
  }
  patient: {
    name: string | null
    email: string | null
  }
  payment: {
    id: string
    amount: number
    status: string
    formattedPaymentDate: string
  } | null
}

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const VideoIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
)

const DollarIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

export default function DetailView({ appointment }: { appointment: Appointment }) {
  const router = useRouter()
  const doctorName = appointment.doctor.fullName || appointment.doctor.user.name || "Therapist"
  const specialization = appointment.doctor.primarySpecialization || appointment.doctor.specialization || "Therapist"

  const handleJoin = () => {
    if (!appointment.meetingLink) {
      alert("Meeting link will be shared before the session starts.")
      return
    }
    
    if (appointment.meetingLink.includes("jit.si")) {
      alert("The meeting link is being updated to our new secure platform. Please refresh the page in a moment.")
      return
    }

    let link = appointment.meetingLink
    if (link.includes("meet-heyattrangi.vercel.app")) {
      const baseUrl = link.split('?')[0].replace(/\/lobby$/, '').replace(/\/$/, '')
      link = `${baseUrl}/lobby?user=${encodeURIComponent(appointment.patient.name || "Patient")}&audio=true&video=true`
    } else {
      link = `${link}?user=${encodeURIComponent(appointment.patient.name || "Patient")}&audio=true&video=true`
    }

    window.open(link, "_blank")
  }

  const handleReschedule = () => {
    router.push(`/patient/therapists/${appointment.doctor.id}`)
  }

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this session?")) return
    try {
      const res = await fetch(`/api/appointments/${appointment.id}/cancel`, { method: "PATCH" })
      if (res.ok) window.location.reload()
      else alert("Failed to cancel.")
    } catch (e) {
      alert("An error occurred.")
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Main Details Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100">
        
        {/* Header Profile */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10 pb-10 border-b border-gray-50">
          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 shrink-0 relative">
            {appointment.doctor.user.image ? (
              <Image src={appointment.doctor.user.image} alt={doctorName} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-medium text-gray-400">
                {doctorName[0]}
              </div>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">{doctorName}</h2>
            <p className="text-gray-500 mb-4">{specialization}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium tracking-wide">
                {appointment.status}
              </span>
              <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium tracking-wide">
                {appointment.isToday ? "TODAY" : "UPCOMING"}
              </span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <CalendarIcon />
              <p className="text-xs font-medium uppercase tracking-wider">Date</p>
            </div>
            <p className="text-sm font-medium text-gray-900">{appointment.formattedDate}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <ClockIcon />
              <p className="text-xs font-medium uppercase tracking-wider">Time</p>
            </div>
            <p className="text-sm font-medium text-gray-900">{appointment.formattedTime}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <ClockIcon />
              <p className="text-xs font-medium uppercase tracking-wider">Duration</p>
            </div>
            <p className="text-sm font-medium text-gray-900">60 minutes</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <DollarIcon />
              <p className="text-xs font-medium uppercase tracking-wider">Fee</p>
            </div>
            <p className="text-sm font-medium text-gray-900">₹{appointment.doctor.consultationFee}</p>
          </div>
        </div>

        {/* Action Area */}
        <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 text-center space-y-6">
          {appointment.doctorNotes && (
            <div className="mb-6 text-left p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">Session Notes</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{appointment.doctorNotes}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-gray-500 mb-1">Session Starts At</p>
            <p className="text-lg font-medium text-gray-900">{appointment.formattedAlertDate}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
            {appointment.status === "CONFIRMED" && (
              <button 
                onClick={handleJoin} 
                className="w-full sm:w-auto flex-1 py-3 px-6 bg-black hover:bg-gray-800 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <VideoIcon />
                Join Session
              </button>
            )}
            <button 
              onClick={handleReschedule} 
              className="w-full sm:w-auto py-3 px-6 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl font-medium transition-colors"
            >
              Reschedule
            </button>
          </div>

          <div className="pt-2">
            <button 
              onClick={handleCancel} 
              className="inline-flex items-center gap-2 text-gray-400 hover:text-red-500 text-sm font-medium transition-colors"
            >
              <TrashIcon />
              Cancel Appointment
            </button>
          </div>
        </div>

        {/* Payment & Session Details Sections */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payment Details */}
          {appointment.payment && (
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarIcon />
                Payment Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Transaction ID</span>
                  <span className="font-mono text-gray-900">{appointment.payment.id.substring(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Date Paid</span>
                  <span className="text-gray-900">{appointment.payment.formattedPaymentDate}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${appointment.payment.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {appointment.payment.status}
                  </span>
                </div>
                <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-medium text-gray-900">Total Amount</span>
                  <span className="font-bold text-gray-900">₹{appointment.payment.amount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Session Feedback / Post-Session Details */}
          {(appointment.status === 'COMPLETED' && (appointment.actualDuration || appointment.patientRating)) && (
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Post-Session Details
              </h3>
              <div className="space-y-3">
                {appointment.actualDuration && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Actual Duration</span>
                    <span className="text-gray-900">{appointment.actualDuration} minutes</span>
                  </div>
                )}
                {appointment.patientRating && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Your Rating</span>
                    <span className="flex text-orange-400">
                      {[...Array(appointment.patientRating)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      ))}
                    </span>
                  </div>
                )}
                {appointment.patientFeedback && (
                  <div className="pt-3 mt-3 border-t border-gray-200">
                    <span className="block text-xs font-medium text-gray-500 mb-1">Your Feedback</span>
                    <span className="text-sm text-gray-700 italic">"{appointment.patientFeedback}"</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Meta Info */}
      <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-400 px-4">
        <p>Booking ID: {appointment.id}</p>
        <p>Booked on {appointment.formattedBookingDate}</p>
      </div>
    </div>
  )
}
