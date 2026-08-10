import Shimmer from "@/components/ui/Shimmer"

export default function AIBotSkeleton() {
  return (
    <div className="flex flex-col h-full bg-white text-gray-800 overflow-hidden font-sans relative w-full flex-1">
      <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto overflow-hidden relative h-full z-10 px-4 md:px-8">
        
        {/* Top Navigation Skeleton */}
        <div className="w-full flex items-center justify-between py-6 shrink-0 z-20">
          <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse -ml-3"></div>
          <div className="flex items-center gap-4">
             <div className="h-9 w-20 bg-gray-100 rounded-full animate-pulse"></div>
             <div className="h-9 w-9 bg-gray-100 rounded-full animate-pulse -mr-3"></div>
          </div>
        </div>

        {/* Unified Chat Layout Skeleton */}
        <div className="w-full flex flex-col h-full overflow-hidden relative pt-4 md:pt-8 flex-1 justify-center -mt-16">
          <div className="w-full flex flex-col items-center shrink-0 relative z-10">
            
            {/* Avatar, Greeting & Title Skeleton */}
            <div className="flex flex-col items-center mb-8">
              <div className="mb-4 flex items-center justify-center relative shrink-0">
                <div className="w-[96px] h-[96px] rounded-[2rem] bg-gray-100 animate-pulse relative overflow-hidden">
                    <Shimmer />
                </div>
              </div>
              <div className="h-3 w-28 bg-gray-200 rounded animate-pulse mb-6 mt-2"></div>
              <div className="h-8 w-64 md:w-80 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
            </div>

            {/* Mode Buttons 2x2 Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-[560px] px-2">
               {[1, 2, 3, 4].map((i) => (
                 <div key={i} className="flex items-center gap-4 px-3 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                   <div className="w-[26px] h-[26px] rounded-lg bg-gray-100 flex-shrink-0 animate-pulse"></div>
                   <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                 </div>
               ))}
            </div>
            
          </div>
        </div>
        
        {/* Bottom Input Area Skeleton */}
        <div className="relative shrink-0 w-full pb-6 z-20 mt-auto">
          <div className="relative flex items-center justify-between w-full mx-auto bg-gray-50/50 rounded-3xl border border-gray-200 p-2 pl-4">
             <div className="h-10 flex-1 bg-transparent my-1 ml-2 flex items-center">
                 <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
             </div>
             <div className="flex items-center gap-2 pr-1">
                <div className="w-10 h-10 rounded-full bg-orange-100/50 animate-pulse"></div>
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}
