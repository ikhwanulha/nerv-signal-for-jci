'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/terminal/Header/Header';
import Sidebar from '@/components/terminal/Sidebar/Sidebar';
import BottomNav from '@/components/terminal/BottomNav/BottomNav';
import { useRouter, usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import styles from './layout.module.scss';

// Map pathname to nav item id
const pathToItem: Record<string, string> = {
  '/': 'dashboard',
  '/stocks': 'stocks',
  '/portfolio': 'portfolio',
  '/signals': 'signals',
  '/settings': 'settings',
};

const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.15 } },
};

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const activeItem = pathToItem[pathname] || 'dashboard';

  const handleNavigate = (item: string) => {
    const path = item === 'dashboard' ? '/' : `/${item}`;
    router.push(path);
  };

  const handleSearchFocus = () => {
    // Could open command palette
  };

  return (
    <div className={styles.layout}>
      {/* Header */}
      <Header
        onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        onSearchFocus={handleSearchFocus}
      />

      {/* Body: sidebar + content */}
      <div className={styles.body}>
        {/* Sidebar (mobile overlay + desktop persistent) */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeItem={activeItem}
          onNavigate={handleNavigate}
        />

        {/* Main content */}
        <main className={styles.content}>
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={styles.page}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Bottom navigation (mobile only) */}
      <BottomNav activeItem={activeItem} onNavigate={handleNavigate} />
    </div>
  );
};

export default DashboardLayout;
