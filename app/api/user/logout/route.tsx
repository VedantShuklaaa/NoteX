import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    try {
        const cookieStore = await cookies();
        
        const token = cookieStore.get("token");
        
        if (!token) {
            return NextResponse.json(
                { message: "already logged out" },
                { status: 200 }
            );
        }

        cookieStore.delete("token");

        return NextResponse.json(
            { message: "logged out successfully" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json(
            { error: "internal server error" },
            { status: 500 }
        );
    }
}