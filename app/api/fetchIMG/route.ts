import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import db from '@/lib/db';
import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/auth";
import * as bcrypt from 'bcryptjs';
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


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

        if (id) {
            const image = await db.noteDetails.findUnique({
                where: { id },
                include: {
                    uploader: {
                        select: {
                            email: true,
                            displayName: true
                        }
                    }
                }
            });

            if (!image) {
                return NextResponse.json(
                    { error: "Image not found" },
                    { status: 404 }
                );
            }

            if (image.type === 'private') {
                if (!imageKey) {
                    return NextResponse.json(
                        { error: "Image key required for private images" },
                        { status: 401 }
                    );
                }

                const isValidKey = await bcrypt.compare(imageKey, image.imageKey);
                if (!isValidKey) {
                    return NextResponse.json(
                        { error: "Invalid image key" },
                        { status: 403 }
                    );
                }
            }

            try {
                await db.fetchDetails.create({
                    data: {
                        imageId: image.id,
                        accessedBy: user.id,
                        type: image.type
                    }
                });
                console.log(`✅ Tracked fetch: Image ${image.id} by user ${user.email}`);
            } catch (trackError) {
                console.error('❌ Failed to track fetch:', trackError);
            }

            const imageUrl = `https://${process.env.BUCKET}.s3.${process.env.REGION}.amazonaws.com/${image.uploader.displayName}/${image.type}/${image.imgName}`;


            return NextResponse.json({
                image: {
                    id: image.id,
                    imgName: image.imgName,
                    type: image.type,
                    imageSize: image.imageSize,
                    createdAt: image.createdAt,
                    uploadedBy: image.uploader.email,
                    imageUrl
                }
            });
        }

        if (type === 'public') {
            const images = await db.noteDetails.findMany({
                where: { type: 'public' },
                include: {
                    uploader: {
                        select: {
                            email: true,
                            displayName: true,
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 50
            });
            const imagesWithUrls = await Promise.all(
                images.map(async (image) => {
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

            return NextResponse.json({ images: imagesWithUrls });
        }

        const userImages = await db.noteDetails.findMany({
            where: { uploadedBy: user.id },
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
        const imagesToSign = userImages.slice(0, 51);
        const imageUrl = await Promise.all(
            imagesToSign.map(async img => {
                return await getSignedImageUrl(`${img.uploader.displayName}/${img.type}/${img.imgName}`);
            })
        );
        console.log("signed urls: ", imageUrl);

        const imagesWithUrls = userImages.map(image => ({
            id: image.id,
            imgName: image.imgName,
            type: image.type,
            imageSize: image.imageSize,
            createdAt: image.createdAt,
            uploadedBy: image.uploader.email,
            imageUrl: imageUrl
        }));

        return NextResponse.json({ images: imagesWithUrls });

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