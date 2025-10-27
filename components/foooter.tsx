import React from "react";

export default function Foooter() {
    return (
        <div className="absolute h-[25vh] w-[90vw] flex flex-col items-center justify-center border-t border-black/10 dark:border-white/15 rounded-t-3xl bg-transparent backdrop-blur-[100px] dark:backdrop-blur-2xl dark:shadow-[0_20px_60px_rgba(107,91,205,0.4)] z-10">
            <div className="h-[20vh] w-full">

            </div>
            <div className="h-[5vh] w-full flex items-center justify-center">
                 <span className="text-sm">
                 © 2025 NoteX. All rights reserved.
                 </span>
            </div>
        </div>
    )
}