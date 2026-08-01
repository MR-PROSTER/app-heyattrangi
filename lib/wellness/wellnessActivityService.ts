import { prisma } from "@/lib/prisma"
import type { WellnessCategoryId } from "@/lib/wellness/presentation"
import {
  CATEGORY_ID_TO_ENUM,
  mapWellnessActivityToClient,
} from "@/lib/wellness/mapper"

export async function listAvailableWellnessActivities(
  categoryId?: WellnessCategoryId
) {
  const rows = await prisma.wellnessActivity.findMany({
    where: {
      isAvailable: true,
      ...(categoryId
        ? { category: CATEGORY_ID_TO_ENUM[categoryId] }
        : {}),
    },
    orderBy: [{ displayOrder: "asc" }, { title: "asc" }],
  })

  return rows.map(mapWellnessActivityToClient)
}

export async function getWellnessActivityBySlug(slug: string) {
  const normalized = slug.trim().toLowerCase()
  if (!normalized) return null

  const row = await prisma.wellnessActivity.findFirst({
    where: {
      slug: normalized,
      isAvailable: true,
    },
  })

  return row ? mapWellnessActivityToClient(row) : null
}
