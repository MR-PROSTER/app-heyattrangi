import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth.config"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !session.user || (session.user as any).role !== "INSTITUTION_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orgId = (session.user as any).orgId
    if (!orgId) {
      return NextResponse.json({ error: "No institution associated with this admin" }, { status: 400 })
    }

    // Get patients whose user belongs to this orgId
    const students = await prisma.patient.findMany({
      where: {
        user: {
          orgId: orgId
        }
      },
      include: {
        user: {
          select: { name: true, email: true, image: true, plan: true }
        },
        batch: {
          select: { name: true, graduationYear: true, status: true }
        },
        department: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !session.user || (session.user as any).role !== "INSTITUTION_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orgId = (session.user as any).orgId
    if (!orgId) {
      return NextResponse.json({ error: "No institution associated with this admin" }, { status: 400 })
    }

    const body = await request.json()
    const { name, email, batchId, departmentId, rollNumber, phone } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Generate a default password for the institution-created student
    const hashedPassword = await bcrypt.hash("Student@123", 10)

    // Create user and patient records
    const newUser = await prisma.user.create({
      data: {
        name: name || email.split("@")[0],
        email,
        password: hashedPassword,
        role: "PATIENT",
        plan: "ORGANIZATION",
        orgId: orgId,
        patient: {
          create: {
            batchId: batchId || null,
            departmentId: departmentId || null,
            rollNumber: rollNumber || null,
            emergencyContactPhone: phone || null,
            studentStatus: "ACTIVE"
          }
        }
      },
      include: {
        patient: true
      }
    })

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error("Error adding student:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
