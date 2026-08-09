import { PrismaClient, WellnessActivityCategory } from "@prisma/client"
import { v2 as cloudinary } from "cloudinary"
import { UNIQUE_TRACKS } from "../lib/data/musicLibrary"
import { WELLNESS_ACTIVITIES } from "../lib/data/wellnessActivities"

const prisma = new PrismaClient()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const FOLDER_TO_CATEGORY_MAP: Record<string, string> = {
  "aatrangi_music_ready/calm down": "Calm Down",
  "aatrangi_music_ready/comfort": "Comfort",
  "aatrangi_music_ready/emotional release": "Emotional Release",
  "aatrangi_music_ready/focus": "Focus",
  "aatrangi_music_ready/grounding": "Ground & Breathe",
  "aatrangi_music_ready/lift your mood": "Lift Your Mood",
  "aatrangi_music_ready/reflect": "Reflect",
  "aatrangi_music_ready/sleep and wind down": "Sleep & Wind Down",
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "Calm Down": "Soothe your system and quiet your mind with this audio session.",
  "Comfort": "Feel safe, warm, and emotionally held with comforting melodies.",
  "Emotional Release": "Give space to your feelings and let them flow with gentle piano.",
  "Focus": "Clear away distractions and lock in your attention with deep instrumental focus.",
  "Ground & Breathe": "Connect to the earth and stabilize your breathing with relaxing forest & river paths.",
  "Lift Your Mood": "Brighten your outlook and re-energize your spirit with uplifting instrumentation.",
  "Reflect": "Look inward and sit gently with your thoughts with deep contemplation.",
  "Sleep & Wind Down": "Drift off into a deep, restful state of sleep with ambient soundscapes.",
}

function normalizeName(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "")
}

async function main() {
  try {
    console.log("Fetching all resources from Cloudinary folder 'aatrangi_music_ready'...")
    let allResources: any[] = []
    let nextCursor: string | null = null

    do {
      const query = cloudinary.search
        .expression("folder:aatrangi_music_ready/*")
        .max_results(100)

      if (nextCursor) {
        query.next_cursor(nextCursor)
      }

      const result = await query.execute()
      allResources = allResources.concat(result.resources)
      nextCursor = result.next_cursor
    } while (nextCursor)

    console.log(`Retrieved ${allResources.length} files from Cloudinary.`)

    // Seed Wellness Activities
    console.log("Seeding WellnessActivity collection...")
    await prisma.wellnessActivity.deleteMany()
    for (const activity of WELLNESS_ACTIVITIES) {
      await prisma.wellnessActivity.create({
        data: {
          slug: activity.slug,
          category: (activity.categoryId.toUpperCase() as WellnessActivityCategory),
          title: activity.title,
          shortDescription: activity.shortDescription,
          benefits: activity.benefits,
          instructions: activity.instructions,
          estimatedDuration: activity.estimatedDuration,
          displayOrder: WELLNESS_ACTIVITIES.indexOf(activity),
          isAvailable: true,
          phase: 1,
        },
      })
    }
    console.log(`Successfully seeded ${WELLNESS_ACTIVITIES.length} wellness activities.`)

    // Clear existing db tracks
    console.log("Clearing existing AudioTrack collection...")
    await prisma.audioTrack.deleteMany()

    const tracksList = Object.values(UNIQUE_TRACKS).map((track) => {
      const baseFilename = track.filename.substring(0, track.filename.lastIndexOf("."))
      return {
        ...track,
        normalizedBaseFilename: normalizeName(baseFilename),
      }
    })

    console.log("Seeding new AudioTrack records...")
    let seededCount = 0

    for (const res of allResources) {
      const folderKey = (res.asset_folder || "").toLowerCase()
      const category = FOLDER_TO_CATEGORY_MAP[folderKey] || "Calm Down"
      const description = CATEGORY_DESCRIPTIONS[category] || "A premium wellness audio track."

      const normCloudFilename = normalizeName(res.filename)
      const matches = tracksList.filter((track) => {
        return (
          normCloudFilename.startsWith(track.normalizedBaseFilename) ||
          track.normalizedBaseFilename.startsWith(normCloudFilename)
        )
      })

      const bestMatch = matches[0]
      const title = bestMatch
        ? bestMatch.title
        : res.filename.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())

      const imageUrl = bestMatch?.artworkUrl || null
      const audioUrl = res.secure_url
      const duration = res.duration ? Math.round(res.duration) : null

      await prisma.audioTrack.create({
        data: {
          title,
          description,
          category,
          audioUrl,
          imageUrl,
          duration,
          isPremium: false,
        },
      })
      seededCount++
    }

    console.log(`Seeding complete. Successfully seeded ${seededCount} audio tracks.`)
  } catch (error) {
    console.error("Error seeding audio tracks:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
