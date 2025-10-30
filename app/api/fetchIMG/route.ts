import { NextResponse, NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import db from '@/lib/db';
import { z } from 'zod';
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as bcrypt from 'bcryptjs';

const fetchImgSchema = z.object({
    imgID: z.string(),
    imageKey: z.string().optional(),
});

const s3Client = new S3Client({
    region: process.env.REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
});

async function getGetObjectSignedUrl(key: string): Promise<string> {
    const bucketName = process.env.BUCKET;
    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
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
            { error: "unauthorized: cannot find user" },
            { status: 401 },
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

    const parsed = fetchImgSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "validation error", details: parsed.error.format() },
            { status: 400 },
        );
    }

    const { imgID, imageKey } = parsed.data;

    try {
        const [user, image] = await Promise.all([
            db.user.findUnique({
                where: { email: userData.email },
                select: { id: true, email: true }
            }),
            db.noteDetails.findUnique({
                where: { id: imgID },
                select: {
                    id: true,
                    imgName: true,
                    type: true,
                    imageKey: true,
                    uploadedBy: true
                }
            })
        ]);

        if (!user) {
            return NextResponse.json(
                { error: "user not found" },
                { status: 401 },
            );
        }

        if (!image) {
            return NextResponse.json(
                { error: "image not found" },
                { status: 404 }
            );
        }

        if (image.type === "private") {
            if (!imageKey) {
                return NextResponse.json(
                    { error: "image key required for private images" },
                    { status: 400 }
                );
            }
            
            const isValidKey = await bcrypt.compare(imageKey, image.imageKey);
            if (!isValidKey) {
                return NextResponse.json(
                    { error: "incorrect image key" },
                    { status: 403 }
                );
            }
        }

        const signedUrl = await getGetObjectSignedUrl(image.imgName);

        await db.fetchDetails.create({
            data: {
                type: image.type,
                accessedBy: user.id,
                imageId: image.id
            }
        });

        return NextResponse.json(
            {
                message: "image fetched successfully",
                signedUrl
            },
            { status: 200 }
        );

    } catch (err: unknown) {
        if (err && typeof err === "object") {
            const prismaErr = err as Prisma.PrismaClientKnownRequestError;
            
            if (prismaErr.code === "P2002") {
                return NextResponse.json(
                    { error: "duplicate fetch attempt" },
                    { status: 409 },
                );
            }
            
            if (prismaErr.code === "P2025") {
                return NextResponse.json(
                    { error: "resource not found" },
                    { status: 404 },
                );
            }
        }

        console.error("Image fetch error:", err);
        return NextResponse.json(
            { error: "internal server error" },
            { status: 500 },
        );
    }
}