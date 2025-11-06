"use client";
import React from "react";
import { Upload, Search, Lock, Share2, Shield, Zap } from 'lucide-react';

export default function Hero2() {

    const steps = [
        {
            icon: <Upload className="w-8 h-8" />,
            title: "Upload Your Image",
            description: "Drag and drop or click to upload your notes. Support for PNG/JPEG or PDF formats up to 10MB.",
            color: "from-blue-500 to-cyan-500"
        },
        {
            icon: <Lock className="w-8 h-8" />,
            title: "Choose Privacy",
            description: "Select public for easy sharing or private with a password key for secure, encrypted storage.",
            color: "from-purple-500 to-pink-500"
        },
        {
            icon: <Share2 className="w-8 h-8" />,
            title: "Share Instantly",
            description: "Get a unique ID for your note. Share it with anyone, anywhere. They can access it using the search feature.",
            color: "from-orange-500 to-red-500"
        },
        {
            icon: <Search className="w-8 h-8" />,
            title: "Find & View",
            description: "Enter the note ID to retrieve any shared image. For private notes, just enter the password key.",
            color: "from-green-500 to-emerald-500"
        }
    ];

    const features = [
        {
            icon: <Zap className="w-5 h-5" />,
            text: "Lightning Fast"
        },
        {
            icon: <Shield className="w-5 h-5" />,
            text: "Secure & Encrypted"
        },
        {
            icon: <Share2 className="w-5 h-5" />,
            text: "Easy Sharing"
        }
    ];

    return (
        <div className="absolute top-0 h-[150vh] md:h-[125vh] lg:h-[120vh] xl:h-[100vh] w-full flex items-center justify-center z-9" id="Hero2">
            <div className="h-[140vh] md:h-[120vh] lg:h-[100vh] xl:h-[80vh] w-[95vw] py-12 sm:py-16 md:py-20 px-3 sm:px-4 md:px-6 lg:px-8 flex flex-col items-center justify-center mt-[200vh] rounded-xl border border-black/10 dark:border-white/20 bg-transparent backdrop-blur-lg dark:backdrop-blur-2xl dark:shadow-[0_20px_60px_rgba(107,91,205,0.4)]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-8 sm:mb-12 md:mb-16">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 md:mb-6 px-2">
                            How <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Note X</span> Works
                        </h2>
                        <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4">
                            Share your notes securely in just a few simple steps. No sign-up required for viewing!
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6 md:mt-8 px-2">
                            {features.map((feature, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
                                >
                                    <div className="text-blue-600 dark:text-blue-400">
                                        {feature.icon}
                                    </div>
                                    <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {feature.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12 md:mb-16 px-2">
                        {steps.map((step, idx) => (
                            <div
                                key={idx}
                                className="relative group"
                            >
                                {idx < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-gray-300 to-transparent dark:from-gray-700 z-0" />
                                )}

                                <div className="relative bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 border border-gray-100 dark:border-gray-700 z-10">
                                    <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg">
                                        {idx + 1}
                                    </div>

                                    <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                        {step.icon}
                                    </div>

                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}