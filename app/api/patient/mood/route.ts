import { NextResponse } from "next/server";
import { auth } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { enforceLimit } from "@/lib/limits/checkLimits";
import {
    getMoodDailyLimit,
    getMoodNoteLimit,
    getMoodRateLimit,
    MOOD_DAILY_LIMIT_WINDOW_MS,
    MOOD_RATE_LIMIT_WINDOW_MS,
} from "@/lib/mood/limits";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const entries = await prisma.moodEntry.findMany({
            where: { userId: session.user.id },
            orderBy: { timestamp: "desc" }
        });

        return NextResponse.json({ entries });
    } catch (error) {
        console.error("Mood GET error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let body: Record<string, unknown>;
        try {
            body = await req.json() as Record<string, unknown>;
        } catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const {
            mood,
            note,
            // Rich fields from MoodTrackerClient
            mood_score,
            tags,
            energy_level,
            stress_level,
            sleep_quality,
            craving,
            craving_intensity,
            craving_trigger,
        } = body;

        if (!mood || typeof mood !== "string" || !mood.trim()) {
            return NextResponse.json({ error: "mood is required" }, { status: 400 });
        }

        // Fetch user plan
        const dbUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { plan: true },
        });
        const plan = dbUser?.plan || "FREE";
        const maxNoteChars = getMoodNoteLimit(plan);
        if (note && String(note).length > maxNoteChars) {
            return NextResponse.json({ error: "LIMIT_EXCEEDED", message: `Mood note too long. Maximum is ${maxNoteChars} characters.` }, { status: 400 });
        }

        // Enforce minute-level request cap before consuming daily quota.
        const rateCheck = await enforceLimit({
            userId: session.user.id,
            action: "MOOD_CHECKIN_RATE",
            plan,
            limitFree: getMoodRateLimit("FREE"),
            limitPremium: getMoodRateLimit("PREMIUM"),
            windowMs: MOOD_RATE_LIMIT_WINDOW_MS,
            errorMessage: "Too many mood updates",
        });
        if (!rateCheck.allowed) {
            return NextResponse.json({ error: "LIMIT_EXCEEDED", message: rateCheck.message, resetInSeconds: rateCheck.resetInSeconds }, { status: 429 });
        }

        // Enforce daily check-in limit (Free: 10, Premium: 20)
        const dailyCheck = await enforceLimit({
            userId: session.user.id,
            action: "MOOD_CHECKIN_DAILY",
            plan,
            limitFree: getMoodDailyLimit("FREE"),
            limitPremium: getMoodDailyLimit("PREMIUM"),
            windowMs: MOOD_DAILY_LIMIT_WINDOW_MS,
            errorMessage: "Daily mood check-in limit reached",
        });
        if (!dailyCheck.allowed) {
            return NextResponse.json({ error: "LIMIT_EXCEEDED", message: dailyCheck.message, resetInSeconds: dailyCheck.resetInSeconds }, { status: 429 });
        }

        const entry = await prisma.moodEntry.create({
            data: {
                userId: session.user.id,
                mood: mood.trim(),
                moodScore: typeof mood_score === "number" ? mood_score : undefined,
                note: note ? String(note).trim() : undefined,
                tags: Array.isArray(tags) ? tags : [],
                energyLevel: typeof energy_level === "number" ? energy_level : undefined,
                stressLevel: typeof stress_level === "number" ? stress_level : undefined,
                sleepQuality: typeof sleep_quality === "number" ? sleep_quality : undefined,
                craving: craving === true,
                cravingIntensity: typeof craving_intensity === "number" ? craving_intensity : undefined,
                cravingTrigger: Array.isArray(craving_trigger) ? craving_trigger : [],
            }
        });

        // Compute streak and total so the MoodTrackerClient can update its counters
        const allEntries = await prisma.moodEntry.findMany({
            where: { userId: session.user.id },
            orderBy: { timestamp: "desc" },
            select: { timestamp: true },
        });

        const total_check_ins = allEntries.length;

        // Calculate daily streak
        let streak = 0;
        const seenDays = new Set<string>();
        for (const e of allEntries) {
            const day = e.timestamp.toISOString().split("T")[0];
            seenDays.add(day);
        }

        const today = new Date();
        for (let i = 0; i < 365; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dayStr = d.toISOString().split("T")[0];
            if (seenDays.has(dayStr)) {
                streak++;
            } else {
                break;
            }
        }

        return NextResponse.json({ entry, streak, total_check_ins }, { status: 201 });
    } catch (error) {
        console.error("Mood POST error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
