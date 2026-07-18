import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth.config"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  try {
    const session = await auth()
    
    if (!session || !session.user || (session.user as any).role !== "INSTITUTION_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orgId = (session.user as any).orgId
    const { studentId } = await params;

    // Verify student exists and belongs to the admin's org
    const patient = await prisma.patient.findUnique({
      where: { id: studentId },
      include: { user: true }
    })

    if (!patient || patient.user.orgId !== orgId) {
      return NextResponse.json({ error: "Student not found or unauthorized" }, { status: 404 })
    }

    const body = await request.json()
    const { studentStatus, batchId, departmentId, rollNumber } = body

    const dataToUpdate: any = {}
    if (studentStatus) dataToUpdate.studentStatus = studentStatus
    if (batchId !== undefined) dataToUpdate.batchId = batchId
    if (departmentId !== undefined) dataToUpdate.departmentId = departmentId
    if (rollNumber !== undefined) dataToUpdate.rollNumber = rollNumber

    const updatedPatient = await prisma.patient.update({
      where: { id: studentId },
      data: dataToUpdate,
      include: {
        user: { select: { name: true, email: true } },
        batch: { select: { name: true } },
        department: { select: { name: true } }
      }
    })

    return NextResponse.json(updatedPatient)
  } catch (error) {
    console.error("Error updating student:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
