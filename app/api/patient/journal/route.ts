import { NextResponse } from "next/server";
import { auth } from "@/auth.config";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await auth();
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const entries = await prisma.journalEntry.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ entries });
    } catch (error) {
        console.error("Journal GET error:", error);
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

        const { content, moodScore, tags, title } = body;

        if (!content || typeof content !== "string" || !content.trim()) {
            return NextResponse.json({ error: "content is required" }, { status: 400 });
        }

        const entry = await prisma.journalEntry.create({
            data: {
                userId: session.user.id,
                content: content.trim(),
                title: title ? title.trim() : undefined,
                moodScore: typeof moodScore === "number" ? moodScore : undefined,
                tags: Array.isArray(tags) ? tags : []
            }
        });

        return NextResponse.json({ entry }, { status: 201 });
    } catch (error) {
        console.error("Journal POST error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
