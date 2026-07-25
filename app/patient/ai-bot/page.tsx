import { Suspense } from "react"
import { auth } from "@/auth.config"
import TryPragyaChat from "@/components/ai-bot/TryPragyaChat"
import AIBotSkeleton from "@/components/ai-bot/AIBotSkeleton"
import AiOnboarding from "@/components/ai-bot/AiOnboarding"
import { prisma } from "@/lib/prisma"

async function AIBotContent() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return (
      <div className="flex-1 min-w-0 h-full flex flex-col relative w-full overflow-hidden bg-[var(--color-bg)]">
        <TryPragyaChat 
          sessionId="" 
          initialPlan="FREE" 
          initialChatCount={0}
          userName="Guest"
        />
      </div>
    )
  }

  const user = await prisma.user.findUnique({ 
    where: { id: session.user.id },
    include: { patient: true }
  })
  if (!user) {
    return (
      <div className="flex-1 min-w-0 h-full flex flex-col relative w-full overflow-hidden bg-[var(--color-bg)]">
        <TryPragyaChat 
          sessionId="" 
          initialPlan="FREE" 
          initialChatCount={0}
          userName="Guest"
        />
      </div>
    )
  }

  const sessionId = `patient_${session.user.id}`

  const hasOnboarded = !!user.patient?.aiNickname

  return (
    <div className="flex-1 min-w-0 h-full flex flex-col relative w-full overflow-hidden bg-[var(--color-bg)]">
      {hasOnboarded ? (
        <TryPragyaChat 
          sessionId={sessionId} 
          initialPlan={user.plan} 
          initialChatCount={0}
          userName={user.patient?.aiNickname || user.name || "User"}
        />
      ) : (
        <AiOnboarding />
      )}
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
