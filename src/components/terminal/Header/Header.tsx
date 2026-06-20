'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Header.module.scss';
import Input from '@/components/ui/Input/Input';

interface HeaderProps {
  onMenuToggle?: () => void;
  onSearchFocus?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, onSearchFocus }) => {
  const [time, setTime] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Real-time clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      setTime(`${hh}:${mm}:${ss} WIB`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <header className={styles.header}>
      {/* Left: hamburger (mobile) + clock */}
      <div className={styles.left}>
        <button
          className={styles.hamburger}
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
        </button>
        <div className={styles.clock}>
          <span className={styles.clockIcon}>🕐</span>
          <span className={styles.clockText}>{time}</span>
        </div>
      </div>

      {/* Center: search */}
      <div className={styles.center}>
        <div className={styles.searchWrap}>
          <Input
            placeholder="Search ticker or command..."
            icon={<span>🔍</span>}
            onFocus={onSearchFocus}
          />
        </div>
      </div>

      {/* Right: avatar + dropdown */}
      <div className={styles.right} ref={dropdownRef}>
        <button
          className={styles.avatarButton}
          onClick={() => setDropdownOpen((prev) => !prev)}
          aria-label="User menu"
        >
          <div className={styles.avatar}>U</div>
        </button>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              className={styles.dropdown}
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <div className={styles.dropdownHeader}>
                <span className={styles.dropdownName}>User</span>
                <span className={styles.dropdownRole}>Trader</span>
              </div>
              <div className={styles.dropdownDivider} />
              <button className={styles.dropdownItem} onClick={() => {}}>
                ⚙️ Settings
              </button>
              <button className={styles.dropdownItem} onClick={() => {}}>
                👤 Profile
              </button>
              <div className={styles.dropdownDivider} />
              <button
                className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                onClick={() => {}}
              >
                🚪 Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
