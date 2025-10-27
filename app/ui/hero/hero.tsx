import GradientBackground from "@/components/ui/background"
import React from "react"

export default function Hero() {
    return (
        <div className="absolute top-0 h-[100vh] w-full flex items-center justify-center z-10">
            <div className="h-[80vh] w-[90vw] flex flex-col items-center justify-center gap-10 md:gap-10 lg:gap-15 xl:gap-13 rounded-2xl border border-black/10 dark:border-white/20 bg-transparent backdrop-blur-[100px] dark:backdrop-blur-2xl dark:shadow-[0_20px_60px_rgba(107,91,205,0.4)]">
                <div className="w-[90vw] flex flex-col items-center justify-center gap-2 lg:gap-10">
                    <span className="w-[90vw] text-4xl md:w-[80vw] md:text-5xl lg:text-6xl lg:w-[70vw] xl:text-8xl text-center bg-gradient-to-b from-neutral-900 dark:from-neutral-200 to-neutral-600 dark:to-neutral-500 bg-clip-text font-bold text-transparent">
                        Share, discover, and ace your studies, student notes, all in one place
                    </span>
                    <span className="w-[70vw] text-sm md:w-[70vw] md:text-xl lg:text-xl lg:w-[65vw] text-center text-black dark:text-white bg-clip-text">
                        Quick, organized, and ready for every exam
                    </span>
                </div>
                <div className="flex z-10">
                    <button className="relative inline-flex h-11 w-60 lg:w-70 xl:w-80 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 hover:scale-105 transition-transform duration-200">
                        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm lg:text-md font-medium text-white backdrop-blur-3xl">
                            Start working with NoteX today
                        </span>
                    </button>
                </div>
            </div>
        </div>
    )
}