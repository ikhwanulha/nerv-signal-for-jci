'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { NewsItem } from '@/types';
import styles from './NewsCard.module.scss';

interface NewsCardProps {
  news: NewsItem;
  onClick?: () => void;
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NewsCard({ news, onClick }: NewsCardProps) {
  const [expanded, setExpanded] = useState(false);

  const sentimentDot = news.sentiment === 'positive' ? styles.dotPositive
    : news.sentiment === 'negative' ? styles.dotNegative
    : styles.dotNeutral;

  return (
    <motion.div
      className={styles.card}
      layout
      onClick={() => { setExpanded(!expanded); onClick?.(); }}
    >
      <div className={styles.header}>
        <div className={styles.meta}>
          <span className={`${styles.sentimentDot} ${sentimentDot}`} />
          <span className={styles.source}>{news.source}</span>
          <span className={styles.time}>{timeAgo(news.timestamp)}</span>
        </div>
        <h3 className={styles.title}>{news.title}</h3>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            className={styles.body}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <p className={styles.summary}>{news.summary || news.title}</p>
            {news.tickers && news.tickers.length > 0 && (
              <div className={styles.tickers}>
                {news.tickers.map((t) => (
                  <span key={t} className={styles.ticker}>{t}</span>
                ))}
              </div>
            )}
            <a
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.readMore}
              onClick={(e) => e.stopPropagation()}
            >
              Baca Selengkapnya →
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
