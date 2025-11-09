import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value || cookieStore.get("next-auth.session-token")?.value || cookieStore.get("__Secure-next-auth.session-token")?.value;

        if (!token) {
            return NextResponse.json(
                { error: "not authenticated" },
                { status: 401 }
            );
        }

        const userData = getUserFromToken(token);

        if (!userData) {
            return NextResponse.json(
                { error: "invalid or expired token" },
                { status: 401 }
            );
        }

        return NextResponse.json(
            {
                authenticated: true,
                user: {
                    email: userData.email,
                    id: userData.id,
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