import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import db from '@/lib/db';
import { z } from "zod";
import * as bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const logInSchema = z.object({
    email: z.string().email('invalid email format'),
    password: z.string().min(8, 'password must contain at least 8 characters'),
});

const JWT_PASSWORD = process.env.JWT_PASSWORD as string;

export async function POST(req: NextRequest) {
    if (!process.env.OPTIMIZE_API_KEY || !JWT_PASSWORD) {
        return NextResponse.json(
            { error: "server misconfiguration" },
            { status: 500 },
        );
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            { error: "invalid JSON" },
            { status: 400 },
        );
    }

    const parsed = logInSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'validation error', details: parsed.error.format() },
            { status: 400 },
        );
    }

    const { email, password } = parsed.data;

    try {
        const user = await db.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                displayName: true
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: "invalid email or password" },
                { status: 401 },
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "invalid email or password" },
                { status: 401 },
            );
        }

        const token = jwt.sign(
            { 
                email: user.email,
                id: user.id 
            },
            JWT_PASSWORD,
            { expiresIn: '7d' }
        );

        const response = NextResponse.json({
            message: "login successful",
            user: {
                email: user.email,
                displayName: user.displayName
            }
        });

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
            
            if (prismaErr.code === "P2025") {
                return NextResponse.json(
                    { error: "invalid email or password" },
                    { status: 401 }
                );
            }
        }

        console.error("Login error:", err);
        return NextResponse.json(
            { error: "internal server error" },
            { status: 500 }
        );
    }
}