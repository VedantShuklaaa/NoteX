import React from "react";
import NotesFind from "@/app/ui/notesFind/notesFind";
import GradientBackground from "@/components/ui/background";

export default function findnotes() {
    return(
        <div className="h-[110vh] bg-[var(--background)]">
            <GradientBackground/>
            <NotesFind/>
        </div>
    )
}