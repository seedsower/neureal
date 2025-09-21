import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  className?: string;
  animated?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "h-8 w-8", animated = false }) => {
  const logoVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: { scale: 1.05, rotate: 5 },
    tap: { scale: 0.95 },
  };

  const pathVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { 
      pathLength: 1, 
      opacity: 1,
      transition: { duration: 2, ease: "easeInOut" }
    },
  };

  const LogoSVG = (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer circle with gradient */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="50%" stopColor="#d946ef" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Background circle */}
      <motion.circle
        cx="50"
        cy="50"
        r="45"
        stroke="url(#logoGradient)"
        strokeWidth="3"
        fill="none"
        filter="url(#glow)"
        variants={animated ? pathVariants : undefined}
        initial={animated ? "initial" : undefined}
        animate={animated ? "animate" : undefined}
      />
      
      {/* Neural network nodes */}
      <motion.circle
        cx="30"
        cy="25"
        r="4"
        fill="url(#logoGradient)"
        variants={animated ? pathVariants : undefined}
        initial={animated ? "initial" : undefined}
        animate={animated ? "animate" : undefined}
      />
      <motion.circle
        cx="70"
        cy="25"
        r="4"
        fill="url(#logoGradient)"
        variants={animated ? pathVariants : undefined}
        initial={animated ? "initial" : undefined}
        animate={animated ? "animate" : undefined}
      />
      <motion.circle
        cx="20"
        cy="50"
        r="4"
        fill="url(#logoGradient)"
        variants={animated ? pathVariants : undefined}
        initial={animated ? "initial" : undefined}
        animate={animated ? "animate" : undefined}
      />
      <motion.circle
        cx="50"
        cy="50"
        r="6"
        fill="url(#logoGradient)"
        variants={animated ? pathVariants : undefined}
        initial={animated ? "initial" : undefined}
        animate={animated ? "animate" : undefined}
      />
      <motion.circle
        cx="80"
        cy="50"
        r="4"
        fill="url(#logoGradient)"
        variants={animated ? pathVariants : undefined}
        initial={animated ? "initial" : undefined}
        animate={animated ? "animate" : undefined}
      />
      <motion.circle
        cx="30"
        cy="75"
        r="4"
        fill="url(#logoGradient)"
        variants={animated ? pathVariants : undefined}
        initial={animated ? "initial" : undefined}
        animate={animated ? "animate" : undefined}
      />
      <motion.circle
        cx="70"
        cy="75"
        r="4"
        fill="url(#logoGradient)"
        variants={animated ? pathVariants : undefined}
        initial={animated ? "initial" : undefined}
        animate={animated ? "animate" : undefined}
      />
      
      {/* Neural network connections */}
      <motion.path
        d="M30 25 L50 50"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        opacity="0.6"
        variants={animated ? pathVariants : undefined}
        initial={animated ? "initial" : undefined}
        animate={animated ? "animate" : undefined}
      />
      <motion.path
        d="M70 25 L50 50"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        opacity="0.6"
        variants={animated ? pathVariants : undefined}
        initial={animated ? "initial" : undefined}
        animate={animated ? "animate" : undefined}
      />
      <motion.path
        d="M20 50 L50 50"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        opacity="0.6"
        variants={animated ? pathVariants : undefined}
        initial={animated ? "initial" : undefined}
        animate={animated ? "animate" : undefined}
      />
      <motion.path
        d="M50 50 L80 50"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        opacity="0.6"
        variants={animated ? pathVariants : undefined}
        initial={animated ? "initial" : undefined}
        animate={animated ? "animate" : undefined}
      />
      <motion.path
        d="M50 50 L30 75"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        opacity="0.6"
        variants={animated ? pathVariants : undefined}
        initial={animated ? "initial" : undefined}
        animate={animated ? "animate" : undefined}
      />
      <motion.path
        d="M50 50 L70 75"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        opacity="0.6"
        variants={animated ? pathVariants : undefined}
        initial={animated ? "initial" : undefined}
        animate={animated ? "animate" : undefined}
      />
      
      {/* Central "N" for Neureal */}
      <motion.text
        x="50"
        y="58"
        textAnchor="middle"
        className="text-lg font-bold fill-white"
        variants={animated ? pathVariants : undefined}
        initial={animated ? "initial" : undefined}
        animate={animated ? "animate" : undefined}
      >
        N
      </motion.text>
    </svg>
  );

  if (animated) {
    return (
      <motion.div
        variants={logoVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        className="cursor-pointer"
      >
        {LogoSVG}
      </motion.div>
    );
  }

  return LogoSVG;
};

export default Logo;
