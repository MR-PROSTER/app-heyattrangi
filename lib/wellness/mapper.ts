import type { WellnessActivity as PrismaWellnessActivity, WellnessActivityCategory } from "@prisma/client"
import type { WellnessActivity, WellnessCategoryId } from "@/lib/wellness/presentation"
import { getActivityIconPath } from "@/lib/wellness/presentation"

const CATEGORY_TO_ID: Record<WellnessActivityCategory, WellnessCategoryId> = {
  BREATHING: "breathing",
  GROUNDING: "grounding",
  RELAXATION: "relaxation",
  JOURNALING: "journaling",
  SLEEP: "sleep",
}

export const CATEGORY_ID_TO_ENUM: Record<
  WellnessCategoryId,
  WellnessActivityCategory
> = {
  breathing: "BREATHING",
  grounding: "GROUNDING",
  relaxation: "RELAXATION",
  journaling: "JOURNALING",
  sleep: "SLEEP",
}

export function mapWellnessActivityToClient(
  row: PrismaWellnessActivity
): WellnessActivity {
  return {
    id: row.id,
    slug: row.slug,
    categoryId: CATEGORY_TO_ID[row.category],
    title: row.title,
    shortDescription: row.shortDescription,
    estimatedDuration: row.estimatedDuration,
    benefits: row.benefits,
    instructions: row.instructions,
    iconPath: getActivityIconPath(row.slug),
    audioUrl: row.audioUrl,
    displayOrder: row.displayOrder,
    phase: row.phase,
    isAvailable: row.isAvailable,
  }
}
