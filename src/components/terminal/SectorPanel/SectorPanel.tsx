'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { SectorPerformance } from '@/types';
import styles from './SectorPanel.module.scss';

interface SectorPanelProps {
  sectors: SectorPerformance[];
}

export default function SectorPanel({ sectors }: SectorPanelProps) {
  return (
    <div className={styles.grid}>
      {sectors.map((sector, i) => {
        const isPositive = sector.changePercent >= 0;
        const sizeClass = !sector.marketCap ? 'md'
          : sector.marketCap > 1_000_000_000_000_000 ? 'lg'
          : sector.marketCap > 500_000_000_000_000 ? 'md'
          : 'sm';

        return (
          <motion.div
            key={sector.sector}
            className={`${styles.card} ${styles[sizeClass]} ${isPositive ? styles.positive : styles.negative}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03, duration: 0.25 }}
          >
            <span className={styles.name}>{sector.sector}</span>
            <span className={styles.change}>{isPositive ? '+' : ''}{sector.changePercent.toFixed(2)}%</span>
          </motion.div>
        );
      })}
    </div>
  );
}
