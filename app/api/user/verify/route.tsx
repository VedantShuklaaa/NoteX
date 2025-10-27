import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                {
                    authenticated: false,
                    message: "no token found"
                },
                { status: 401 }
            );
        }

        const userData = getUserFromToken(token);

        if (!userData) {
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
                email: userData.email
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

        return NextResponse.json(
            {
                authenticated: true,
                user: {
                    id: user.id,
                    email: user.email,
                    displayName: user.displayName,
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Auth verification error:", error);
        return NextResponse.json(
            {
                authenticated: false,
                message: "internal server error"
            },
            { status: 500 }
        );
    }
}