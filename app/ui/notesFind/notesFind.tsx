"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Calendar, User, Hash, Lock, Unlock, Image as ImageIcon, AlertCircle } from "lucide-react";
import Loader from "@/components/ui/loader";

interface ImageRecord {
    id: string;
    imgName: string;
    type: "public" | "private";
    imageSize: number;
    createdAt: string;
    uploadedBy: string;
    imageUrl?: string;
}

export default function NotesFind() {
    const [images, setImages] = useState<ImageRecord[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchId, setSearchId] = useState<string>("");
    const [imageKey, setImageKey] = useState<string>("");
    const [searchResult, setSearchResult] = useState<ImageRecord | null>(null);


    useEffect(() => {
        fetchPublicImages();
    }, []);

    const fetchPublicImages = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/fetchIMG', {
                params: { type: 'public' }
            });

            if (response.data.images) {
                setImages(response.data.images);
                console.log(response.data.images);
            }

        } catch (err) {
            console.error('Error fetching images:', err);
            setError('Failed to load images');
        } finally {
            setLoading(false);
        }
    };

    const searchImageById = async () => {
        if (!searchId.trim()) {
            setError('Please enter an image ID');
            return;
        }

        setLoading(true);
        setError(null);
        setSearchResult(null);

        try {
            const response = await axios.get('/api/fetchIMG', {
                params: {
                    id: searchId,
                    imageKey: imageKey || undefined
                }
            });

            if (response.data.image) {
                setSearchResult(response.data.image);
            }
        } catch (err: any) {
            console.error('Search error:', err);
            setError(err.response?.data?.error || 'Image not found or incorrect key');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatSize = (bytes: number) => {
        return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    };


    if (loading && images.length === 0) {
        return (
            <Loader/>
        );
    }

    return (
        <div className="absolute top-0 h-[110vh] w-full flex items-center justify-center z-10 p-4">
            <div className="h-[90vh] w-[95vw] flex flex-col gap-6 rounded-2xl border border-black/10 dark:border-white/20 bg-transparent backdrop-blur-[100px] dark:backdrop-blur-2xl dark:shadow-[0_20px_60px_rgba(107,91,205,0.4)] p-6 overflow-hidden">

                <div className="flex flex-col gap-4">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                        <ImageIcon className="w-8 h-8" />
                        Find Images
                    </h1>

                    <div className="flex gap-3 flex-wrap">
                        <input
                            type="text"
                            placeholder="Enter Image ID"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            className="flex-1 min-w-[200px] px-4 py-3 border border-gray-300 dark:border-white/20 rounded-2xl bg-white/50 dark:bg-black/20 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-gray-800 dark:text-white"
                        />
                        <input
                            type="password"
                            placeholder="Image Key (if private)"
                            value={imageKey}
                            onChange={(e) => setImageKey(e.target.value)}
                            className="flex-1 min-w-[200px] px-4 py-3 border border-gray-300 dark:border-white/20 rounded-2xl bg-white/50 dark:bg-black/20 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-gray-800 dark:text-white"
                        />
                        <button
                            onClick={searchImageById}
                            className="px-6 py-3 bg-indigo-500 text-white rounded-2xl font-semibold hover:bg-indigo-600 transition-all flex items-center gap-2"
                        >
                            <Search className="w-5 h-5" />
                            Search
                        </button>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg text-red-700 dark:text-red-300">
                            <AlertCircle className="w-5 h-5" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>


                {searchResult && (
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Search Result</h2>
                        <ImageCard image={searchResult} />
                    </div>
                )}


                <div className="flex-1 overflow-y-auto rounded-2xl bg-white/50 dark:bg-black/50 backdrop-blur-2xl p-2">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Public Images</h2>

                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader/>
                        </div>
                    ) : images.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                            <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-lg">No public images found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {images.map((image) => (
                                <ImageCard key={image.id} image={image} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


const ImageCard: React.FC<{ image: ImageRecord }> = ({ image }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatSize = (bytes: number) => {
        return (bytes / 1024 / 1024).toFixed(2) + ' MB';
    };

    return (
        <div className="border rounded-2xl border-black/10 dark:border-white/20 bg-white/50 dark:bg-black/20 backdrop-blur-xl cursor-pointer overflow-hidden hover:scale-102 transition-transform duration-300 hover:shadow-[0_20px_60px_rgba(107,91,205,0.4)]">

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
                            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                            onLoad={() => setImageLoaded(true)}
                            onError={() => setImageLoaded(true)}
                        />
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                )}


                <div className={`absolute top-2 right-2 px-3 py-1 rounded-full flex items-center gap-2 ${image.type === 'private'
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
                    <div className="flex-1 px-2 py-1 border border-black/10 dark:border-white/20 rounded-2xl text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(image.createdAt)}
                    </div>
                    <div className="px-2 py-1 border border-black/10 dark:border-white/20 rounded-2xl text-xs text-gray-600 dark:text-gray-300">
                        {formatSize(image.imageSize)}
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="px-2 py-1 border border-black/10 dark:border-white/20 rounded-2xl text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1 truncate" title={image.id}>
                        <Hash className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{image.id}</span>
                    </div>
                    <div className="px-2 py-1 border border-black/10 dark:border-white/20 rounded-2xl text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1 truncate" title={image.uploadedBy}>
                        <User className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{image.uploadedBy}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
