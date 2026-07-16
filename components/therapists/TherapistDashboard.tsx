"use client"

import { useState } from "react"
import TherapistList from "@/components/therapists/TherapistList"
import AppointmentsList from "@/components/appointments/AppointmentsList"

type Tab = "book" | "sessions"

interface TherapistDashboardProps {
  upcomingAppointments: any[]
  pastAppointments: any[]
}

export default function TherapistDashboard({ upcomingAppointments, pastAppointments }: TherapistDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("book")

  return (
    <div className="flex-1 min-w-0 h-full overflow-y-auto w-full bg-white">
      <main className="w-full">
        {/* Tabs Header */}
        <div className="max-w-[1440px] mx-auto px-8 pt-10 pb-2">
          <div className="flex items-center justify-center gap-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("book")}
              className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-all border-b-4 ${
                activeTab === "book"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              Book Session
            </button>
            <button
              onClick={() => setActiveTab("sessions")}
              className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-all border-b-4 ${
                activeTab === "sessions"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              My Sessions
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "book" && (
          <div className="animate-in fade-in duration-300">
            <TherapistList />
          </div>
        )}

        {activeTab === "sessions" && (
          <div className="max-w-[1440px] mx-auto px-8 pt-8 animate-in fade-in duration-300">
             <div className="mb-10">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">My Sessions</h1>
                <p className="text-gray-500 font-medium">Manage your upcoming and past therapy sessions.</p>
             </div>
            <AppointmentsList
              upcomingAppointments={upcomingAppointments}
              pastAppointments={pastAppointments}
            />
          </div>
        )}
      </main>
    </div>
  )
}
