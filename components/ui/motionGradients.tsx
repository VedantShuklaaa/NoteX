import React from "react";
import { motion } from 'framer-motion';

interface MotionDivProps {
    className?: string;
    variant?: 'sunset' | 'ocean' | 'forest' | 'custom';
}

const MotionDiv: React.FC<MotionDivProps> = ({
    className = '',
    variant = 'sunset',
}) => {

    const gradients = {
        sunset: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400',
        ocean: 'bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400',
        forest: 'bg-gradient-to-br from-green-600 via-emerald-500 to-lime-400',
        custom: className
    };

    const gradientClass = variant === 'custom' ? className: gradients[variant];

    return (
        <motion.div className={`absolute h-40 w-40 border blur-[160px] opacity-90 dark:opacity-80 ${gradientClass} ${className}`}
            animate={{ rotate: 360 }}
            transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear",
                repeatType: 'loop',
            }}
        ></motion.div>
        
    )
}

export default MotionDiv;