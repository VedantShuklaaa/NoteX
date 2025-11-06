import { NextResponse, NextRequest } from "next/server";
import db from '@/lib/db';
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";


export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    const imageKey = searchParams.get('imageKey');

    const s3Client = new S3Client({
        region: process.env.REGION!,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
        }
    });

    try {
        async function getSignedImageUrl(key: string): Promise<string> {
            const command = new GetObjectCommand({
                Bucket: process.env.BUCKET,
                Key: key
            });
            return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        }

        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const userData = getUserFromToken(token || "");

        if (!userData) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const user = await db.user.findUnique({
            where: { email: userData.email }
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const publicImages = await db.noteDetails.findMany({
            where: { uploadedBy: user.id, type: 'public' },
            include: {
                uploader: {
                    select: {
                        email: true,
                        displayName: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        const imagesWithPublicUrls = await Promise.all(
            publicImages.map(async (image) => {
                const signedUrl = await getSignedImageUrl(
                    `${image.uploader.displayName}/${image.type}/${image.imgName}`
                );
                
                return {
                    id: image.id,
                    imgName: image.imgName,
                    type: image.type,
                    imageSize: image.imageSize,
                    createdAt: image.createdAt.toISOString(),
                    uploadedBy: image.uploader.email,
                    imageUrl: signedUrl 
                };
            })
        );

        const privateImages = await db.noteDetails.findMany({
            where: { uploadedBy: user.id, type: 'private' },
            include: {
                uploader: {
                    select: {
                        email: true,
                        displayName: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        const imagesWithPrivateUrls = await Promise.all(
            privateImages.map(async (image) => {
                const signedUrl = await getSignedImageUrl(
                    `${image.uploader.displayName}/${image.type}/${image.imgName}`
                );
                
                return {
                    id: image.id,
                    imgName: image.imgName,
                    type: image.type,
                    imageSize: image.imageSize,
                    createdAt: image.createdAt.toISOString(),
                    uploadedBy: image.uploader.email,
                    imageUrl: signedUrl 
                };
            })
        );

        return NextResponse.json({ PrivateImages: imagesWithPrivateUrls, PublicImages: imagesWithPublicUrls });

    } catch (err: unknown) {
        console.error("Fetch error:", err);

        if (err && typeof err === "object") {
            const prismaErr = err as Prisma.PrismaClientKnownRequestError;

            if (prismaErr.code === "P2025") {
                return NextResponse.json(
                    { error: "Resource not found" },
                    { status: 404 }
                );
            }
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}