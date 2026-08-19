import { NextRequest, NextResponse } from "next/server"
import { AdminAuthError, requireAdminUser } from "@/lib/admin/auth"
import { buildInstitutionAnalytics, resolveAdminRange } from "@/lib/admin/analytics"

export async function GET(req: NextRequest) {
  try {
    await requireAdminUser()
    const parsed = resolveAdminRange(req.nextUrl.searchParams)

    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: parsed.status || 400 })
    }

    const data = await buildInstitutionAnalytics({
      range: parsed.range,
      organizationId: parsed.organizationId || null,
    })

    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error("Admin institution analytics error:", error)
    return NextResponse.json({ error: "Failed to load institution analytics" }, { status: 500 })
  }
}
