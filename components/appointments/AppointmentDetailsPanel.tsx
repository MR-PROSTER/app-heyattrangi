"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"

interface Appointment {
  id: string
  appointmentDate: Date
  status: string
  paymentStatus: string
  meetingLink: string | null
  chatChannelId: string | null
  createdAt: Date
  doctor: {
    id: string
    fullName: string | null
    primarySpecialization: string | null
    specialization: string | null
    consultationFee: number
    availability: {
      availableDays: string[]
      startTime: string | null
      endTime: string | null
    } | null
    appointments: {
      appointmentDate: Date
    }[]
    user: {
      name: string | null
      email: string | null
      image: string | null
    }
  }
  patient: {
    id: string
    user: {
      name: string | null
      email: string | null
    }
  } | null
  payment: {
    id: string
    amount: number
    platformFee: number
    doctorAmount: number
    status: string
    paymentMethod: string | null
    razorpayPaymentId: string | null
    createdAt: Date
  } | null
  timeSlot: {
    id: string
    startTime: Date
    endTime: Date
  } | null
}

interface AppointmentDetailsPanelProps {
  appointment: Appointment
  isUpcoming: boolean
  isPast: boolean
}

export default function AppointmentDetailsPanel({
  appointment,
  isUpcoming,
  isPast,
}: AppointmentDetailsPanelProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<"details" | "session" | "payment">("session")

  // Rescheduling state
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [availableSlots, setAvailableSlots] = useState<{ time: string; isBooked: boolean }[]>([])
  const [isUpdating, setIsUpdating] = useState(false)
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Helper to generate slots for a specific date (UTC Sync)
  const getSlotsForDate = (dateStr: string) => {
    const slots: { time: string; isBooked: boolean }[] = []
    if (!now || !appointment.doctor.availability) return slots

    const startTime = appointment.doctor.availability.startTime || "09:00"
    const endTime = appointment.doctor.availability.endTime || "17:00"
    const duration = 30 // therapist duration

    const [startHour, startMin] = startTime.split(":").map(Number)
    const [endHour, endMin] = endTime.split(":").map(Number)

    const [y_sel, m_sel, d_sel] = dateStr.split("-").map(Number)
    const isToday = now.getUTCFullYear() === y_sel &&
      now.getUTCMonth() === m_sel - 1 &&
      now.getUTCDate() === d_sel

    const nowTime = now.getTime()
    const bufferTime = nowTime + (60 * 60 * 1000)

    for (let h = startHour; h <= endHour; h++) {
      for (let m = 0; m < 60; m += duration) {
        if (h === startHour && m < startMin) continue
        if (h === endHour && m >= endMin) break

        const slotTime = new Date(Date.UTC(y_sel, m_sel - 1, d_sel, h, m))
        const timeStr = slotTime.toLocaleTimeString("en-US", {
          hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "UTC"
        })

        const isPastSlot = isToday && (slotTime.getTime() < bufferTime)
        const isBooked = isPastSlot || appointment.doctor.appointments?.some(appt => {
          const apptDate = new Date(appt.appointmentDate)
          return Math.abs(apptDate.getTime() - slotTime.getTime()) < 1000
        }) || false

        slots.push({ time: timeStr, isBooked })
      }
    }
    return slots
  }

  // Generate available dates (next 14 days)
  const availableDates = (() => {
    const dates: { date: string; dayName: string; dayNum: number; isFull: boolean }[] = []
    if (!appointment.doctor.availability) return dates
    const today = new Date()

    const dayNameMap: { [key: number]: string } = {
      0: "SUNDAY", 1: "MONDAY", 2: "TUESDAY", 3: "WEDNESDAY",
      4: "THURSDAY", 5: "FRIDAY", 6: "SATURDAY",
    }

    for (let i = 0; i <= 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const dateStr = date.toISOString().split("T")[0]
      const dayName = dayNameMap[date.getDay()]

      if (appointment.doctor.availability.availableDays?.includes(dayName)) {
        const daySlots = getSlotsForDate(dateStr)
        const isFull = daySlots.length > 0 && daySlots.every(s => s.isBooked)
        dates.push({
          date: dateStr,
          dayName: i === 0 ? "TODAY" : date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
          dayNum: date.getDate(),
          isFull
        })
      }
    }
    return dates
  })()

  useEffect(() => {
    if (selectedDate) {
      setAvailableSlots(getSlotsForDate(selectedDate))
      setSelectedTime("")
    }
  }, [selectedDate, now])

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) return
    setIsUpdating(true)
    try {
      const timeMatch = selectedTime.match(/(\d+):(\d+)\s*(AM|PM)/i)
      if (!timeMatch) return
      const [, hours, minutes, period] = timeMatch
      let hour24 = parseInt(hours)
      if (period.toUpperCase() === "PM" && hour24 !== 12) hour24 += 12
      else if (period.toUpperCase() === "AM" && hour24 === 12) hour24 = 0

      const [y, m, d] = selectedDate.split("-").map(Number)
      const newDate = new Date(Date.UTC(y, m - 1, d, hour24, parseInt(minutes)))

      const response = await fetch(`/api/appointments/${appointment.id}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newDate: newDate.toISOString() }),
      })

      if (response.ok) {
        setIsRescheduling(false)
        router.refresh()
      } else {
        alert("Failed to reschedule. Please try again.")
      }
    } catch (error) {
      console.error(error)
      alert("An error occurred")
    } finally {
      setIsUpdating(false)
    }
  }

  const doctorName = appointment.doctor.fullName || appointment.doctor.user.name || "Doctor"
  const specialization = appointment.doctor.primarySpecialization || appointment.doctor.specialization || "Therapist"
  const displayPhoto = appointment.doctor.user.image

  const appointmentDate = new Date(appointment.appointmentDate)
  const isToday = appointmentDate.toDateString() === new Date().toDateString()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-orange-100 text-orange-800"
      case "COMPLETED":
        return "bg-blue-100 text-blue-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-orange-100 text-orange-800"
      case "FAILED":
        return "bg-red-100 text-red-800"
      case "REFUNDED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Appointment Header */}
      <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 border border-gray-100 relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60"></div>
        <div className="flex items-start gap-6 relative z-10">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center flex-shrink-0 ring-4 ring-teal-50">
            {displayPhoto ? (
              <img
                src={displayPhoto}
                alt={doctorName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl text-white font-semibold">
                {doctorName[0].toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">{doctorName}</h2>
                <p className="text-gray-600">{specialization}</p>
              </div>
              <div className="flex gap-2">
                <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
                {isUpcoming && (
                  <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    Upcoming
                  </span>
                )}
                {isPast && (
                  <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    Past
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
              <div>
                <span className="text-gray-500">Date:</span>
                <p className="font-medium text-gray-800">
                  {appointmentDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  {isToday && <span className="ml-2 text-blue-600">(Today)</span>}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Time:</span>
                <p className="font-medium text-gray-800">
                  {appointmentDate.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Fee:</span>
                <p className="font-medium text-gray-800">₹{appointment.doctor.consultationFee}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <nav className="flex flex-wrap gap-2 bg-gray-200/50 p-1.5 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab("session")}
              className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === "session"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {isUpcoming ? "Session" : "Session History"}
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === "details"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Appointment Details
            </button>
            <button
              onClick={() => setActiveTab("payment")}
              className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === "payment"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Payment History
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Details Tab */}
          {activeTab === "details" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Appointment ID</label>
                    <p className="text-gray-800 font-mono text-sm">{appointment.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Booked On</label>
                    <p className="text-gray-800">
                      {new Date(appointment.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(appointment.paymentStatus)}`}>
                      {appointment.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {appointment.paymentStatus === "PENDING" && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800 mb-3">
                    Payment is pending. Please complete payment to confirm your appointment.
                  </p>
                  <Link
                    href={`/patient/appointments/${appointment.id}/payment`}
                    className="inline-block px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                  >
                    Complete Payment
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Session Tab */}
          {activeTab === "session" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {isUpcoming ? "Session Details" : "Session History"}
              </h3>

              {isUpcoming ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 mb-2">
                      Your session will begin on{" "}
                      <span className="font-semibold">
                        {appointmentDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}{" "}
                        at{" "}
                        {appointmentDate.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                    </p>
                  </div>

                  {appointment.meetingLink ? (
                    <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Meeting Link</p>
                      <a
                        href={appointment.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:text-teal-700 text-sm break-all"
                      >
                        {appointment.meetingLink}
                      </a>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600">
                        Meeting link will be available before the session starts.
                      </p>
                    </div>
                  )}

                  {appointment.status === "CONFIRMED" && (
                    <div className="flex flex-col gap-4 mt-6">
                      {!isRescheduling ? (
                        <div className="flex gap-3">
                          <a
                            href={`/meet/${appointment.id}?user=${encodeURIComponent(session?.user?.name || appointment.patient?.user?.name || "Patient")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg font-medium hover:from-teal-600 hover:to-emerald-600 transition-all text-center"
                          >
                            Join Session
                          </a>
                          <button
                            onClick={() => setIsRescheduling(true)}
                            className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-all shadow-lg shadow-orange-100"
                          >
                            Reschedule
                          </button>
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gray-50 rounded-2xl p-6 border-2 border-orange-100"
                        >
                          <div className="flex justify-between items-center mb-6">
                            <h4 className="text-lg font-bold text-gray-900">Select New Slot</h4>
                            <button
                              onClick={() => setIsRescheduling(false)}
                              className="text-gray-400 hover:text-gray-600 text-sm font-medium"
                            >
                              Cancel
                            </button>
                          </div>

                          <div className="space-y-6">
                            {/* Date Selector */}
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Choose Day</p>
                              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                                {availableDates.map((item) => (
                                  <button
                                    key={item.date}
                                    onClick={() => setSelectedDate(item.date)}
                                    className={`flex-shrink-0 w-14 h-16 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${selectedDate === item.date
                                        ? "border-orange-500 bg-orange-500 text-white"
                                        : item.isFull
                                          ? "border-red-200 bg-white opacity-40 grayscale"
                                          : "border-green-300 bg-white hover:border-green-400"
                                      }`}
                                  >
                                    <span className={`text-[8px] font-black mb-0.5 ${selectedDate === item.date ? "text-white" : "text-gray-400"}`}>{item.dayName}</span>
                                    <span className="text-base font-black">{item.dayNum}</span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Time Selector */}
                            {selectedDate && (
                              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="flex justify-between items-end mb-3">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Choose Time</p>
                                  {now && (
                                    <span className="text-[8px] font-bold text-red-400 uppercase animate-pulse">UTC: {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "UTC" })}</span>
                                  )}
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                  {availableSlots.map((slot) => (
                                    <button
                                      key={slot.time}
                                      disabled={slot.isBooked}
                                      onClick={() => setSelectedTime(slot.time)}
                                      className={`py-2.5 rounded-full border-2 text-[11px] font-bold transition-all ${selectedTime === slot.time
                                          ? "border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-100"
                                          : slot.isBooked
                                            ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                                            : "border-green-300 bg-white hover:border-green-400"
                                        }`}
                                    >
                                      {slot.time}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}

                            <button
                              onClick={handleReschedule}
                              disabled={isUpdating || !selectedDate || !selectedTime}
                              className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-xl shadow-orange-100 transition-all flex items-center justify-center gap-2"
                            >
                              {isUpdating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Confirm Reschedule"}
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {!isRescheduling && (
                        <button className="px-4 py-3 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all">
                          Cancel Appointment
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {appointment.status === "COMPLETED" ? (
                    <>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-green-800 mb-1">
                          ✓ Session Completed
                        </p>
                        <p className="text-sm text-green-700">
                          Your session was completed on{" "}
                          {appointmentDate.toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      {appointment.meetingLink && (
                        <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Session Recording</p>
                          <p className="text-sm text-gray-600">
                            Recording and transcript will be available soon.
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600">
                        No session history available for this appointment.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Payment Tab */}
          {activeTab === "payment" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment History</h3>

              {appointment.payment ? (
                <div className="space-y-4">
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">Payment Details</h4>
                        <p className="text-sm text-gray-500">
                          {new Date(appointment.payment.createdAt).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getPaymentStatusColor(appointment.payment.status)}`}>
                        {appointment.payment.status}
                      </span>
                    </div>

                    <div className="space-y-3 border-t border-gray-200 pt-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Consultation Fee</span>
                        <span className="font-medium text-gray-800">₹{appointment.payment.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Platform Fee</span>
                        <span className="font-medium text-gray-800">₹{appointment.payment.platformFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Doctor Receives</span>
                        <span className="font-medium text-gray-800">₹{appointment.payment.doctorAmount.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-semibold">
                        <span className="text-gray-800">Total Paid</span>
                        <span className="text-gray-800">₹{appointment.payment.amount.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Payment Method:</span>
                          <p className="font-medium text-gray-800">
                            {appointment.payment.paymentMethod || "Not specified"}
                          </p>
                        </div>
                        {appointment.payment.razorpayPaymentId && (
                          <div>
                            <span className="text-gray-600">Transaction ID:</span>
                            <p className="font-medium text-gray-800 font-mono text-xs">
                              {appointment.payment.razorpayPaymentId}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                  <p className="text-sm text-amber-800 mb-3">
                    No payment record found. Please complete payment to confirm your appointment.
                  </p>
                  {appointment.paymentStatus === "PENDING" && (
                    <Link
                      href={`/patient/appointments/${appointment.id}/payment`}
                      className="inline-block px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
                    >
                      Make Payment
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

