import { Suspense } from "react"
import { auth } from "@/auth.config"
import TryPragyaChat from "@/components/ai-bot/TryPragyaChat"
import AIBotSkeleton from "@/components/ai-bot/AIBotSkeleton"
import { prisma } from "@/lib/prisma"

async function AIBotContent() {
  const session = await auth()
  
  if (!session?.user?.id) return null

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return null

  const sessionId = `patient_${session.user.id}`
  
  const today = new Date().toISOString().split("T")[0]
  const isSameDay = user.lastAiChatDate === today
  const dailyAiChatCount = isSameDay ? user.dailyAiChatCount : 0

  return (
    <div className="flex-1 min-w-0 h-full flex flex-col relative w-full overflow-hidden bg-[var(--color-bg)]">
      <TryPragyaChat 
        sessionId={sessionId} 
        initialPlan={user.plan} 
        initialChatCount={dailyAiChatCount}
        userName={user.name || "User"}
      />
    </div>
  )
}

export default function AIBotPage() {
  return (
    <Suspense fallback={<AIBotSkeleton />}>
      <AIBotContent />
    </Suspense>
  )
}
