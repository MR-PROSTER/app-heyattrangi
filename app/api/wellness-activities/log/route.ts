import { NextResponse } from "next/server";
import { auth } from "@/auth.config";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const logs = await prisma.userActivityLog.findMany({
            where: { userId: session.user.id },
            include: {
                wellnessActivity: true
            },
            orderBy: { timestamp: "desc" }
        });

        return NextResponse.json({ logs });
    } catch (error) {
        console.error("Wellness Log GET error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let body: any;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const { wellnessActivityId, wellnessActivitySlug, durationMs } = body;
        console.log("[Wellness Log POST] Body received:", { wellnessActivityId, wellnessActivitySlug, durationMs });

        let normalizedSlug = wellnessActivitySlug;
        if (wellnessActivitySlug) {
            const slugMap: Record<string, string> = {
                "sigh": "physiological-sigh",
                "physiological-sigh": "physiological-sigh",
                "478": "breathing-4-7-8",
                "breathing-4-7-8": "breathing-4-7-8",
                "belly": "belly-breathing",
                "belly-breathing": "belly-breathing",
                "box-breathing": "box-breathing",
                "5-4-3-2-1-grounding": "grounding-54321",
                "grounding-54321": "grounding-54321",
                "pmr": "pmr",
                "progressive-muscle-relaxation": "pmr",
                "journal-reflection": "open-reflection",
                "open-reflection": "open-reflection",
                "prompted-reflection": "prompted-reflection",
                "micro-movement": "micro-movement",
                "body-scan": "body-scan",
                "breathing": "box-breathing", // Fallback for general breathing slug
            };
            normalizedSlug = slugMap[wellnessActivitySlug] || wellnessActivitySlug;
        }

        if (!wellnessActivityId && !normalizedSlug) {
            console.error("[Wellness Log POST] Error: Neither ID nor Slug provided");
            return NextResponse.json({ error: "wellnessActivityId or wellnessActivitySlug is required" }, { status: 400 });
        }


        // Verify the activity exists before logging
        let activityId = wellnessActivityId;

        if (!activityId && normalizedSlug) {
            console.log(`[Wellness Log POST] Looking up activity by slug: ${normalizedSlug}`);
            const activityBySlug = await prisma.wellnessActivity.findUnique({
                where: { slug: normalizedSlug }
            });

            if (!activityBySlug) {
                console.error(`[Wellness Log POST] Error: Activity not found for slug: ${wellnessActivitySlug}`);
                return NextResponse.json({ error: "Wellness activity not found by slug" }, { status: 404 });
            }
            activityId = activityBySlug.id;
            console.log(`[Wellness Log POST] Found activity ID: ${activityId}`);
        } else if (activityId) {
            console.log(`[Wellness Log POST] Verifying activity by ID: ${activityId}`);
            const activityById = await prisma.wellnessActivity.findUnique({
                where: { id: activityId }
            });

            if (!activityById) {
                console.error(`[Wellness Log POST] Error: Activity not found for ID: ${activityId}`);
                return NextResponse.json({ error: "Wellness activity not found by ID" }, { status: 404 });
            }
        }


        console.log(`[Wellness Log POST] Creating log for user ${session.user.id}, activity ${activityId}, duration ${durationMs}ms`);
        const log = await prisma.userActivityLog.create({
            data: {
                userId: session.user.id,
                wellnessActivityId: activityId!,
                durationMs: typeof durationMs === "number" ? durationMs : undefined,
            }
        });

        console.log(`[Wellness Log POST] Successfully created log: ${log.id}`);


        return NextResponse.json({ log }, { status: 201 });
    } catch (error) {
        console.error("Wellness Log POST error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
