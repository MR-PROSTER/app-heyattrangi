import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth.config"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    // Check if user is authenticated and is an ADMIN
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, domains, sessionLimit, studentLimit } = body

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Organization name is required" }, { status: 400 })
    }

    // Parse domains string into an array (e.g., "mit.edu, harvard.edu")
    let domainArray: string[] = []
    if (domains && typeof domains === "string") {
      domainArray = domains.split(',').map(d => d.trim()).filter(d => d.length > 0)
    }

    const newOrganization = await prisma.organization.create({
      data: {
        name,
        domains: domainArray,
        sessionLimit: sessionLimit ? parseInt(sessionLimit) : null,
        studentLimit: studentLimit ? parseInt(studentLimit) : null,
        planType: "ORGANIZATION",
        status: "ACTIVE",
      }
    })

    return NextResponse.json(newOrganization, { status: 201 })
  } catch (error) {
    console.error("Error creating organization:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
