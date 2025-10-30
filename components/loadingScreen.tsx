"use client";
import { LayoutTextFlip } from "@/components/ui/layout-text-flip";
import { motion } from "motion/react";

export function LoadingScreen() {

    const LoadingTitles = [
        {
            text: "Uploading your brilliance…",
            words: "fetching results soon!"
        },
        {
            text: "Notes are being teleported.",
            words: "Please hold on to reality."
        },
        {
            text: "Hang tight.",
            words: "Your content is on the way."
        }
    ]
    return (
        <div>
            <motion.div className="relative mx-4 my-4 flex flex-col items-center justify-center gap-4 text-center sm:mx-0 sm:mb-0 sm:flex-row">
                {
                    LoadingTitles.map((items, index) => (
                        <LayoutTextFlip
                            text={items.text}
                            words={[items.words]}
                        />
                    ))
                }
            </motion.div>
            <p className="mt-4 text-center text-base text-neutral-600 dark:text-neutral-400">
                Processing your upload and fetching your data… just a moment!
            </p>
        </div>
    );
}
