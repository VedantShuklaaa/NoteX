import React from "react";

export default function Loader() {
    return (
        <div>
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-2xl">
                <img src="/Ripple loading animation.gif" className="h-100 w-100" />
                <p className="mt-8 text-2xl font-semibold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent animate-pulse">
                    Processing your upload and fetching your data… just a moment!
                </p>
            </div>
        </div>
    )
}