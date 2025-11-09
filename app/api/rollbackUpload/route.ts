import { NextRequest, NextResponse } from "next/server";
import db from '@/lib/db';
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";
import { decode } from "next-auth/jwt";

export async function DELETE(req: NextRequest) {
    const cookieStore = await cookies();
        const jwtToken = cookieStore.get("token")?.value;
        const nextAuthToken = cookieStore.get("next-auth.session-token")?.value || cookieStore.get("__Secure-next-auth.session-token")?.value;

        if (!jwtToken && !nextAuthToken) {
            return NextResponse.json(
                {
                    authenticated: false,
                    message: "no token found"
                },
                { status: 401 }
            );
        }

        let userEmail: string | null = null;

        if (nextAuthToken) {
            try {
                const decoded = await decode({
                    token: nextAuthToken,
                    secret: process.env.NEXTAUTH_SECRET!,
                });

                if (decoded?.email) {
                    userEmail = decoded.email as string;
                }
            } catch (error) {
                console.error("NextAuth token decode error:", error);
            }
        }

        if (!userEmail && jwtToken) {
            const userData = getUserFromToken(jwtToken);
            if (userData?.email) {
                userEmail = userData.email;
            }
        }

        if (!userEmail) {
            return NextResponse.json(
                {
                    authenticated: false,
                    message: "invalid or expired token"
                },
                { status: 401 }
            );
        }

        const user = await db.user.findUnique({
            where: {
                email: userEmail
            },
            select: {
                id: true,
                email: true,
                displayName: true,
                createdAt: true,
            }
        });

        if (!user) {
            return NextResponse.json(
                {
                    authenticated: false,
                    message: "user not found"
                },
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

        if (record.uploader.email !== userEmail) {
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