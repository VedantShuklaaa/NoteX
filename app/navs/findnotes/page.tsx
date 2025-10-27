import React from "react";
import NotesFind from "@/app/ui/notesFind/notesFind";
import GradientBackground from "@/components/ui/background";

export default function findnotes() {
    return(
        <div className="h-[100vh] bg-[var(--background)]">
            <GradientBackground/>
            <GradientBackground/>
            <NotesFind/>
        </div>
    )
}