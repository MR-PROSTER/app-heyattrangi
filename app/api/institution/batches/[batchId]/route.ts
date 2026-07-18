import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth.config"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ batchId: string }> }) {
  try {
    const session = await auth()
    
    if (!session || !session.user || (session.user as any).role !== "INSTITUTION_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orgId = (session.user as any).orgId
    const { batchId } = await params;

    // Verify batch belongs to org
    const batch = await prisma.batch.findUnique({ where: { id: batchId } })
    if (!batch || batch.organizationId !== orgId) {
      return NextResponse.json({ error: "Batch not found or unauthorized" }, { status: 404 })
    }

    const body = await request.json()
    const { status, name, graduationYear, startDate, endDate } = body

    const dataToUpdate: any = {}
    if (status) dataToUpdate.status = status
    if (name) dataToUpdate.name = name
    if (graduationYear !== undefined) dataToUpdate.graduationYear = graduationYear
    if (startDate !== undefined) dataToUpdate.startDate = startDate ? new Date(startDate) : null
    if (endDate !== undefined) dataToUpdate.endDate = endDate ? new Date(endDate) : null

    const updatedBatch = await prisma.batch.update({
      where: { id: batchId },
      data: dataToUpdate
    })

    // If archiving a batch, we might want to also update all students in it to 'GRADUATED' or 'READONLY'
    // But for now, we leave the batch status to handle read-only in the frontend logic.
    if (status === "ARCHIVED") {
      await prisma.patient.updateMany({
        where: { batchId: batchId },
        data: { studentStatus: "GRADUATED" }
      })
    }

    return NextResponse.json(updatedBatch)
  } catch (error) {
    console.error("Error updating batch:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
