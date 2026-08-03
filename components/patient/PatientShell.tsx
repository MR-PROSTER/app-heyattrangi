"use client"

import Sidebar from "@/components/patient/Sidebar"
import LoadingBar from "@/components/ui/LoadingBar"
import { usePathname } from "next/navigation"

/**
 * Patient chrome (sidebar + shell). Uses client pathname so assessment
 * take-pages hide the sidebar on both SSR and client navigations without
 * hydration mismatches from stale server layout headers.
 */
export default function PatientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || ""
  const hideSidebar = pathname.startsWith("/patient/assessments/")

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden relative">
      <LoadingBar />
      {!hideSidebar && <Sidebar />}
      <div className="flex-1 min-w-0 h-full flex flex-col relative overflow-hidden">
        {children}
      </div>
    </div>
  )
}
