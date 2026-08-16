import { NextResponse } from "next/server";
import { auth } from "@/auth.config";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Fetch logs in parallel
        const [moods, activityLogs, assessments, journals] = await Promise.all([
            prisma.moodEntry.findMany({
                where: { userId },
                orderBy: { timestamp: "desc" },
                take: 5
            }),
            prisma.userActivityLog.findMany({
                where: { userId },
                include: { wellnessActivity: true },
                orderBy: { timestamp: "desc" },
                take: 5
            }),
            prisma.assessmentAttempt.findMany({
                where: { userId, status: "COMPLETED" },
                orderBy: { startedAt: "desc" },
                take: 5
            }),
            prisma.journalEntry.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                take: 5
            })
        ]);

        // Normalize activities
        const normalizedMoods = moods.map((e) => ({
            id: `mood-${e.id}`,
            type: "mood",
            title: "Mood check-in",
            description: e.mood,
            timestamp: e.timestamp
        }));

        const normalizedActivities = activityLogs.map((e) => ({
            id: `activity-${e.id}`,
            type: "activity",
            title: "Activity Performed",
            description: e.wellnessActivity?.title || "Wellness Activity",
            timestamp: e.timestamp
        }));

        const normalizedAssessments = assessments.map((e) => ({
            id: `assessment-${e.id}`,
            type: "assessment",
            title: "Assessment completed",
            description: e.interpretation || e.assessmentKey,
            timestamp: e.completedAt || e.startedAt
        }));

        const normalizedJournals = journals.map((e) => ({
            id: `journal-${e.id}`,
            type: "journal",
            title: "Reflection added",
            description: e.title || "Open reflection",
            timestamp: e.createdAt
        }));

        // Merge, sort, and slice to top 5
        const allActivities = [
            ...normalizedMoods,
            ...normalizedActivities,
            ...normalizedAssessments,
            ...normalizedJournals
        ]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5);

        return NextResponse.json({ activities: allActivities });
    } catch (error) {
        console.error("Patient Activity GET error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
