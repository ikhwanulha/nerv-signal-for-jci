'use client';

import React from 'react';
import { motion } from 'framer-motion';
import styles from './BottomNav.module.scss';

interface BottomNavProps {
  activeItem?: string;
  onNavigate?: (item: string) => void;
}

const navItems: { id: string; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Home', icon: '📊' },
  { id: 'stocks', label: 'Search', icon: '🔍' },
  { id: 'portfolio', label: 'Portfolio', icon: '💼' },
  { id: 'signals', label: 'Signals', icon: '🔄' },
  { id: 'settings', label: 'Profile', icon: '👤' },
];

const BottomNav: React.FC<BottomNavProps> = ({
  activeItem = 'dashboard',
  onNavigate,
}) => {
  return (
    <nav className={styles.bottomNav}>
      {navItems.map((item) => {
        const isActive = activeItem === item.id;
        return (
          <button
            key={item.id}
            className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            onClick={() => onNavigate?.(item.id)}
          >
            <div className={styles.iconWrap}>
              <span className={styles.icon}>{item.icon}</span>
              {isActive && (
                <motion.div
                  className={styles.activeDot}
                  layoutId="bottomNavActiveDot"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </div>
            <span className={styles.label}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
