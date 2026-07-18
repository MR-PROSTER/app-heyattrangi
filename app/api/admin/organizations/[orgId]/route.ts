import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth.config"

// Using Promise type for params as per Next.js 15
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const session = await auth()
    
    // Check if user is authenticated and is an ADMIN
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const orgId = resolvedParams.orgId

    if (!orgId) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 })
    }

    const body = await request.json()
    const { name, domains, sessionLimit, studentLimit, status } = body

    // Parse domains string into an array if it's provided as a string
    let domainArray: string[] | undefined
    if (domains !== undefined) {
      if (typeof domains === "string") {
        domainArray = domains.split(',').map(d => d.trim()).filter(d => d.length > 0)
      } else if (Array.isArray(domains)) {
        domainArray = domains
      }
    }

    const updatedOrganization = await prisma.organization.update({
      where: { id: orgId },
      data: {
        ...(name && { name }),
        ...(domainArray !== undefined && { domains: domainArray }),
        ...(sessionLimit !== undefined && { sessionLimit: sessionLimit === "" || sessionLimit === null ? null : parseInt(sessionLimit) }),
        ...(studentLimit !== undefined && { studentLimit: studentLimit === "" || studentLimit === null ? null : parseInt(studentLimit) }),
        ...(status && { status }),
      }
    })

    return NextResponse.json(updatedOrganization, { status: 200 })
  } catch (error) {
    console.error("Error updating organization:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  try {
    const session = await auth()
    
    // Check if user is authenticated and is an ADMIN
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const orgId = resolvedParams.orgId

    if (!orgId) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 })
    }

    // Delete the organization
    await prisma.organization.delete({
      where: { id: orgId }
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error deleting organization:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
