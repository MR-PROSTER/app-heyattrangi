import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const specialization = searchParams.get("specialization")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const where: any = {
      status: "VERIFIED",
    }

    if (specialization) {
      where.specialization = specialization
    }

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { bio: { contains: search, mode: 'insensitive' } },
        { primarySpecialization: { contains: search, mode: 'insensitive' } },
      ]
    }

    const getDoctors = unstable_cache(
      async (where: any, skip: number, limit: number) => {
        return prisma.doctor.findMany({
          where,
          select: {
            id: true,
            specialization: true,
            primarySpecialization: true,
            secondarySpecializations: true,
            experience: true,
            yearsOfExperience: true,
            consultationFee: true,
            bio: true,
            profilePhoto: true,
            languagesSpoken: true,
            consultationTypes: true,
            preferredAgeGroups: true,
            city: true,
            appointmentDuration: true,
            slotBuffer: true,
            user: {
              select: {
                name: true,
                email: true,
                image: true,
              },
            },
            availability: {
              select: {
                isAvailable: true,
                availableDays: true,
                startTime: true,
                endTime: true,
                breaks: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          skip,
          take: limit,
        })
      },
      ["doctors-list"],
      { revalidate: 60, tags: ["doctors"] }
    )

    const getDoctorsCount = unstable_cache(
      async (where: any) => {
        return prisma.doctor.count({ where })
      },
      ["doctors-count"],
      { revalidate: 60, tags: ["doctors"] }
    )

    const [doctors, totalCount] = await Promise.all([
      getDoctors(where, skip, limit),
      getDoctorsCount(where),
    ])

    return NextResponse.json({
      doctors,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching doctors:", error)
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 }
    )
  }
}

