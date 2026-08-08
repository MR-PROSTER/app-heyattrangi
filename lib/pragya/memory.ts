import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export interface MemoryGraph {
  personal: Record<string, unknown>
  clinical: unknown[]
  relational: unknown[]
  behavioral: Record<string, unknown>
  wellness: Record<string, unknown>
  sessionSummary: Record<string, unknown>
}

const EMPTY_MEMORY: MemoryGraph = {
  personal: {},
  clinical: [],
  relational: [],
  behavioral: {},
  wellness: {},
  sessionSummary: {},
}

export async function getMemoryGraph(userId: string): Promise<MemoryGraph> {
  try {
    const record = await prisma.userMemoryGraph.findUnique({
      where: { userId },
    })
    if (!record) return { ...EMPTY_MEMORY }
    return {
      personal: (record.personal as Record<string, unknown>) ?? {},
      clinical: (record.clinical as unknown[]) ?? [],
      relational: (record.relational as unknown[]) ?? [],
      behavioral: (record.behavioral as Record<string, unknown>) ?? {},
      wellness: (record.wellness as Record<string, unknown>) ?? {},
      sessionSummary: (record.sessionSummary as Record<string, unknown>) ?? {},
    }
  } catch {
    return { ...EMPTY_MEMORY }
  }
}

export async function upsertMemoryGraph(
  userId: string,
  data: Partial<MemoryGraph>,
): Promise<void> {
  try {
    await prisma.userMemoryGraph.upsert({
      where: { userId },
      update: {
        ...(data.personal !== undefined && { personal: data.personal as unknown as Prisma.InputJsonValue }),
        ...(data.clinical !== undefined && { clinical: data.clinical as unknown as Prisma.InputJsonValue }),
        ...(data.relational !== undefined && { relational: data.relational as unknown as Prisma.InputJsonValue }),
        ...(data.behavioral !== undefined && { behavioral: data.behavioral as unknown as Prisma.InputJsonValue }),
        ...(data.wellness !== undefined && { wellness: data.wellness as unknown as Prisma.InputJsonValue }),
        ...(data.sessionSummary !== undefined && { sessionSummary: data.sessionSummary as unknown as Prisma.InputJsonValue }),
      },
      create: {
        userId,
        personal: (data.personal ?? {}) as unknown as Prisma.InputJsonValue,
        clinical: (data.clinical ?? []) as unknown as Prisma.InputJsonValue,
        relational: (data.relational ?? []) as unknown as Prisma.InputJsonValue,
        behavioral: (data.behavioral ?? {}) as unknown as Prisma.InputJsonValue,
        wellness: (data.wellness ?? {}) as unknown as Prisma.InputJsonValue,
        sessionSummary: (data.sessionSummary ?? {}) as unknown as Prisma.InputJsonValue,
      },
    })
  } catch (e) {
    console.warn("[memory] Failed to upsert memory graph:", e)
  }
}
