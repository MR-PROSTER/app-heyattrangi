"use client"

import { useEffect, useState } from "react"
import { Trophy, Smile, Edit3 } from "lucide-react"

interface Stats {
  activeDays: number
  moodCheckIns: number
  reflections: number
}

export default function ProfileStatsCard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    async function fetchStats() {
      try {
        const res = await fetch("/api/profile/stats")
        if (!res.ok) {
          throw new Error("Failed to load statistics")
        }
        const data = await res.json()
        if (active) {
          setStats(data)
          setLoading(false)
        }
      } catch (err) {
        console.error("Error loading profile stats:", err)
        if (active) {
          setError(true)
          setLoading(false)
        }
      }
    }
    fetchStats()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="w-full rounded-[28px] border border-slate-100 p-4 sm:p-5 flex flex-row items-center justify-between text-center select-none shadow-[0_4px_20px_rgba(0,0,0,0.01)] mt-2" style={{ backgroundColor: "#FFF9F6" }}>
      {/* Active Days */}
      <div className="flex-1 flex flex-col items-center">
        <Trophy className="w-5 h-5 text-[#3B82F6] stroke-[2]" />
        {loading ? (
          <div className="h-7 w-12 bg-slate-200/60 rounded-lg animate-pulse mt-1" />
        ) : error ? (
          <span className="text-xl sm:text-2xl font-black text-slate-400 mt-1">0</span>
        ) : (
          <span className="text-xl sm:text-2xl font-black text-slate-800 mt-1">
            {stats?.activeDays ?? 0}
          </span>
        )}
        <span className="text-[10px] sm:text-xs text-slate-400 font-bold mt-0.5">
          Active days
        </span>
      </div>

      <div className="h-10 border-r border-slate-100" />

      {/* Mood check-ins */}
      <div className="flex-1 flex flex-col items-center">
        <Smile className="w-5 h-5 text-[#3B82F6] stroke-[2]" />
        {loading ? (
          <div className="h-7 w-12 bg-slate-200/60 rounded-lg animate-pulse mt-1" />
        ) : error ? (
          <span className="text-xl sm:text-2xl font-black text-slate-400 mt-1">0</span>
        ) : (
          <span className="text-xl sm:text-2xl font-black text-slate-800 mt-1">
            {stats?.moodCheckIns ?? 0}
          </span>
        )}
        <span className="text-[10px] sm:text-xs text-slate-400 font-bold mt-0.5">
          Mood check-ins
        </span>
      </div>

      <div className="h-10 border-r border-slate-100" />

      {/* Reflections */}
      <div className="flex-1 flex flex-col items-center">
        <Edit3 className="w-5 h-5 text-[#3B82F6] stroke-[2]" />
        {loading ? (
          <div className="h-7 w-12 bg-slate-200/60 rounded-lg animate-pulse mt-1" />
        ) : error ? (
          <span className="text-xl sm:text-2xl font-black text-slate-400 mt-1">0</span>
        ) : (
          <span className="text-xl sm:text-2xl font-black text-slate-800 mt-1">
            {stats?.reflections ?? 0}
          </span>
        )}
        <span className="text-[10px] sm:text-xs text-slate-400 font-bold mt-0.5">
          Reflections
        </span>
      </div>
    </div>
  )
}
