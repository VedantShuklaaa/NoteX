import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import db from '@/lib/db';
import { z } from "zod";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as bcrypt from 'bcryptjs';

const SALT_ROUNDS = Number(process.env.SaltRounds) || 10;

const uploadImgSchema = z.object({
    type: z.enum(["public", "private"], {
        message: "content type can only be set to 'public' or 'private'",
    }),
    imgName: z.string().min(1).max(255),
    imageSize: z.number().positive(),
    imageKey: z.string().optional(),
    contentType: z.enum(["image/jpeg", "image/png"], {
        message: "image can only be in jpeg or png format",
    }),
});

const s3Client = new S3Client({
    region: String(process.env.region),
    credentials: {
        accessKeyId: String(process.env.accessKeyId),
        secretAccessKey: String(process.env.secretAccessKey),
    },
});

async function getPutObjectSignedUrl(
    userName: string,
    type: string,
    imgName: string,
    contentType: string
): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: String(process.env.Bucket),
        Key: `${userName}/${type}/${imgName}`,
        ContentType: contentType,
    });

    return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function PUT(req: NextRequest) {
    if (!process.env.OPTIMIZE_API_KEY) {
        return NextResponse.json(
            { error: "server misconfiguration" },
            { status: 500 }
        );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const userData = getUserFromToken(token || "");

    if (!userData) {
        return NextResponse.json(
            { error: "unauthorized: can't find user" },
            { status: 401 }
        );
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            { error: "invalid JSON" },
            { status: 400 }
        );
    }

    const parsed = uploadImgSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "validation error", details: parsed.error.format() },
            { status: 400 }
        );
    }

    const { type, imgName, imageSize, imageKey, contentType } = parsed.data;

    if (type === "private" && !imageKey) {
        return NextResponse.json(
            { error: "image key required for private uploads" },
            { status: 400 }
        );
    }

    try {
        const user = await db.user.findUnique({
            where: {
                email: userData.email
            },
            select: {
                id: true,
                email: true,
                displayName: true
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: "user doesn't exist" },
                { status: 404 }
            );
        }

        const timestamp = Date.now();
        const extension = contentType.split("/")[1];
        const uniqueImgName = `${imgName}.${timestamp}.${extension}`;

        const encryptedIMGKey = type === "private" && imageKey
            ? await bcrypt.hash(imageKey, SALT_ROUNDS)
            : "publicIMG";

        const [signedUrl, dbRecord] = await Promise.all([
            getPutObjectSignedUrl(user.displayName, type, uniqueImgName, contentType),
            db.noteDetails.create({
                data: {
                    type,
                    imgName: uniqueImgName,
                    imageKey: encryptedIMGKey,
                    uploadedBy: user.email,
                    imageSize,
                },
                select: {
                    id: true,
                    type: true,
                    imgName: true,
                    imageSize: true,
                    createdAt: true
                }
            })
        ]);

        return NextResponse.json(
            {
                message: "image upload prepared successfully",
                signedUrl,
                dbRecord
            },
            { status: 200 }
        );

    } catch (err: unknown) {
        if (err && typeof err === "object") {
            const prismaErr = err as Prisma.PrismaClientKnownRequestError;

            if (prismaErr.code === "P2002") {
                return NextResponse.json(
                    { error: "duplicate entry detected, resource already exists" },
                    { status: 409 }
                );
            }

            if (prismaErr.code === "P2025") {
                return NextResponse.json(
                    { error: "resource not found" },
                    { status: 404 }
                );
            }
        }

        console.error("Image upload error:", err);
        return NextResponse.json(
            { error: "internal server error" },
            { status: 500 }
        );
    }
}