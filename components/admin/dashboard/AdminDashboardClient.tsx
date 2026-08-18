"use client"

import React, { useState, useTransition, useMemo } from "react"
import useSWR from "swr"
import { Users, ShieldCheck, Flame, BookOpen, Headphones, Activity, RefreshCw, AlertTriangle, Building, MessageSquare, Plus, ArrowUpRight } from "lucide-react"

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error("Failed to fetch analytics")
  return res.json()
})

interface GrowthPoint {
  label: string
  count: number
}

interface InstitutionData {
  id: string
  name: string
  status: string
  totalUsers: number
  activeUsers: number
  activationRate: number
  chatUsage: number
  moodUsage: number
}

interface AnalyticsData {
  overview: {
    totalUsers: number
    activeUsers: number
    activationRate: number
    growthData: GrowthPoint[]
  }
  engagement: {
    dau: number
    wau: number
    mau: number
    chatUsage: number
    moodCheckIns: number
    avgMoodScore: number
    journalEntries: number
    activitiesCompleted: number
    assessmentsCompleted: number
  }
  streakDistribution: Record<string, number>
  repeatUsage: Record<string, number>
  institutions: InstitutionData[]
}

export default function AdminDashboardClient() {
  const [range, setRange] = useState("30days")
  const { data, error, isLoading, mutate } = useSWR<AnalyticsData>(
    `/api/admin/analytics?range=${range}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 10000 }
  )

  const [isMutating, startMutation] = useTransition()

  const handleRefresh = () => {
    startMutation(async () => {
      await mutate()
    })
  }

  // Native SVG Line Chart calculations
  const growthChartSvg = useMemo(() => {
    if (!data?.overview?.growthData || data.overview.growthData.length === 0) return null
    
    const points = data.overview.growthData
    const width = 600
    const height = 180
    const paddingLeft = 40
    const paddingRight = 20
    const paddingTop = 20
    const paddingBottom = 30

    const maxVal = Math.max(...points.map(p => p.count), 5)
    
    const chartWidth = width - paddingLeft - paddingRight
    const chartHeight = height - paddingTop - paddingBottom

    const coords = points.map((p, index) => {
      const x = paddingLeft + (index / (points.length - 1 || 1)) * chartWidth
      const y = paddingTop + chartHeight - (p.count / maxVal) * chartHeight
      return { x, y, label: p.label, val: p.count }
    })

    // Build SVG Path string
    let path = ""
    let areaPath = ""
    
    if (coords.length > 0) {
      path = `M ${coords[0].x} ${coords[0].y} `
      areaPath = `M ${coords[0].x} ${paddingTop + chartHeight} L ${coords[0].x} ${coords[0].y} `
      
      for (let i = 1; i < coords.length; i++) {
        path += `L ${coords[i].x} ${coords[i].y} `
        areaPath += `L ${coords[i].x} ${coords[i].y} `
      }
      
      areaPath += `L ${coords[coords.length - 1].x} ${paddingTop + chartHeight} Z`
    }

    return {
      width,
      height,
      coords,
      path,
      areaPath,
      paddingLeft,
      paddingTop,
      chartHeight,
      chartWidth,
      maxVal
    }
  }, [data])

  if (isLoading || isMutating) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Skeleton Date Filter */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
          <div className="h-8 bg-zinc-100 rounded w-48" />
          <div className="h-8 bg-zinc-100 rounded w-24" />
        </div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-[2rem] p-8 border border-zinc-100 h-36" />
          ))}
        </div>

        {/* Skeleton Chart */}
        <div className="bg-white rounded-[2rem] p-8 border border-zinc-100 h-64" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 border border-rose-200/50 rounded-3xl p-8 text-center space-y-4 max-w-xl mx-auto mt-12 shadow-sm">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-black text-rose-950">Unable to load dashboard data</h3>
        <p className="text-sm text-rose-600 font-medium leading-relaxed">
          There was an error communicating with the internal analytics server. Please check your credentials or try again.
        </p>
        <button
          onClick={handleRefresh}
          className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold px-6 py-3 rounded-full shadow transition-all text-sm"
        >
          Retry Load
        </button>
      </div>
    )
  }

  const { overview, engagement, streakDistribution, repeatUsage, institutions } = data

  return (
    <div className="space-y-8">
      {/* Date Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-zinc-100 shadow-sm relative z-10">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {["today", "7days", "30days", "90days"].map(v => (
            <button
              key={v}
              onClick={() => setRange(v)}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                range === v
                  ? "bg-[#FF6B4A] text-white shadow-sm"
                  : "bg-zinc-50 hover:bg-zinc-100 text-zinc-600"
              }`}
            >
              {v === "7days" ? "Last 7 Days" : v === "30days" ? "Last 30 Days" : v === "90days" ? "Last 90 Days" : "Today"}
            </button>
          ))}
        </div>
        
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-zinc-500 hover:text-zinc-800 transition-colors bg-zinc-50 hover:bg-zinc-100 px-4 py-2.5 rounded-xl cursor-pointer"
        >
          <RefreshCw size={14} className={isMutating ? "animate-spin" : ""} />
          Refresh Data
        </button>
      </div>

      {/* Overview Cards */}
      <section className="space-y-4">
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 text-[#FF6B4A] flex items-center justify-center mb-6">
              <Users size={22} />
            </div>
            <h4 className="text-zinc-400 font-bold text-sm mb-1.5">Total Registered Patients</h4>
            <p className="text-4xl font-black text-zinc-950 tracking-tight">{overview.totalUsers}</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6">
              <Activity size={22} />
            </div>
            <h4 className="text-zinc-400 font-bold text-sm mb-1.5">Active Patients (Period)</h4>
            <p className="text-4xl font-black text-zinc-950 tracking-tight">{overview.activeUsers}</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-6">
              <ShieldCheck size={22} />
            </div>
            <h4 className="text-zinc-400 font-bold text-sm mb-1.5">Activation Rate</h4>
            <p className="text-4xl font-black text-zinc-950 tracking-tight">{(overview.activationRate * 100).toFixed(1)}%</p>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
              <Plus size={22} />
            </div>
            <h4 className="text-zinc-400 font-bold text-sm mb-1.5">New Patients Added</h4>
            <p className="text-4xl font-black text-zinc-950 tracking-tight">
              {overview.growthData.reduce((acc, curr) => acc + curr.count, 0)}
            </p>
          </div>
        </div>
      </section>

      {/* User Growth Chart */}
      <section className="bg-white border border-gray-100 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
        <h3 className="text-lg font-black text-gray-900 mb-6 tracking-tight">New User Growth Trend</h3>
        {growthChartSvg && growthChartSvg.coords.length > 0 ? (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[600px] h-[220px]">
              <svg viewBox={`0 0 ${growthChartSvg.width} ${growthChartSvg.height}`} className="w-full h-full">
                {/* Horizontal grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                  const y = growthChartSvg.paddingTop + ratio * growthChartSvg.chartHeight
                  const gridVal = Math.round(growthChartSvg.maxVal - ratio * growthChartSvg.maxVal)
                  return (
                    <g key={index}>
                      <line
                        x1={growthChartSvg.paddingLeft}
                        y1={y}
                        x2={growthChartSvg.width - 20}
                        y2={y}
                        stroke="#f4f4f5"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={growthChartSvg.paddingLeft - 8}
                        y={y + 4}
                        fill="#a1a1aa"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="end"
                      >
                        {gridVal}
                      </text>
                    </g>
                  )
                })}

                {/* Shaded Area underneath the line */}
                <path d={growthChartSvg.areaPath} fill="url(#chartGradient)" />

                {/* Main Line path */}
                <path d={growthChartSvg.path} fill="none" stroke="#FF6B4A" strokeWidth="3" strokeLinecap="round" />

                {/* Circular points */}
                {growthChartSvg.coords.map((c, i) => (
                  <circle
                    key={i}
                    cx={c.x}
                    cy={c.y}
                    r="4"
                    fill="#white"
                    stroke="#FF6B4A"
                    strokeWidth="2.5"
                    className="hover:r-6 cursor-pointer transition-all"
                  />
                ))}

                {/* X Axis Labels */}
                {growthChartSvg.coords.map((c, i) => {
                  // Filter labels to prevent overcrowding on dense scales
                  const showLabel = growthChartSvg.coords.length <= 15 || i % Math.round(growthChartSvg.coords.length / 7) === 0
                  if (!showLabel) return null
                  return (
                    <text
                      key={i}
                      x={c.x}
                      y={growthChartSvg.height - 8}
                      fill="#a1a1aa"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {c.label}
                    </text>
                  )
                })}

                {/* Gradient Definition */}
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF6B4A" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#FF6B4A" stopOpacity="0.00" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-zinc-400 font-medium text-sm">
            No registration data available in this timeframe.
          </div>
        )}
      </section>

      {/* Engagement Section */}
      <section className="space-y-4">
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">User Engagement</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* DAU */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 flex items-center justify-between">
            <div>
              <h4 className="text-zinc-400 font-bold text-xs uppercase tracking-wider mb-1">Daily Active Users</h4>
              <p className="text-3xl font-black text-zinc-950">{engagement.dau}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <Activity size={18} />
            </div>
          </div>
          {/* WAU */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 flex items-center justify-between">
            <div>
              <h4 className="text-zinc-400 font-bold text-xs uppercase tracking-wider mb-1">Weekly Active Users</h4>
              <p className="text-3xl font-black text-zinc-950">{engagement.wau}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
              <Activity size={18} />
            </div>
          </div>
          {/* MAU */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 flex items-center justify-between">
            <div>
              <h4 className="text-zinc-400 font-bold text-xs uppercase tracking-wider mb-1">Monthly Active Users</h4>
              <p className="text-3xl font-black text-zinc-950">{engagement.mau}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <Activity size={18} />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Usage Stats */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Activity counters */}
        <div className="bg-white border border-gray-100 rounded-[2rem] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] space-y-6">
          <h3 className="text-lg font-black text-gray-900 tracking-tight">Feature Usage Distribution</h3>
          
          <div className="space-y-4">
            {/* Row 1: Chat */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-zinc-700 flex items-center gap-2">
                  <MessageSquare size={16} className="text-blue-500" /> Chat Messages
                </span>
                <span className="font-extrabold text-zinc-950">{engagement.chatUsage}</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (engagement.chatUsage / 2000) * 100)}%` }} />
              </div>
            </div>

            {/* Row 2: Mood entries */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-zinc-700 flex items-center gap-2">
                  <Activity size={16} className="text-emerald-500" /> Mood Check-ins
                </span>
                <span className="font-extrabold text-zinc-950">{engagement.moodCheckIns}</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (engagement.moodCheckIns / 1000) * 100)}%` }} />
              </div>
            </div>

            {/* Row 3: Journal entries */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-zinc-700 flex items-center gap-2">
                  <BookOpen size={16} className="text-amber-500" /> Journal Entries
                </span>
                <span className="font-extrabold text-zinc-950">{engagement.journalEntries}</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, (engagement.journalEntries / 500) * 100)}%` }} />
              </div>
            </div>

            {/* Row 4: Wellness Activity completes */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-zinc-700 flex items-center gap-2">
                  <Headphones size={16} className="text-purple-500" /> Completed Activities
                </span>
                <span className="font-extrabold text-zinc-950">{engagement.activitiesCompleted}</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(100, (engagement.activitiesCompleted / 1000) * 100)}%` }} />
              </div>
            </div>

            {/* Row 5: Assessments completes */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-zinc-700 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#FF6B4A]" /> Completed Assessments
                </span>
                <span className="font-extrabold text-zinc-950">{engagement.assessmentsCompleted}</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#FF6B4A] rounded-full" style={{ width: `${Math.min(100, (engagement.assessmentsCompleted / 500) * 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Wellbeing engagement metrics */}
        <div className="bg-white border border-gray-100 rounded-[2rem] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between gap-6">
          <h3 className="text-lg font-black text-gray-900 tracking-tight">Wellbeing Statistics</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-zinc-50/50 border border-zinc-100 rounded-2xl text-center space-y-1">
              <span className="text-2xl font-black text-gray-950">{engagement.avgMoodScore ? engagement.avgMoodScore.toFixed(1) : "0.0"}</span>
              <p className="text-zinc-500 font-bold text-xs">Avg Mood Intensity</p>
            </div>
            
            <div className="p-5 bg-zinc-50/50 border border-zinc-100 rounded-2xl text-center space-y-1">
              <span className="text-2xl font-black text-gray-950">{engagement.activitiesCompleted}</span>
              <p className="text-zinc-500 font-bold text-xs">Activities Completed</p>
            </div>
          </div>

          <div className="space-y-3.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">Patient Streak Distribution</h4>
            <div className="flex gap-2 text-center">
              {Object.entries(streakDistribution).map(([key, count]) => {
                const total = Object.values(streakDistribution).reduce((a, b) => a + b, 0) || 1
                const percent = (count / total) * 100
                return (
                  <div key={key} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="h-16 w-full bg-zinc-50 border border-zinc-100 rounded-xl relative overflow-hidden flex items-end">
                      <div className="w-full bg-[#FF6B4A]/80 transition-all" style={{ height: `${percent}%` }} />
                      <span className="absolute inset-0 flex items-center justify-center font-extrabold text-[10px] text-zinc-800">{count}</span>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-500">{key === "0" ? "0 days" : `${key}d`}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Repeat Usage / Stickiness */}
      <section className="bg-white border border-gray-100 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] space-y-6">
        <h3 className="text-lg font-black text-gray-900 tracking-tight">Active Days Distribution (Repeat Usage)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {Object.entries(repeatUsage).map(([key, count]) => {
            const total = Object.values(repeatUsage).reduce((a, b) => a + b, 0) || 1
            const percent = (count / total) * 100
            return (
              <div key={key} className="p-4 bg-zinc-50/50 border border-zinc-100 rounded-2xl flex flex-col justify-between min-h-[90px]">
                <span className="text-[11px] font-black uppercase text-zinc-400 tracking-wider">{key}</span>
                <div>
                  <span className="text-2xl font-black text-zinc-950">{count}</span>
                  <div className="h-1 w-full bg-zinc-100 rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Institution B2B Table */}
      <section className="bg-white border border-gray-100 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-black text-gray-900 tracking-tight">Institution & School Overview</h3>
          <span className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Building size={14} /> B2B Portals
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 border-b border-zinc-100 text-xs font-black text-zinc-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Institution Name</th>
                <th className="px-6 py-4">Total Users</th>
                <th className="px-6 py-4">Active Users</th>
                <th className="px-6 py-4">Activation Rate</th>
                <th className="px-6 py-4">Chat Messages</th>
                <th className="px-6 py-4">Mood Logs</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm font-semibold text-zinc-700">
              {institutions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-zinc-400 font-medium">
                    No active B2B institutions found.
                  </td>
                </tr>
              ) : (
                institutions.map(inst => (
                  <tr key={inst.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-zinc-950 flex items-center gap-2">
                      {inst.name}
                      <a href={`/admin/organizations?id=${inst.id}`} className="text-zinc-400 hover:text-zinc-800 transition-colors">
                        <ArrowUpRight size={14} />
                      </a>
                    </td>
                    <td className="px-6 py-4">{inst.totalUsers}</td>
                    <td className="px-6 py-4">{inst.activeUsers}</td>
                    <td className="px-6 py-4">{(inst.activationRate * 100).toFixed(1)}%</td>
                    <td className="px-6 py-4">{inst.chatUsage}</td>
                    <td className="px-6 py-4">{inst.moodUsage}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md ${
                        inst.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-600"
                      }`}>
                        {inst.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
