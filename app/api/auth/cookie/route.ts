import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";
import { getUserFromToken } from "@/lib/auth";
import db from "@/lib/db";

export async function GET(_request: NextRequest) {
    try {
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

        return NextResponse.json(
            {
                authenticated: true,
                user: {
                    email: user.email,
                    id: user.id,
                }
            },
            { status: 200 }
        );

    } catch (err: unknown) {
        console.error("Token verification error:", err);
        return NextResponse.json(
            { error: "internal server error" },
            { status: 500 }
        );
    }
}