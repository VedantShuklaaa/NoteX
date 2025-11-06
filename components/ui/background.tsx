"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface GradientBackgroundProps {
    className?: string;
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({
    className = ''
}) => {
    return (
        <motion.div className={`fixed inset-0 min-h-screen blur-[5px] flex items-center justify-center ${className}`}>
            <Image
                src="/bg-1.png"
                priority
                fill
                alt='background image'
                className='xl:h-[100vh] xl:w-[100vw] block dark:hidden'
            />

            <Image
                src="/bg-1dark.png"
                priority
                fill
                alt='background image'
                className='xl:h-[100vh] xl:w-[100vw] hidden dark:block'
            />
        </motion.div>
    )
}

export default GradientBackground;