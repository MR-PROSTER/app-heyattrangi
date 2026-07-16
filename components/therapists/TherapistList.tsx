"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { useDebounce } from "@/lib/hooks/useDebounce"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  format,
  addDays,
  subDays,
  isSameDay,
} from "date-fns"

interface Doctor {
  id: string
  specialization: string | null
  primarySpecialization: string | null
  secondarySpecializations: string[]
  experience: number | null
  yearsOfExperience: number | null
  consultationFee: number
  bio: string | null
  profilePhoto: string | null
  languagesSpoken: string[]
  consultationTypes: string[]
  preferredAgeGroups: string[]
  city: string | null
  appointmentDuration?: number | null
  slotBuffer?: number | null
  user: {
    name: string | null
    email: string | null
    image: string | null
  }
  availability: {
    isAvailable: boolean
    availableDays?: string[]
    startTime?: string | null
    endTime?: string | null
    breaks?: any
  } | null
  appointments?: { appointmentDate: Date }[]
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function TherapistList() {
  const router = useRouter()
  
  // Filtering & Sorting states
  const [specialization, setSpecialization] = useState("") // Default active tab is empty (All Experts)
  const [search, setSearch] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("")
  const [selectedPrice, setSelectedPrice] = useState("")
  const [selectedGender, setSelectedGender] = useState("")
  
  const debouncedSearch = useDebounce(search, 500)

  // Booking states
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null)
  const [activeChannel, setActiveChannel] = useState<{ [doctorId: string]: "Online" | "In-person" }>({})
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ [doctorId: string]: string }>({})
  const [selectedCardDate, setSelectedCardDate] = useState<{ [doctorId: string]: Date }>({})
  const [reason, setReason] = useState("")
  const [isBooking, setIsBooking] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState<Doctor | null>(null)

  // Bookmarks & Collapsible Filters Drawer states
  const [bookmarks, setBookmarks] = useState<{ [doctorId: string]: boolean }>({})
  const [showFilterDropdowns, setShowFilterDropdowns] = useState(true)

  // Fetch doctors list
  const { data, isLoading } = useSWR(
    `/api/doctors?${new URLSearchParams({
      ...(specialization && { specialization }),
      ...(debouncedSearch && { search: debouncedSearch }),
      limit: "40"
    }).toString()}`,
    fetcher
  )

  const rawDoctors: Doctor[] = data?.doctors || []

  // Client-side filtering
  const filteredDoctors = rawDoctors
    .filter((doctor) => {
      // Language Filter
      if (selectedLanguage) {
        return doctor.languagesSpoken?.some(l => l.toLowerCase().includes(selectedLanguage.toLowerCase()))
      }
      return true
    })
    .filter((doctor) => {
      // Price Filter
      if (selectedPrice) {
        const fee = doctor.consultationFee
        if (selectedPrice === "low") return fee < 1500
        if (selectedPrice === "mid") return fee >= 1500 && fee <= 2500
        if (selectedPrice === "high") return fee > 2500
      }
      return true
    })

  // Helper to generate slots for a specific date per doctor
  const getSlotsForDate = (doctor: Doctor, date: Date) => {
    const slots: { time: string; status: 'available' | 'booked' | 'unavailable' }[] = []

    const startTime = doctor.availability?.startTime || "09:00"
    const endTime = doctor.availability?.endTime || "17:00"
    
    const duration = doctor.appointmentDuration || 45
    const buffer = doctor.slotBuffer !== undefined && doctor.slotBuffer !== null ? doctor.slotBuffer : 15
    const interval = duration + buffer

    const [startHour, startMin] = startTime.split(":").map(Number)
    const [endHour, endMin] = endTime.split(":").map(Number)

    const dayName = format(date, "EEEE").toUpperCase()
    const availableDays = doctor.availability?.availableDays || ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
    if (!availableDays.includes(dayName)) return []

    const now = new Date()
    const bufferTime = now.getTime()

    const startSlot = new Date(date)
    startSlot.setHours(startHour, startMin, 0, 0)
    
    const endSlot = new Date(date)
    endSlot.setHours(endHour, endMin, 0, 0)

    let currentSlot = new Date(startSlot)

    while (currentSlot < endSlot) {
      const timeStr = format(currentSlot, "h:mm a")
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

  // Calculate dynamic next available slot for a doctor
  const getNextAvailableSlot = (doctor: Doctor) => {
    const today = new Date()
    for (let i = 0; i < 14; i++) {
      const targetDate = addDays(today, i)
      const slots = getSlotsForDate(doctor, targetDate)
      const firstAvailable = slots.find(s => s.status === 'available')
      if (firstAvailable) {
        return `${format(targetDate, "EEE, d MMM")} ${firstAvailable.time}`
      }
    }
    return "No slots available this week"
  }

  // Handle slot booking checkout
  const handleBookingConfirm = async () => {
    if (!bookingDoctor) return
    const docId = bookingDoctor.id
    const selectedDate = selectedCardDate[docId] || new Date()
    const selectedTime = selectedTimeSlot[docId] || getSlotsForDate(bookingDoctor, selectedDate).find(s => s.status === 'available')?.time

    if (!selectedTime) {
      alert("Please select a time slot.")
      return
    }
    if (!reason.trim()) {
      alert("Please describe your concerns briefly.")
      return
    }

    setIsBooking(true)
    try {
      const timeMatch = selectedTime.match(/(\d+):(\d+)\s*(AM|PM)/i)
      if (!timeMatch) return

      let [, hours, minutes, period] = timeMatch
      let hour24 = parseInt(hours)
      if (period.toUpperCase() === "PM" && hour24 !== 12) hour24 += 12
      else if (period.toUpperCase() === "AM" && hour24 === 12) hour24 = 0

      const appointmentDateTime = new Date(selectedDate)
      appointmentDateTime.setHours(hour24, parseInt(minutes), 0, 0)

      const response = await fetch("/api/appointments/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: docId,
          appointmentDate: appointmentDateTime.toISOString(),
          reason: reason,
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
      setShowBookingModal(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-[#1A1A2E] pb-24 font-sans antialiased flex flex-col">
      <div className="max-w-[1440px] mx-auto px-8 py-8 w-full flex flex-col flex-1">
        
        {/* Main Full-Width Layout */}
        <div className="w-full flex flex-col gap-8 flex-1">
            
            {/* Header Title Block */}
            <div className="text-left max-w-2xl">
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-2">
                Our Therapists
              </h1>
              <p className="text-sm font-semibold text-gray-500 leading-normal">
                Curated for you — verified professionals on <span className="text-[#E36D49] font-black">Attrangi</span>.
              </p>
            </div>

            {/* Search and Filters Toggle Row */}
            <div className="flex gap-4 w-full flex-wrap">
              <div className="relative flex-1 min-w-[200px] max-w-xl">
                <input
                  type="text"
                  placeholder="Search therapists, specializations, issues..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm font-semibold text-gray-700 outline-none focus:border-orange-300 focus:bg-white shadow-sm transition-all placeholder-gray-400"
                />
                <span className="absolute inset-y-0 left-4 flex items-center text-gray-400 text-lg">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </span>
              </div>
              <button
                onClick={() => setSpecialization(specialization === "Organization Doctor" ? "" : "Organization Doctor")}
                className={`px-6 py-3.5 rounded-2xl text-sm font-black tracking-wide flex items-center gap-2 shadow-sm border transition-all duration-300
                  ${specialization === "Organization Doctor"
                    ? "bg-[#131E29] border-[#131E29] text-white"
                    : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  }
                `}
              >
                <span>🏢 Org Therapists</span>
              </button>
              <button
                onClick={() => setShowFilterDropdowns(!showFilterDropdowns)}
                className={`px-6 py-3.5 rounded-2xl text-sm font-black tracking-wide flex items-center gap-2 shadow-sm border transition-all duration-300
                  ${showFilterDropdowns
                    ? "bg-[#E36D49] border-[#E36D49] text-white"
                    : "bg-white border-gray-200 text-gray-700 hover:border-orange-200 hover:bg-orange-50/30"
                  }
                `}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                <span>Filters</span>
              </button>
            </div>

            {/* Collapsible Dropdown Filter Drawers */}
            {showFilterDropdowns && (
              <div className="flex flex-wrap items-center gap-4 w-full bg-white border border-gray-100 p-5 rounded-3xl animate-in slide-in-from-top-3 duration-300 shadow-sm">
                {/* Filter: Specialization */}
                <div className="relative flex-1 min-w-[200px]">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Specialization</label>
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="appearance-none w-full bg-gray-50 border border-transparent px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 outline-none cursor-pointer pr-10 focus:border-orange-300 transition-all"
                  >
                    <option value="">All Therapists</option>
                    <option value="Psychiatrist">Psychiatrist</option>
                    <option value="Psychologist">Psychologist</option>
                    <option value="Counselor">Counselor</option>
                    <option value="Clinical Psychologist">Clinical Psychologist</option>
                    <option value="Organization Doctor">Organization Doctor</option>
                  </select>
                  <span className="absolute bottom-3 right-3 flex items-center text-gray-400 pointer-events-none">▼</span>
                </div>

                {/* Filter: Language */}
                <div className="relative flex-1 min-w-[200px]">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Language</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="appearance-none w-full bg-gray-50 border border-transparent px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 outline-none cursor-pointer pr-10 focus:border-orange-300 transition-all"
                  >
                    <option value="">All Languages</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Telugu">Telugu</option>
                  </select>
                  <span className="absolute bottom-3 right-3 flex items-center text-gray-400 pointer-events-none">▼</span>
                </div>

                {/* Filter: Price */}
                <div className="relative flex-1 min-w-[200px]">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Price Range</label>
                  <select
                    value={selectedPrice}
                    onChange={(e) => setSelectedPrice(e.target.value)}
                    className="appearance-none w-full bg-gray-50 border border-transparent px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 outline-none cursor-pointer pr-10 focus:border-orange-300 transition-all"
                  >
                    <option value="">Any Price</option>
                    <option value="low">Under ₹1500</option>
                    <option value="mid">₹1500 - ₹2500</option>
                    <option value="high">Above ₹2500</option>
                  </select>
                  <span className="absolute bottom-3 right-3 flex items-center text-gray-400 pointer-events-none">▼</span>
                </div>
              </div>
            )}



            {/* Therapists Main Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-[280px] bg-gray-50 rounded-3xl animate-pulse"></div>
                ))
              ) : filteredDoctors.length > 0 ? (
                filteredDoctors.map((doctor) => {
                  const displayPhoto = doctor.profilePhoto || doctor.user.image
                  const docId = doctor.id
                  const isBookmarked = bookmarks[docId] || false
                  const nextSlotLabel = getNextAvailableSlot(doctor)
                  const isPlaceholder = !displayPhoto || displayPhoto === "null" || displayPhoto === "undefined" || displayPhoto.includes("googleusercontent.com/a/") || doctor.user.name?.includes("Charan")

                  const renderProfessionalAvatar = () => {
                    if (isPlaceholder) {
                      if (doctor.user.name?.includes("Charan")) {
                        return (
                          <svg viewBox="0 0 100 100" className="w-full h-full object-cover"><circle cx="50" cy="50" r="50" fill="#E8F5F5" /><rect x="46" y="55" width="8" height="15" fill="#E5B28F" /><circle cx="50" cy="44" r="17" fill="#F2C19E" /><path d="M33 38c0-8 6-13 17-13s17 5 17 13v3h-34v-3z" fill="#3D3028" /><path d="M33 46c0 10 7 17 17 17s17-7 17-17h-3v3c0 7-6 11-14 11s-14-4-14-11v-3" fill="#3D3028" /><path d="M43 51c3 1 11 1 14 0c1-1 1-2 0-2c-2 0-12 0-14 2" fill="#3D3028" /><circle cx="44" cy="42" r="1.5" fill="#2E2521" /><circle cx="56" cy="42" r="1.5" fill="#2E2521" /><circle cx="44" cy="42" r="4.0" fill="none" stroke="#2E2521" strokeWidth="1.2" /><circle cx="56" cy="42" r="4.0" fill="none" stroke="#2E2521" strokeWidth="1.2" /><line x1="48" y1="42" x2="52" y2="42" stroke="#2E2521" strokeWidth="1.2" /><path d="M47 48c1 1 5 1 6 0" fill="none" stroke="#E36D49" strokeWidth="1.5" strokeLinecap="round" /><path d="M22 85c0-12 10-20 20-20h16c10 0 20 8 20 20v15H22V85z" fill="#E36D49" /><path d="M50 65l-5 12h10z" fill="#E8F5F5" /></svg>
                        )
                      }
                      return (
                        <svg viewBox="0 0 100 100" className="w-full h-full object-cover"><circle cx="50" cy="50" r="50" fill="#FFE9DF" /><circle cx="50" cy="38" r="23" fill="#4B3F38" /><rect x="46" y="52" width="8" height="15" fill="#F4C3A1" /><circle cx="50" cy="44" r="17" fill="#FAD4B2" /><path d="M33 38c0-10 8-16 17-16s17 6 17 16c0 3-1 5-2 5s-2-4-4-4s-3 3-5 3s-3-2-6-2s-6 3-6 3s-1-5-1-5" fill="#4B3F38" /><circle cx="50" cy="18" r="7" fill="#4B3F38" /><circle cx="44" cy="44" r="1.5" fill="#2E2521" /><circle cx="56" cy="44" r="1.5" fill="#2E2521" /><circle cx="44" cy="44" r="4.5" fill="none" stroke="#E36D49" strokeWidth="1.2" /><circle cx="56" cy="44" r="4.5" fill="none" stroke="#E36D49" strokeWidth="1.2" /><line x1="48.5" y1="44" x2="51.5" y2="44" stroke="#E36D49" strokeWidth="1.2" /><path d="M46 51c1.5 2 5.5 2 7 0" fill="none" stroke="#E36D49" strokeWidth="1.5" strokeLinecap="round" /><path d="M22 85c0-12 10-20 20-20h16c10 0 20 8 20 20v15H22V85z" fill="#1A6B6B" /><path d="M50 65l-6 10h12z" fill="#FFF3E8" /></svg>
                      )
                    }
                    return <Image src={displayPhoto} alt={doctor.user.name || "Doctor"} fill className="object-cover" />
                  }

                  return (
                    <div
                      key={doctor.id}
                      className="bg-white rounded-[32px] p-6 border border-gray-100 flex flex-col relative shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-300 text-left group"
                    >
                      <button
                        onClick={() => setBookmarks(prev => ({ ...prev, [docId]: !isBookmarked }))}
                        className="absolute top-6 right-6 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center text-gray-300 hover:text-orange-500 transition-colors border border-gray-100"
                      >
                        <svg viewBox="0 0 24 24" fill={isBookmarked ? "#E36D49" : "none"} stroke={isBookmarked ? "#E36D49" : "currentColor"} strokeWidth="2" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>
                      </button>

                      <Link href={`/patient/therapists/${doctor.id}`} className="flex flex-col flex-1">
                        <div className="flex items-center gap-5">
                          <div className="w-[84px] h-[84px] rounded-2xl overflow-hidden relative shrink-0 bg-gradient-to-t from-[#FFE9DF] to-[#FFF9F5] border border-gray-100 shadow-inner">
                            {renderProfessionalAvatar()}
                          </div>
                          
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-[11px] font-black uppercase tracking-wider text-[#E36D49] mb-1">{doctor.specialization || "Psychologist"}</span>
                            <h3 className="text-[18px] font-extrabold text-gray-900 truncate leading-tight">{doctor.user.name}</h3>
                            <p className="text-xs font-bold text-gray-400 mt-1">
                              {doctor.yearsOfExperience || doctor.experience || 5}+ years exp.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 mt-5 text-xs font-bold text-gray-500">
                          <svg className="w-4 h-4 text-yellow-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          <span className="text-gray-900 font-black">4.9</span>
                          <span>(128)</span>
                          <span className="mx-1">•</span>
                          <span>₹{doctor.consultationFee} / session</span>
                        </div>
                      </Link>

                      <div className="mt-5 pt-5 border-t border-gray-50 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Next Available</span>
                          <span className="text-[12px] font-black text-gray-900 mt-0.5">{nextSlotLabel.split(" ")[0]} {nextSlotLabel.split(" ")[1]}</span>
                        </div>
                        <Link
                          href={`/patient/therapists/${doctor.id}`}
                          className="bg-[#131E29] hover:bg-[#E36D49] text-white px-5 py-2.5 rounded-xl text-xs font-black transition-colors shadow-sm"
                        >
                          Book
                        </Link>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="col-span-full bg-gray-50 rounded-3xl p-16 text-center">
                  <span className="text-4xl block mb-4">🔎</span>
                  <h3 className="text-lg font-black text-gray-900">No matching experts found</h3>
                  <p className="text-sm font-semibold text-gray-500 mt-2 max-w-md mx-auto">Try adjusting your filters or search terms to find available professionals.</p>
                </div>
              )}
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-2 text-xs font-bold text-gray-400 bg-gray-50 py-4 rounded-2xl">
              <span className="text-base">🛡️</span>
              All professionals are verified and follow strict ethical guidelines.
            </div>

        </div>

      </div>

      {/* =============================================================== */}
      {/* 5. VALIDAITON CHECKOUT MODAL POPUP */}
      {/* =============================================================== */}
      {showBookingModal && bookingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] max-w-md w-full p-6 shadow-2xl border border-gray-100 flex flex-col gap-5 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-gray-900">Confirm Booking</h3>
                <p className="text-xs font-bold text-gray-400 mt-0.5">{bookingDoctor.user.name}</p>
              </div>
              <button 
                onClick={() => setShowBookingModal(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-all"
              >
                ✕
              </button>
            </div>

            {/* Parameter selection details */}
            <div className="bg-orange-50/10 border border-orange-100/30 rounded-2xl p-4 text-xs font-bold text-gray-600 flex flex-col gap-2">
              {/* Card nested dynamic slots selector */}
              <div className="flex items-center justify-between border-b border-gray-50 pb-2 mb-1">
                <span className="text-gray-400">Select Session Date:</span>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => {
                      const d = selectedCardDate[bookingDoctor.id] || new Date()
                      if (isSameDay(d, new Date())) return
                      setSelectedCardDate(prev => ({ ...prev, [bookingDoctor.id]: subDays(d, 1) }))
                      setSelectedTimeSlot(prev => ({ ...prev, [bookingDoctor.id]: "" }))
                    }}
                    disabled={isSameDay(selectedCardDate[bookingDoctor.id] || new Date(), new Date())}
                    className="w-5 h-5 flex items-center justify-center bg-gray-50 text-[10px] disabled:opacity-30 rounded hover:text-orange-500"
                  >
                    ◀
                  </button>
                  <span className="text-gray-800 text-[11px] font-black">
                    {format(selectedCardDate[bookingDoctor.id] || new Date(), "d MMM")}
                  </span>
                  <button 
                    onClick={() => {
                      const d = selectedCardDate[bookingDoctor.id] || new Date()
                      setSelectedCardDate(prev => ({ ...prev, [bookingDoctor.id]: addDays(d, 1) }))
                      setSelectedTimeSlot(prev => ({ ...prev, [bookingDoctor.id]: "" }))
                    }}
                    className="w-5 h-5 flex items-center justify-center bg-gray-50 text-[10px] rounded hover:text-orange-500"
                  >
                    ▶
                  </button>
                </div>
              </div>

              {/* Time selection container */}
              <div className="flex flex-col gap-2">
                <span className="text-gray-400">Available slots:</span>
                <div className="grid grid-cols-3 gap-1.5 max-h-[100px] overflow-y-auto pr-1">
                  {getSlotsForDate(bookingDoctor, selectedCardDate[bookingDoctor.id] || new Date()).length > 0 ? (
                    getSlotsForDate(bookingDoctor, selectedCardDate[bookingDoctor.id] || new Date()).map((slot, si) => {
                      const isSel = selectedTimeSlot[bookingDoctor.id] === slot.time
                      return (
                        <button
                          key={si}
                          disabled={slot.status !== 'available'}
                          onClick={() => setSelectedTimeSlot(prev => ({ ...prev, [bookingDoctor.id]: slot.time }))}
                          className={`py-1.5 rounded-lg border text-[10px] font-black transition-all text-center
                            ${isSel
                              ? "bg-[#E36D49] border-[#E36D49] text-white"
                              : slot.status === 'booked'
                              ? "border-red-50 bg-red-50/10 text-red-300 cursor-not-allowed"
                              : slot.status === 'unavailable'
                              ? "border-gray-50 bg-gray-50/20 text-gray-300 cursor-not-allowed"
                              : "border-gray-100 bg-white text-gray-500 hover:border-orange-300 hover:text-[#E36D49]"
                            }
                          `}
                        >
                          {slot.time}
                        </button>
                      )
                    })
                  ) : (
                    <span className="text-[10px] font-bold text-gray-400 col-span-3">No available slots on this day.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Note entry concerns */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Brief Concerns</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly describe what you'd like to address during this session..."
                className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:border-orange-500 focus:bg-white outline-none min-h-[90px] text-xs font-semibold transition-all resize-none placeholder:text-gray-300"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 font-black rounded-xl transition-all text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleBookingConfirm}
                disabled={isBooking || !reason.trim() || !selectedTimeSlot[bookingDoctor.id]}
                className="flex-1 py-3 bg-[#E36D49] hover:bg-[#c95937] disabled:opacity-50 disabled:pointer-events-none text-white rounded-xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                {isBooking ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Confirm & Pay"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================== */}
      {/* 6. PROFILE MODAL POPUP (When VIEW PROFILE is clicked) */}
      {/* =============================================================== */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] max-w-lg w-full p-6 shadow-2xl border border-gray-100 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black text-gray-900">{showProfileModal.user.name}</h3>
                <p className="text-xs font-bold text-[#E36D49] mt-0.5">
                  {showProfileModal.primarySpecialization || showProfileModal.specialization || "Psychologist"}
                </p>
              </div>
              <button 
                onClick={() => setShowProfileModal(null)}
                className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-all"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-4">
              <div className="w-24 h-24 rounded-full overflow-hidden relative border border-gray-100 shrink-0">
                {showProfileModal.profilePhoto || showProfileModal.user.image ? (
                  <Image src={showProfileModal.profilePhoto || showProfileModal.user.image || ""} fill alt="Doctor" className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-50 flex items-center justify-center text-3xl">👩‍⚕️</div>
                )}
              </div>
              <div className="text-left flex flex-col justify-center text-xs font-bold text-gray-500 gap-1.5">
                <p>💼 Years of Experience: <span className="text-gray-900">{showProfileModal.yearsOfExperience || showProfileModal.experience || 5}+ years</span></p>
                <p>🗣️ Languages: <span className="text-gray-900">{showProfileModal.languagesSpoken?.join(", ") || "English, Hindi"}</span></p>
                <p>🏷️ Consult fee: <span className="text-gray-900">₹{showProfileModal.consultationFee}</span></p>
              </div>
            </div>

            <div className="border-t border-gray-50 pt-4 text-left">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">📜 Biography</h4>
              <p className="text-xs font-semibold text-gray-500 leading-relaxed max-h-[120px] overflow-y-auto">
                {showProfileModal.bio || `Dr. ${showProfileModal.user.name} is a certified therapist who uses compassionate cognitive behavioral therapies to help patients build resilience, develop strong coping strategies, and manage mental stressors.`}
              </p>
            </div>

            <div className="border-t border-gray-50 pt-4 text-left">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2.5">💡 Focus Areas</h4>
              <div className="flex flex-wrap gap-1.5">
                {(showProfileModal.secondarySpecializations || ["Anxiety guidance", "Relationship skills", "Stress management"]).map((spec) => (
                  <span key={spec} className="px-3 py-1 bg-gray-50 rounded-lg text-[10px] font-bold text-gray-600 border border-gray-100">
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-50">
              <button
                onClick={() => setShowProfileModal(null)}
                className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 font-black rounded-xl text-xs transition-all"
              >
                Close Profile
              </button>
              <button
                onClick={() => {
                  setShowProfileModal(null)
                  setBookingDoctor(showProfileModal)
                  setSelectedCardDate(prev => ({ ...prev, [showProfileModal.id]: new Date() }))
                  setShowBookingModal(true)
                }}
                className="flex-1 py-3 bg-[#E36D49] hover:bg-[#c95937] text-white font-black rounded-xl text-xs transition-all"
              >
                BOOK NOW
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
