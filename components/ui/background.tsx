"use client";
import React from 'react';
import { motion } from 'framer-motion';
import MotionDiv from './motionGradients';

interface GradientBackgroundProps {
    className?: string;
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({
    className = ''
}) => {
    return (
        <motion.div className={`fixed inset-0 min-h-screen flex items-center justify-center ${className}`}>
            <MotionDiv className='left-220 top-10 h-80 w-80' variant='ocean'/>
            <MotionDiv className='left-50 top-40 h-80 w-80' variant='sunset'/>
            <MotionDiv className='left-140 bottom-30 h-120 w-120' variant='forest'/>
            <MotionDiv className='right-60 h-100 w-100 bg-gradient-to-br from-green-400 via-emerald-400 to-lime-200' variant='custom'/>
        </motion.div>
    )
}

export default GradientBackground;