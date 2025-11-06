"use client";
import React, { useEffect, useState } from "react"
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Hero() {

    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        checkAuth()
    })

    const checkAuth = async () => {
        try {
            const response = await axios.get("/api/user/verify", {
                withCredentials: true,
            });

            if (response.data.authenticated) {
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.log("error: ", error)
            setIsAuthenticated(false);

        }
    }

    const handleCreateNote = () => {
        router.push("/navs/sharenotes")
    }

    const handleFindNote = () => {
        router.push("/navs/findnotes")
    }

    const handleStartWorking = () => {
        router.push("/navs/auth/signup")
    }

    return (
        <div className="absolute top-0 h-[100vh] w-full flex items-center justify-center z-10">
            <div className="h-[80vh] w-[95vw] flex flex-col items-center justify-center gap-10 md:gap-10 lg:gap-15 xl:gap-13 rounded-xl border border-black/10 dark:border-white/20 bg-transparent backdrop-blur-lg dark:shadow-[0_20px_60px_rgba(107,91,205,0.4)]">
                <div className="w-[90vw] flex flex-col items-center justify-center gap-2 lg:gap-10">
                    <span className="w-[90vw] text-4xl md:w-[80vw] md:text-5xl lg:text-6xl lg:w-[70vw] xl:text-8xl text-center text-black">
                        Share, discover, and ace your <span className="text-blue-500 dark:text-white">studies, student notes, all in one place</span>
                    </span>
                    <span className="w-[70vw] text-sm md:w-[70vw] md:text-xl lg:text-xl lg:w-[65vw] text-center text-black dark:text-white bg-clip-text">
                        Built for students, teams, and creators who want their ideas to flow freely
                    </span>
                </div>
                <div className="flex z-10">
                    {
                        isAuthenticated ? <div className="flex gap-2">
                            <button className="relative inline-flex h-11 w-40 lg:w-60 overflow-hidden rounded-xl p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 hover:scale-105 transition-transform duration-200" onClick={handleCreateNote}>
                                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-xl bg-slate-950 px-3 py-1 text-sm lg:text-md font-medium text-white backdrop-blur-3xl">
                                    Create a Note
                                </span>
                            </button>
                            <button className="relative inline-flex h-11 w-40 lg:w-60 overflow-hidden rounded-xl p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 hover:scale-105 transition-transform duration-200" onClick={handleFindNote}>
                                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-xl bg-slate-950 px-3 py-1 text-sm lg:text-md font-medium text-white backdrop-blur-3xl">
                                    Find a Note
                                </span>
                            </button>
                        </div> : <>
                            <button className="relative inline-flex h-11 w-60 lg:w-70 xl:w-80 overflow-hidden rounded-xl p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 hover:scale-105 transition-transform duration-200" onClick={handleStartWorking}>
                                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-xl bg-slate-950 px-3 py-1 text-sm lg:text-md font-medium text-white backdrop-blur-3xl">
                                    Start working with NoteX today
                                </span>
                            </button>
                        </>
                    }
                </div>
            </div>
        </div>
    )
}