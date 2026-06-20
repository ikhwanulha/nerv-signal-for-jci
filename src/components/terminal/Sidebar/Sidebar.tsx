'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Sidebar.module.scss';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem?: string;
  onNavigate?: (item: string) => void;
}

const menuItems: { id: string; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'stocks', label: 'Stocks', icon: '📈' },
  { id: 'portfolio', label: 'Portfolio', icon: '💼' },
  { id: 'signals', label: 'Signals', icon: '🔄' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sidebarVariants: Record<string, any> = {
  hidden: { x: '-100%' },
  visible: { x: 0, transition: { type: 'spring', damping: 25, stiffness: 250 } },
  exit: { x: '-100%', transition: { duration: 0.2 } },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const backdropVariants: Record<string, any> = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeItem = 'dashboard',
  onNavigate,
}) => {
  const handleNavClick = (id: string) => {
    onNavigate?.(id);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.backdrop}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            className={styles.sidebar}
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
        <div className={styles.inner}>
          {/* Logo */}
          <div className={styles.logo}>
            <span className={styles.logoIcon}>◈</span>
            <div className={styles.logoText}>
              <span className={styles.logoTitle}>NERV SIGNAL</span>
              <span className={styles.logoSub}>for JCI</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className={styles.nav}>
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`${styles.navItem} ${
                  activeItem === item.id ? styles.navItemActive : ''
                }`}
                onClick={() => handleNavClick(item.id)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Spacer */}
          <div className={styles.spacer} />

          {/* User area */}
          <div className={styles.userArea}>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>U</div>
              <div className={styles.userMeta}>
                <span className={styles.userName}>User</span>
                <span className={styles.userRole}>Trader</span>
              </div>
            </div>
            <button className={styles.logoutButton} onClick={() => {}}>
              Logout
            </button>
          </div>
        </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop persistent sidebar */}
      <aside className={styles.desktopSidebar}>
        <div className={styles.inner}>
          {/* Logo */}
          <div className={styles.logo}>
            <span className={styles.logoIcon}>◈</span>
            <div className={styles.logoText}>
              <span className={styles.logoTitle}>NERV SIGNAL</span>
              <span className={styles.logoSub}>for JCI</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className={styles.nav}>
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`${styles.navItem} ${
                  activeItem === item.id ? styles.navItemActive : ''
                }`}
                onClick={() => onNavigate?.(item.id)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Spacer */}
          <div className={styles.spacer} />

          {/* User area */}
          <div className={styles.userArea}>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>U</div>
              <div className={styles.userMeta}>
                <span className={styles.userName}>User</span>
                <span className={styles.userRole}>Trader</span>
              </div>
            </div>
            <button className={styles.logoutButton} onClick={() => {}}>
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
