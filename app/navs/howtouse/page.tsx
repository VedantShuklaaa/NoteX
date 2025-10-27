import React from "react";
import GradientBackground from "@/components/ui/background";
import HowUseTo from "@/app/ui/howUseTo/howUseTo";

export default function howtouse() {
    return(
        <div className="h-[100vh] bg-[var(--background)]">
            <GradientBackground/>
            <GradientBackground/>
            <HowUseTo/>
        </div>
    )
}