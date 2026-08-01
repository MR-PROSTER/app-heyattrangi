import Sidebar from "@/components/patient/Sidebar"
import LoadingBar from "@/components/ui/LoadingBar"

export default function ExploreDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen w-full bg-white overflow-hidden relative">
      <LoadingBar />
      <Sidebar />
      <div className="flex-1 min-w-0 h-full flex flex-col relative overflow-hidden">
        {children}
      </div>
    </div>
  )
}
