import React from "react";
import Link from "next/link";

export default function Foooter() {

    const footerItems = [
        {
          name: "Home",
          href: "/"
        },
        {
          name: "Share Notes",
          href: "/navs/sharenotes"
        },
        {
          name: "Find Notes",
          href: "/navs/findnotes"
        },
        {
          name: "How to use",
          href: "/#Hero2"
        },
      ];


    return (
        <div className="absolute h-[25vh] w-[95vw] flex flex-col items-center justify-center border-t border-black/10 dark:border-white/20 overflow-hidden rounded-t-xl bg-transparent backdrop-blur-lg dark:shadow-[0_20px_60px_rgba(107,91,205,0.4)] z-9 font-[roboto_Condensed]">
            
            <div className="h-[20vh] w-full flex items-center justify-center gap-2">
                <div className="h-[20vh] w-[40vw] p-2 flex items-center justify-center text-6xl md:text-8xl lg:text-9xl">
                    <Link href="/" className="z-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-500">NoteX</Link>
                </div>
                <div className="h-[16vh] border border-white dark:border-black z-2"></div>
                <div className="z-2 h-[20vh] w-[40vw] p-2 flex flex-col items-center justify-center text-white dark:text-black  text-xl md:text-2xl lg:text-3xl xl:text-2xl xl:gap-2">
                    {
                        footerItems.map((items, index) => (
                            <Link href={items.href} key={index} className="hover:scale-105 transition-transform duration-200 hover:text-gray-500">{items.name}</Link>
                        ))
                    }
                </div>
            </div>
            <div className="h-[5vh] w-full flex items-center justify-center z-10">
                <span className="text-sm text-white dark:text-black">
                    © 2025 NoteX. All rights reserved.
                </span>
            </div>
        </div>
    )
}