'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useStockStore } from '@/store/stockStore';
import Card from '@/components/ui/Card/Card';
import Modal from '@/components/ui/Modal/Modal';
import StockTable from '@/components/terminal/StockTable/StockTable';
import SectorPanel from '@/components/terminal/SectorPanel/SectorPanel';
import NewsCard from '@/components/terminal/NewsCard/NewsCard';
import CommandBar from '@/components/terminal/CommandBar/CommandBar';
import type { NewsItem } from '@/types';
import styles from './page.module.scss';

function formatTime(date: Date): string {
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatVolume(v: number): string {
  if (v >= 1_000_000_000_000) return `${(v / 1_000_000_000_000).toFixed(2)}T`;
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  return v.toLocaleString('id-ID');
}

export default function DashboardPage() {
  const router = useRouter();
  const { ihsg, stocks, gainers, losers, sectors, news } = useStockStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [priceFlash, setPriceFlash] = useState<"up" | "down" | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const prevPriceRef = useRef(ihsg?.price || 0);
  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Price flash animation
  useEffect(() => {
    if (ihsg && prevPriceRef.current !== ihsg.price) {
      const goingUp = ihsg.price > prevPriceRef.current;
      prevPriceRef.current = ihsg.price;
      const timer = setTimeout(() => {
        setPriceFlash(goingUp ? 'up' : 'down');
        setTimeout(() => setPriceFlash(null), 500);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [ihsg?.price]);

  const isPositive = ihsg.change >= 0;

  const handleStockSelect = useCallback((ticker: string) => {
    router.push(`/dashboard/stocks/${ticker}`);
  }, [router]);

  return (
    <div className={styles.page}>
      <CommandBar />

      {/* Top: IHSG Ticker */}
      <div className={styles.tickerBar}>
        <div className={styles.tickerInfo}>
          <span className={styles.tickerLabel}>IHSG</span>
          <span className={`${styles.tickerPrice} ${priceFlash === 'up' ? styles.flashUp : priceFlash === 'down' ? styles.flashDown : ''}`}>
            {ihsg.price.toFixed(2)}
          </span>
          <span className={`${styles.tickerChange} ${isPositive ? styles.positive : styles.negative}`}>
            {isPositive ? '+' : ''}{ihsg.change.toFixed(2)}
          </span>
          <span className={`${styles.tickerPercent} ${isPositive ? styles.positive : styles.negative}`}>
            ({isPositive ? '+' : ''}{ihsg.changePercent.toFixed(2)}%)
          </span>
          <span className={styles.tickerVolume}>
            Vol: {formatVolume(ihsg.volume)}
          </span>
        </div>
        <div className={styles.tickerTime}>
          <span className={styles.lastUpdated}>
            Last Updated: {formatTime(currentTime)}
          </span>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Left Column: Market Data */}
        <div className={styles.leftCol}>
          {/* Command Bar Hint */}
          <p className={styles.commandHint}>
            Press <kbd>⌘K</kbd> to search stocks
          </p>

          {/* Gainers / Losers */}
          <div className={styles.gainersLosers}>
            <Card className={styles.gainerCard}>
              <div className={styles.cardHeader}>🏆 Top Gainers</div>
              <div className={styles.miniList}>
                {gainers.slice(0, 5).map((s) => (
                  <div key={s.ticker} className={styles.miniItem} onClick={() => handleStockSelect(s.ticker)}>
                    <span className={styles.miniTicker}>{s.ticker}</span>
                    <span className={styles.positive}>+{s.changePercent.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card className={styles.loserCard}>
              <div className={styles.cardHeader}>📉 Top Losers</div>
              <div className={styles.miniList}>
                {losers.slice(0, 5).map((s) => (
                  <div key={s.ticker} className={styles.miniItem} onClick={() => handleStockSelect(s.ticker)}>
                    <span className={styles.miniTicker}>{s.ticker}</span>
                    <span className={styles.negative}>{s.changePercent.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sector Performance */}
          <Card>
            <div className={styles.cardHeader}>📊 Sector Performance</div>
            <SectorPanel sectors={sectors} />
          </Card>

          {/* Stock Table */}
          <Card>
            <div className={styles.cardHeader}>📋 Market Watch</div>
            <StockTable stocks={stocks} onSelect={handleStockSelect} showSector />
          </Card>
        </div>

        {/* Right Column: News */}
        <div className={styles.rightCol}>
          <Card>
            <div className={styles.cardHeader}>📰 Market News</div>
            <div className={styles.newsList}>
              {news.length === 0 ? (
                <p className={styles.newsEmpty}>No news available</p>
              ) : (
                news.map((item) => (
                  <NewsCard
                    key={item.id}
                    news={item}
                    onClick={() => setSelectedNews(item)}
                  />
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* News Detail Modal */}
      <Modal
        isOpen={!!selectedNews}
        onClose={() => setSelectedNews(null)}
        title="News Detail"
      >
        {selectedNews && (
          <div className={styles.newsModal}>
            <div className={styles.newsModalMeta}>
              <span className={`${styles.sentimentIndicator} ${
                selectedNews.sentiment === 'positive' ? styles.sentimentPositive
                : selectedNews.sentiment === 'negative' ? styles.sentimentNegative
                : styles.sentimentNeutral
              }`}>
                {selectedNews.sentiment === 'positive' ? '📈 Positive'
                 : selectedNews.sentiment === 'negative' ? '📉 Negative'
                 : '⚖️ Neutral'}
              </span>
              <span className={styles.newsModalSource}>{selectedNews.source}</span>
            </div>

            <h3 className={styles.newsModalTitle}>{selectedNews.title}</h3>
            <p className={styles.newsModalSummary}>{selectedNews.summary || selectedNews.title}</p>

            {selectedNews.tickers && selectedNews.tickers.length > 0 && (
              <div className={styles.newsModalTickers}>
                <span className={styles.newsModalLabel}>Related Tickers:</span>
                <div className={styles.newsModalTickerList}>
                  {selectedNews.tickers.map((t) => (
                    <button
                      key={t}
                      className={styles.newsModalTicker}
                      onClick={() => { setSelectedNews(null); router.push(`/dashboard/stocks/${t}`); }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <a
              href={selectedNews.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.newsModalLink}
            >
              Baca Selengkapnya di {selectedNews.source} →
            </a>
          </div>
        )}
      </Modal>
    </div>
  );
}
