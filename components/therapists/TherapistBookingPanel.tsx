"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  eachDayOfInterval
} from "date-fns"

interface Doctor {
  id: string
  fullName: string | null
  profilePhoto: string | null
  primarySpecialization: string | null
  specialization: string | null
  yearsOfExperience: number | null
  consultationFee: number
  appointmentDuration: number | null
  slotBuffer?: number | null
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
  availability: {
    availableDays: string[]
    startTime: string | null
    endTime: string | null
    isAvailable: boolean
    breaks?: any
  } | null
  appointments?: { appointmentDate: Date }[]
}

interface TherapistBookingPanelProps {
  doctor: Doctor
}

export default function TherapistBookingPanel({ doctor }: TherapistBookingPanelProps) {
  const router = useRouter()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [isBooking, setIsBooking] = useState(false)
  const [reason, setReason] = useState("")

  const displayPhoto = doctor.profilePhoto || doctor.user.image
  const specialization = doctor.primarySpecialization || doctor.specialization || "Therapist"
  const duration = doctor.appointmentDuration === 30 ? 45 : (doctor.appointmentDuration || 45)

  // Helper to generate slots for a specific date
  const getSlotsForDate = (date: Date) => {
    const slots: { time: string; status: 'available' | 'booked' | 'unavailable' }[] = []

    const startTime = doctor.availability?.startTime || "09:00"
    const endTime = doctor.availability?.endTime || "17:00"
    
    const buffer = doctor.slotBuffer !== undefined && doctor.slotBuffer !== null ? doctor.slotBuffer : 15
    const interval = duration + buffer

    const [startHour, startMin] = startTime.split(":").map(Number)
    const [endHour, endMin] = endTime.split(":").map(Number)

    const dayName = format(date, "EEEE").toUpperCase()
    if (!doctor.availability?.availableDays?.includes(dayName)) return []

    const now = new Date()
    const bufferTime = now.getTime()

    const startSlot = new Date(date)
    startSlot.setHours(startHour, startMin, 0, 0)
    
    const endSlot = new Date(date)
    endSlot.setHours(endHour, endMin, 0, 0)

    let currentSlot = new Date(startSlot)

    while (currentSlot < endSlot) {
      const timeStr = format(currentSlot, "HH:mm") // Use 24h format to match screenshot, or "h:mm a"
      const isPast = currentSlot.getTime() < bufferTime
      
      const isAlreadyBooked = doctor.appointments?.some(appt => {
        return Math.abs(new Date(appt.appointmentDate).getTime() - currentSlot.getTime()) < 1000
      }) || false

      const isOverlappingBreak = doctor.availability?.breaks?.some((brk: any) => {
        if (!brk.startTime || !brk.endTime) return false
        
        const [bStartHour, bStartMin] = brk.startTime.split(":").map(Number)
        const [bEndHour, bEndMin] = brk.endTime.split(":").map(Number)
        
        const breakStart = new Date(date)
        breakStart.setHours(bStartHour, bStartMin, 0, 0)
        
        const breakEnd = new Date(date)
        breakEnd.setHours(bEndHour, bEndMin, 0, 0)
        
        const slotStart = currentSlot.getTime()
        const slotEnd = currentSlot.getTime() + duration * 60000
        
        return slotStart < breakEnd.getTime() && breakStart.getTime() < slotEnd
      }) || false

      slots.push({
        time: timeStr,
        status: isAlreadyBooked ? 'booked' : (isPast || isOverlappingBreak) ? 'unavailable' : 'available'
      })

      currentSlot = new Date(currentSlot.getTime() + interval * 60000)
    }

    return slots
  }

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) return
    setIsBooking(true)
    try {
      const [hours, minutes] = selectedTime.split(":")
      let hour24 = parseInt(hours)

      const appointmentDateTime = new Date(selectedDate)
      appointmentDateTime.setHours(hour24, parseInt(minutes), 0, 0)

      const response = await fetch("/api/appointments/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: doctor.id,
          appointmentDate: appointmentDateTime.toISOString(),
          reason: reason || "Consultation",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/patient/appointments/${data.appointmentId}/payment`)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to book appointment")
      }
    } catch (error) {
      console.error("Error booking appointment:", error)
    } finally {
      setIsBooking(false)
    }
  }

  // Monthly Calendar Logic
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })
  
  const dailySlots = getSlotsForDate(selectedDate)

  return (
    <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1100px] mx-auto">
      
      <div className="flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Column: Info */}
        <div className="w-full md:w-[320px] p-8 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col gap-6 shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-100 relative shrink-0">
            {displayPhoto ? (
              <Image src={displayPhoto} alt={doctor.fullName || "Therapist"} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50 text-xl font-bold text-gray-300">
                {(doctor.fullName || "T")[0]}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-500 mb-1">{doctor.fullName || doctor.user.name || "Therapist"}</h3>
            <h1 className="text-2xl font-black text-gray-900 leading-tight">
              1-on-1 Session
            </h1>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            <div className="flex items-center gap-3 text-gray-600 font-semibold text-[15px]">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{duration} min</span>
            </div>
            
            <div className="flex items-center gap-3 text-gray-600 font-semibold text-[15px]">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
              </svg>
              <span>Video Call (Hey Attrangi)</span>
            </div>

            <div className="flex items-center gap-3 text-gray-600 font-semibold text-[15px]">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Asia/Kolkata</span>
            </div>
          </div>
          
          <div className="mt-auto pt-8 border-t border-gray-100">
             <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-bold">Fee</span>
                <span className="text-gray-900 font-black text-lg">₹{doctor.consultationFee}</span>
              </div>
          </div>
        </div>

        {/* Middle Column: Calendar */}
        <div className="flex-1 p-8 border-b md:border-b-0 md:border-r border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900">
              Select a Date & Time
            </h2>
          </div>

          <div className="max-w-[400px] mx-auto">
            <div className="flex items-center justify-between mb-6">
                <span className="font-bold text-[16px] text-gray-900">{format(currentMonth, "MMMM yyyy")}</span>
                <div className="flex gap-2">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-y-4 gap-x-2 mb-4">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                <div key={d} className="text-[11px] font-bold text-gray-500 text-center">{d}</div>
                ))}
                {calendarDays.map((date, i) => {
                    const isSelected = isSameDay(date, selectedDate);
                    const isCurrentMonth = isSameMonth(date, monthStart);
                    const isToday = isSameDay(date, new Date());
                    
                    let availableSlotsCount = 0;
                    if (isCurrentMonth) {
                        const slotsForDay = getSlotsForDate(date);
                        availableSlotsCount = slotsForDay.filter(s => s.status === 'available').length;
                    }
                    
                    return (
                        <button
                            key={i}
                            onClick={() => {
                                setSelectedDate(date)
                                setSelectedTime("") // Reset time when date changes
                            }}
                            disabled={!isCurrentMonth}
                            className={`w-12 h-12 flex flex-col items-center justify-center rounded-full transition-all mx-auto
                                        ${!isCurrentMonth ? 'text-gray-300 cursor-default' :
                                isSelected ? 'bg-black text-white' :
                                'text-gray-700 hover:bg-gray-100'}
                                        ${isToday && !isSelected ? 'text-orange-600 bg-orange-50' : ''}
                                    `}
                        >
                            <span className="text-[15px] font-bold leading-none mb-0.5">{format(date, "d")}</span>
                            {isCurrentMonth && availableSlotsCount > 0 ? (
                                <span className={`text-[8px] font-bold leading-none ${isSelected ? 'text-gray-300' : 'text-orange-500'}`}>
                                    {availableSlotsCount} slots
                                </span>
                            ) : isCurrentMonth ? (
                                <span className={`text-[8px] font-bold leading-none opacity-50 ${isSelected ? 'text-gray-400' : 'text-gray-300'}`}>
                                    -
                                </span>
                            ) : null}
                        </button>
                    )
                })}
            </div>
          </div>
        </div>

        {/* Right Column: Time Slots */}
        <div className="w-full md:w-[320px] p-8 shrink-0 flex flex-col bg-gray-50/50">
          <h3 className="text-[16px] font-bold text-gray-900 mb-6">
             {format(selectedDate, "EEEE, MMMM d")}
          </h3>

          <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3 custom-scrollbar">
            {dailySlots.length > 0 ? (
                dailySlots.map((slot, i) => {
                    const isSelected = selectedTime === slot.time;
                    
                    return (
                        <div key={i} className="flex items-center gap-2">
                            <button
                                disabled={slot.status !== 'available'}
                                onClick={() => setSelectedTime(slot.time)}
                                className={`w-full py-3.5 rounded-xl border font-bold text-[14.5px] transition-all
                                    ${isSelected 
                                        ? "bg-black border-black text-white" 
                                        : slot.status === 'booked' || slot.status === 'unavailable'
                                        ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                                        : "border-gray-300 bg-white text-gray-700 hover:border-black hover:text-black"}
                                `}
                            >
                                {slot.time}
                            </button>
                            
                            {/* Show confirm button right next to it if selected */}
                            {isSelected && (
                                <button
                                    onClick={handleBooking}
                                    disabled={isBooking}
                                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-sm whitespace-nowrap disabled:opacity-50 min-w-[100px]"
                                >
                                    {isBooking ? "..." : "Next"}
                                </button>
                            )}
                        </div>
                    )
                })
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-500 font-medium">No slots available on this date.</p>
                </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
