import { NextRequest, NextResponse } from "next/server";
import db from '@/lib/db';
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";

export async function DELETE(req: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const userData = getUserFromToken(token || "");

    if (!userData) {
        return NextResponse.json(
            { error: "unauthorized" },
            { status: 401 }
        );
    }

    const { searchParams } = new URL(req.url);
    const recordId = searchParams.get('id');

    if (!recordId) {
        return NextResponse.json(
            { error: "Record ID required" },
            { status: 400 }
        );
    }

    try {
        const record = await db.noteDetails.findUnique({
            where: { id: recordId },
            include: {
                uploader: {
                    select: { email: true }
                }
            }
        });

        if (!record) {
            return NextResponse.json(
                { error: "Record not found" },
                { status: 404 }
            );
        }

        if (record.uploader.email !== userData.email) {
            return NextResponse.json(
                { error: "Unauthorized to delete this record" },
                { status: 403 }
            );
        }

        await db.noteDetails.delete({
            where: { id: recordId }
        });

        console.log(`Rolled back upload record: ${recordId}`);

        return NextResponse.json({
            message: "Record deleted successfully"
        });

    } catch (err) {
        console.error("Rollback error:", err);
        return NextResponse.json(
            { error: "Failed to rollback" },
            { status: 500 }
        );
    }
}