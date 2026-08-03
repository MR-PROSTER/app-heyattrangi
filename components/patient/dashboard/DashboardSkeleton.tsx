import Shimmer from "@/components/ui/Shimmer"

export default function DashboardSkeleton() {
  return (
    <div className="flex flex-1 w-full relative h-full bg-white overflow-hidden">
      <Shimmer />
      {/* Center Column Skeleton */}
      <div className="flex-1 min-w-0 h-full p-8 space-y-8">
        <div className="space-y-3">
          <div className="h-10 w-64 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-48 bg-gray-100 rounded-md"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-gray-100 rounded-3xl"></div>
          <div className="h-48 bg-gray-100 rounded-3xl"></div>
        </div>

        <div className="space-y-4">
          <div className="h-6 w-32 bg-gray-200 rounded-md"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-50 rounded-2xl border border-gray-100"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
