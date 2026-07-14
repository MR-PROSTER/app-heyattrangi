import { NextResponse } from "next/server";
import { auth } from "@/auth.config";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await auth();
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const patient = await prisma.patient.findUnique({
            where: { userId: session.user.id },
            select: { currentStreak: true, totalCredits: true }
        });

        if (!patient) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }

        return NextResponse.json({
            current_streak: patient.currentStreak || 1,
            total_credits: patient.totalCredits || 0
        });
    } catch (error) {
        console.error("Failed to fetch credits:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
