import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import db from '@/lib/db';
import { z } from "zod";
import * as bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const signUpSchema = z.object({
    email: z.string().email("invalid email format"),
    password: z.string().min(8, "password must contain at least 8 characters"),
    displayName: z.string().min(1).max(50).optional(),
});

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS ?? 10);
const JWT_PASSWORD = String(process.env.JWT_PASSWORD);

export async function POST(req: NextRequest) {
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            { error: "invalid JSON" },
            { status: 400 }
        );
    }

    const parsed = signUpSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "validation error", details: parsed.error.format() },
            { status: 400 }
        );
    }

    const { email, password, displayName } = parsed.data;

    try {
        const hash = await bcrypt.hash(password, SALT_ROUNDS);

        const user = await db.user.create({
            data: {
                email,
                password: hash,
                displayName: displayName || email.split('@')[0],
                provider: 'credentials'
            },
            select: {
                id: true,
                email: true,
                displayName: true,
                provider: true,
                createdAt: true,
            }
        });

        const token = jwt.sign(
            { 
                email: user.email,
                id: user.id 
            },
            JWT_PASSWORD,
            { expiresIn: '7d' }
        );

        const response = NextResponse.json(
            { message: "signed up successfully", user },
            { status: 201 }
        );

        response.cookies.set("token", token, {
            httpOnly: true,
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        });

        return response;

    } catch (err: unknown) {
        if (err && typeof err === "object") {
            const prismaErr = err as Prisma.PrismaClientKnownRequestError;
            
            if (prismaErr.code === "P2002") {
                return NextResponse.json(
                    { error: "user already exists" },
                    { status: 409 }
                );
            }
        }

        console.error("Signup error:", err);
        return NextResponse.json(
            { error: "internal server error" },
            { status: 500 }
        );
    }
}