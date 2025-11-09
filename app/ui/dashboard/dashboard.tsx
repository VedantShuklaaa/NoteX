"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, User, Hash, Lock, Unlock, Image as ImageIcon } from "lucide-react";
import { X, AlertCircle } from "lucide-react";
import Loader from "@/components/ui/loader";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ImageRecord {
    id: string;
    imgName: string;
    type: "public" | "private";
    imageSize: number;
    createdAt: string;
    uploadedBy: string;
    imageUrl?: string;
}

export default function UserDashboard() {
    const [publicImages, setPublicImages] = useState<ImageRecord[]>([]);
    const [privateImages, setPrivateImages] = useState<ImageRecord[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/navs/auth/login');
        } else if (status === 'authenticated' || status === 'loading') {
            fetchImages();
        }
    }, [status, router]);

    const fetchImages = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/auth/dashboard');

            console.log('Backend response:', response.data);
            if (response.data.PublicImages && Array.isArray(response.data.PublicImages)) {
                setPublicImages(response.data.PublicImages);
                console.log('Loaded public images:', response.data.PublicImages.length);
            }

            if (response.data.PrivateImages && Array.isArray(response.data.PrivateImages)) {
                setPrivateImages(response.data.PrivateImages);
                console.log('Loaded private images:', response.data.PrivateImages.length);
            }
        } catch (err: any) {
            console.error('Error fetching images:', err);
            if (err.response?.status === 401) {
                router.push('/navs/auth/login');
            } else {
                setError(err.response?.data?.error || 'Failed to load images');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading || status === 'loading') {
        return <Loader />;
    }

    if (status === 'unauthenticated') {
        return null;
    }

    const userEmail = session?.user?.email || publicImages[0]?.uploadedBy || privateImages[0]?.uploadedBy || 'User';
    const userName = session?.user?.name || userEmail;

    return (
        <div className="absolute top-0 h-[110vh] w-full flex flex-col items-center justify-center z-10 p-4 font-[roboto_Condensed]">
            <div className="h-[90vh] w-[95vw] flex flex-col items-center justify-center gap-2 rounded-xl border border-black/10 dark:border-white/20 bg-transparent backdrop-blur-[100px] dark:backdrop-blur-2xl dark:shadow-[0_20px_60px_rgba(107,91,205,0.4)] p-6 overflow-hidden">
                <div className="h-[10vh] w-[90vw] flex flex-col items-center justify-center md:flex-row gap-6 rounded-xl border border-black/10 dark:border-white/20 bg-transparent backdrop-blur-[100px] dark:backdrop-blur-2xl dark:shadow-[0_20px_60px_rgba(107,91,205,0.4)] p-6 overflow-hidden">
                        <span className="text-md md:text-2xl lg:text-3xl text-center">
                            <h1>
                                {session?.user?.name ? `Welcome, ${userName}` : `Uploaded by ${userEmail}`}
                            </h1>
                        </span>   
                </div>
                <div className="h-[90vh] w-[90vw] flex flex-col md:flex-row gap-6 rounded-xl border border-black/10 dark:border-white/20 bg-transparent backdrop-blur-[100px] dark:backdrop-blur-2xl dark:shadow-[0_20px_60px_rgba(107,91,205,0.4)] p-2 overflow-hidden">
                    <div className="flex-1 overflow-y-auto flex flex-col rounded-xl bg-white/50 dark:bg-black/50 backdrop-blur-2xl p-4">
                        <h2 className="text-xl w-full flex justify-center items-center font-semibold mb-4 text-gray-800 dark:text-white">
                            Public Images ({publicImages.length})
                        </h2>

                        {error ? (
                            <div className="flex flex-col items-center justify-center h-full text-red-500">
                                <AlertCircle className="w-16 h-16 mb-4" />
                                <p className="text-lg">{error}</p>
                                <button
                                    onClick={fetchImages}
                                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : publicImages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                                <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                                <p className="text-lg">No public images found</p>
                                <p className="text-sm mt-2">Upload your first public image to see it here</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {publicImages.map((image) => (
                                    <ImageCard key={image.id} image={image} />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto flex flex-col rounded-xl bg-white/50 dark:bg-black/50 backdrop-blur-2xl p-4">
                        <h2 className="text-xl w-full flex justify-center items-center font-semibold mb-4 text-gray-800 dark:text-white">
                            Private Images ({privateImages.length})
                        </h2>

                        {error ? (
                            <div className="flex flex-col items-center justify-center h-full text-red-500">
                                <AlertCircle className="w-16 h-16 mb-4" />
                                <p className="text-lg">{error}</p>
                                <button
                                    onClick={fetchImages}
                                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : privateImages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                                <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                                <p className="text-lg">No private images found</p>
                                <p className="text-sm mt-2">Upload your first private image to see it here</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {privateImages.map((image) => (
                                    <ImageCard key={image.id} image={image} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


const ImageCard: React.FC<{ image: ImageRecord }> = ({ image }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [fullImage, setFullImage] = useState<boolean>(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatSize = (bytes: number) => {
        return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    };

    return (
        <>
            {fullImage && (
                <div
                    className="absolute inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                    onClick={() => setFullImage(false)}
                >
                    <div
                        className="relative max-w-7xl max-h-[90vh] w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setFullImage(false)}
                            className="absolute top-25 right-10 cursor-pointer text-white hover:text-gray-300 transition-colors flex items-center gap-2 bg-black/30 px-4 py-2 rounded-lg backdrop-blur-sm"
                        >
                            <X className="w-8 h-8" />
                            <span className="text-sm font-medium">Close</span>
                        </button>

                        <img
                            src={image.imageUrl}
                            alt={image.imgName}
                            className="w-full h-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        />

                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 rounded-b-lg">
                            <h3 className="text-white text-2xl font-bold mb-3">{image.imgName}</h3>
                            <div className="flex flex-wrap gap-4 text-white/90 text-sm">
                                <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(image.createdAt)}
                                </span>
                                <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                                    {formatSize(image.imageSize)}
                                </span>
                                <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                                    {image.type === 'private' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                    {image.type}
                                </span>
                                <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                                    <User className="w-4 h-4" />
                                    {image.uploadedBy}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="border rounded-xl border-black/10 dark:border-white/20 bg-white/50 dark:bg-black/20 backdrop-blur-xl overflow-hidden hover:scale-105 transition-transform duration-300 hover:shadow-[0_20px_60px_rgba(107,91,205,0.4)]">
                <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    {image.imageUrl ? (
                        <>
                            {!imageLoaded && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                                </div>
                            )}
                            <img
                                src={image.imageUrl}
                                alt={image.imgName}
                                className={`w-full h-full object-cover transition-all duration-300 cursor-pointer hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                                    }`}
                                onLoad={() => setImageLoaded(true)}
                                onError={() => setImageLoaded(true)}
                                onClick={() => setFullImage(true)}
                            />
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <ImageIcon className="w-12 h-12 text-gray-400" />
                        </div>
                    )}

                    <div className={`absolute top-2 right-2 px-3 py-1 rounded-full flex items-center gap-2 shadow-lg ${image.type === 'private'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-green-500 text-white'
                        }`}>
                        {image.type === 'private' ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        <span className="text-xs font-medium capitalize">{image.type}</span>
                    </div>
                </div>

                <div className="p-4 space-y-2">
                    <div className="text-sm font-semibold text-gray-800 dark:text-white truncate" title={image.imgName}>
                        {image.imgName}
                    </div>

                    <div className="flex gap-2">
                        <div className="flex-1 px-2 py-1 border border-black/10 dark:border-white/20 rounded-xl text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(image.createdAt)}
                        </div>
                        <div className="px-2 py-1 border border-black/10 dark:border-white/20 rounded-xl text-xs text-gray-600 dark:text-gray-300">
                            {formatSize(image.imageSize)}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="px-2 py-1 border border-black/10 dark:border-white/20 rounded-xl text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1 truncate" title={image.id}>
                            <Hash className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{image.id}</span>
                        </div>
                        <div className="px-2 py-1 border border-black/10 dark:border-white/20 rounded-xl text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1 truncate" title={image.uploadedBy}>
                            <User className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{image.uploadedBy}</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};