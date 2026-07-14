import { NextResponse } from "next/server";
import { auth } from "@/auth.config";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await auth();
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch last 30 days of entries
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const entries = await prisma.journalEntry.findMany({
            where: { 
                userId: session.user.id,
                createdAt: {
                    gte: thirtyDaysAgo
                }
            },
            orderBy: { createdAt: "asc" }
        });

        // 1. Total entries
        const totalEntries = entries.length;

        // 2. Average Mood Score (if moodScore is recorded)
        const entriesWithMood = entries.filter(e => e.moodScore !== null);
        const averageMoodScore = entriesWithMood.length > 0 
            ? entriesWithMood.reduce((acc, curr) => acc + (curr.moodScore as number), 0) / entriesWithMood.length
            : null;

        // 3. Most common tags
        const tagCounts: Record<string, number> = {};
        entries.forEach(entry => {
            entry.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        const topTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([tag]) => tag);

        // 4. Daily activity map (for charting)
        const dailyActivity: Record<string, number> = {};
        entries.forEach(entry => {
            const dateStr = entry.createdAt.toISOString().split('T')[0];
            dailyActivity[dateStr] = (dailyActivity[dateStr] || 0) + 1;
        });

        const activityChartData = Object.entries(dailyActivity).map(([date, count]) => ({
            date,
            count
        }));

        return NextResponse.json({
            analytics: {
                totalEntries,
                averageMoodScore,
                topTags,
                activityChartData
            }
        });

    } catch (error) {
        console.error("Journal Analytics GET error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
