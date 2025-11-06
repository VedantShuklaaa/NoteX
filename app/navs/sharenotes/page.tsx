import React from "react";
import NoteShare from "@/app/ui/noteShare/noteShare";
import GradientBackground from "@/components/ui/background";

export default function sharenotes() {
    return(
        <div className="h-[120vh] lg:h-[100vh] bg-[var(--background)]">
            <GradientBackground/>
            <NoteShare/>
        </div>
    )
}