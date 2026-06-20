'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useStockStore } from '@/store/stockStore';
import type { IDXStock } from '@/types';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}
import styles from './CommandBar.module.scss';

export default function CommandBar() {
  const router = useRouter();
  const { commandBarOpen, toggleCommandBar, searchQuery, setSearchQuery, allStocks } = useStockStore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(searchQuery, 300);
  
  const results = debouncedQuery.trim()
    ? allStocks.filter(
        (s: IDXStock) =>
          s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 20)
    : allStocks.slice(0, 20);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandBar();
      }
      if (e.key === 'Escape' && commandBarOpen) {
        toggleCommandBar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandBarOpen, toggleCommandBar]);

  useEffect(() => {
    if (commandBarOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      // reset handled via key change
    }
  }, [commandBarOpen]);

  useEffect(() => {
    // reset handled via key change
  }, [searchQuery]);

  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const el = listRef.current.children[selectedIndex] as HTMLElement;
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const selectStock = useCallback((ticker: string) => {
    toggleCommandBar();
    setSearchQuery('');
    router.push(`/dashboard/stocks/${ticker}`);
  }, [router, toggleCommandBar, setSearchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      selectStock(results[selectedIndex].ticker);
    }
  };

  return (
    <AnimatePresence>
      {commandBarOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={toggleCommandBar}
        >
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.inputWrapper}>
              <span className={styles.searchIcon}>⌕</span>
              <input
                ref={inputRef}
                className={styles.input}
                placeholder="Cari saham berdasarkan nama atau kode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              {searchQuery && (
                <button className={styles.clearBtn} onClick={() => setSearchQuery('')}>✕</button>
              )}
            </div>

            <div className={styles.results} ref={listRef}>
              {results.length === 0 ? (
                <div className={styles.empty}>
                  <span>Tidak ditemukan untuk &quot;{searchQuery}&quot;</span>
                </div>
              ) : (
                results.map((stock: IDXStock, i: number) => (
                  <div
                    key={stock.ticker}
                    className={`${styles.resultItem} ${i === selectedIndex ? styles.selected : ''}`}
                    onClick={() => selectStock(stock.ticker)}
                    onMouseEnter={() => setSelectedIndex(i)}
                  >
                    <span className={styles.ticker}>{stock.ticker}</span>
                    <span className={styles.name}>{stock.name}</span>
                    <span className={styles.sector}>{stock.sector}</span>
                  </div>
                ))
              )}
            </div>

            <div className={styles.footer}>
              <span className={styles.shortcut}>
                <kbd>↑↓</kbd> Navigate
              </span>
              <span className={styles.shortcut}>
                <kbd>⏎</kbd> Select
              </span>
              <span className={styles.shortcut}>
                <kbd>Esc</kbd> Close
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
