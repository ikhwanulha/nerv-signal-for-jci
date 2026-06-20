'use client';

import React from 'react';
import { motion } from 'framer-motion';
import styles from './Card.module.scss';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'terminal' | 'glass';
  animate?: boolean;
}

export default function Card({ children, className = '', onClick, variant = 'default', animate = true }: CardProps) {
  const Component = animate ? motion.div : 'div';

  return (
    <Component
      className={`${styles.card} ${styles[variant]} ${className}`}
      onClick={onClick}
      {...(animate ? { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } } : {})}
    >
      {children}
    </Component>
  );
}
