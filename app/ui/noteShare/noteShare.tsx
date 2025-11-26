"use client";
import React, { useState, ChangeEvent, DragEvent } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Lock, Unlock, FileImage } from 'lucide-react';
import axios from 'axios';
import Loader from '@/components/ui/loader';
import Image from 'next/image';

type UploadType = 'public' | 'private';

interface UploadStatus {
    type: 'success' | 'error';
    message: string;
}

const NoteShare: React.FC = () => {
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState<boolean>(false);
    const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);
    const [type, setType] = useState<UploadType>('public');
    const [imageKey, setImageKey] = useState<string>('');

    const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length > 0) {
            handleFile(droppedFiles[0]);
        }
    };

    const handleFileInput = (e: ChangeEvent<HTMLInputElement>): void => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            handleFile(selectedFile);
        }
    };

    const handleFile = (selectedFile: File): void => {
        if (!selectedFile.type.match(/^image\/(jpeg|png)$/)) {
            setUploadStatus({ type: 'error', message: 'Only JPEG and PNG images are allowed' });
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            setUploadStatus({ type: 'error', message: 'File too large (max 10MB)' });
            return;
        }

        setFile(selectedFile);
        setUploadStatus(null);

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
    };

    const uploadFile = async (): Promise<void> => {
        if (!file) return;

        if (type === 'private' && !imageKey) {
            setUploadStatus({ type: 'error', message: 'Please enter an image key for private uploads' });
            return;
        }

        setUploading(true);
        setUploadStatus(null);

        let recordId: string | null = null;

        try {
            const response = await axios.put('/api/uploadIMG', {
                type,
                imgName: file.name.split('.')[0],
                imageSize: file.size,
                imageKey: imageKey || undefined,
                contentType: file.type,
            });

            if (response.status !== 200) {
                throw new Error(response.data.error || 'Failed to get upload URL');
            }

            const { signedUrl, dbRecord } = response.data;
            recordId = dbRecord.id; 

            const uploadResponse = await axios.put(signedUrl, file, {
                headers: {
                    "Content-Type": file.type
                }
            });

            if (uploadResponse.status !== 200) {
                throw new Error('Failed to upload file to S3');
            }

            setUploadStatus({
                type: 'success',
                message: `Upload successful! Image ID: ${dbRecord.id}`
            });

            setTimeout(() => {
                resetForm();
            }, 3000);

        } catch (error) {
            console.error('Upload error:', error);

            if (recordId) {
                try {
                    console.log('Rolling back DB record:', recordId);
                    await axios.delete(`/api/rollbackUpload?id=${recordId}`);
                    console.log('Rollback successful');
                } catch (rollbackError) {
                    console.error('Rollback failed:', rollbackError);
                }
            }

            setUploadStatus({
                type: 'error',
                message: error instanceof Error ? error.message : 'Upload failed. Please try again.'
            });
        } finally {
            setUploading(false);
        }
    };

    const resetForm = (): void => {
        setFile(null);
        setPreview(null);
        setUploadStatus(null);
        setImageKey('');
        setType('public');
    };

    const clearFile = (): void => {
        setFile(null);
        setPreview(null);
        setUploadStatus(null);
    };

    if (uploading) {
        return (
            <Loader />
        );
    }

    return (
        <div className="h-[110vh] w-[80vw] mx-auto flex items-center justify-center z-11 font-[roboto_Condensed]">
            <div className="border rounded-xl border-black/10 dark:border-white/20 bg-transparent backdrop-blur-[100px] dark:backdrop-blur-2xl dark:shadow-[0_20px_60px_rgba(107,91,205,0.4)] p-8 h-[85vh] w-full max-w-lg flex flex-col items-center justify-center">
                <div className="flex items-center justify-center gap-3 mb-6 xl:mb-15">
                    <FileImage className="w-8 h-8 text-indigo-600" />
                    <h1 className="text-3xl w-50 xl:w-80 xl:text-5xl font-bold text-gray-800 dark:text-white text-center">Image Upload</h1>
                </div>

                <div className="mb-6 xl:mb-10">
                    <label className="block text-sm lg:text-xl font-semibold text-gray-200 mb-3">
                        Upload Type
                    </label>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setType('public')}
                            className={`lg:h-12 md:w-48 lg:w-45 flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${type === 'public'
                                ? 'bg-[#475ee0] text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <Unlock className="w-4 h-4" />
                            Public
                        </button>
                        <button
                            onClick={() => setType('private')}
                            className={`lg:h-12 md:w-48 lg:w-45 flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${type === 'private'
                                ? 'bg-indigo-500 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <Lock className="w-4 h-4" />
                            Private
                        </button>
                    </div>
                </div>

                {type === 'private' && (
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2">
                            Image Key (Password)
                        </label>
                        <input
                            type="password"
                            value={imageKey}
                            onChange={(e) => setImageKey(e.target.value)}
                            placeholder="Enter a key to protect your image"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        />
                        <p className="text-xs text-gray-500 dark:text-white mt-1">
                            Remember this key - you'll need it to access the image later
                        </p>
                    </div>
                )}

                {!file ? (
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`h-80 md:w-100 border-3 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${isDragging
                            ? 'border-indigo-500 bg-indigo-50 scale-105'
                            : 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50'
                            }`}
                        onClick={() => document.getElementById('fileInput')?.click()}
                    >
                        <Upload
                            className={`w-12 md:w-16 h-12 md:h-16 mx-auto mb-4 transition-all ${isDragging ? 'text-indigo-500 scale-110' : 'text-gray-400'
                                }`}
                        />
                        <p className="text-lg font-semibold text-gray-700 mb-2">
                            {isDragging ? 'Drop your image here' : 'Drag & drop your image'}
                        </p>
                        <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                        <p className="text-xs text-gray-400">PNG, JPEG only (max 10MB)</p>
                        <input
                            id="fileInput"
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={handleFileInput}
                            className="hidden"
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="relative rounded-xl overflow-hidden bg-gray-100 shadow-lg">
                            <Image
                                src={preview || ''}
                                alt="Preview"
                                className="w-full h-72 object-cover"
                            />
                            <button
                                onClick={clearFile}
                                disabled={uploading}
                                className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            {type === 'private' && (
                                <div className="absolute top-3 left-3 bg-indigo-500 text-white px-3 py-1 rounded-full flex items-center gap-2 shadow-lg">
                                    <Lock className="w-4 h-4" />
                                    <span className="text-sm font-medium">Private</span>
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <p className="text-sm font-medium text-gray-700 truncate mb-1">
                                {file.name}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                <span className="uppercase">{file.type.split('/')[1]}</span>
                            </div>
                        </div>

                        <button
                            onClick={uploadFile}
                            disabled={uploading || (type === 'private' && !imageKey)}
                            className={`relative w-full py-3 rounded-xl cursor-pointer font-semibold transition-all ${uploading || (type === 'private' && !imageKey)
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-indigo-500 text-white hover:bg-indigo-600 active:scale-95 shadow-lg'
                                }`}
                        >
                            Upload Image
                        </button>
                    </div>
                )}

                {uploadStatus && (
                    <div
                        className={`mt-4 p-4 rounded-lg flex items-start gap-3 animate-slideIn ${uploadStatus.type === 'success'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                    >
                        {uploadStatus.type === 'success' ? (
                            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        )}
                        <p className="text-sm font-medium">{uploadStatus.message}</p>
                    </div>
                )}
            </div>

            <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};

export default NoteShare;