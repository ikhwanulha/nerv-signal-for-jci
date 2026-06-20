'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStockStore } from '@/store/stockStore';
import Card from '@/components/ui/Card/Card';
import Button from '@/components/ui/Button/Button';
import type { TradingSignal, SignalDirection } from '@/types';
import styles from './signals.module.scss';

function formatPrice(p: number): string {
  return p.toLocaleString('id-ID');
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

const DIRECTION_OPTIONS: Array<SignalDirection | 'ALL'> = ['ALL', 'STRONG_BUY', 'BUY', 'NEUTRAL', 'SELL', 'STRONG_SELL'];

function getDirectionBadgeClass(direction: SignalDirection): string {
  switch (direction) {
    case 'STRONG_BUY': return styles.strongBuy;
    case 'BUY': return styles.buy;
    case 'NEUTRAL': return styles.neutral;
    case 'SELL': return styles.sell;
    case 'STRONG_SELL': return styles.strongSell;
    default: return '';
  }
}

export default function SignalsPage() {
  const { signals } = useStockStore();
  const [filter, setFilter] = useState<SignalDirection | 'ALL'>('ALL');
  const [generating, setGenerating] = useState(false);

  const filteredSignals = filter === 'ALL'
    ? signals
    : signals.filter((s) => s.direction === filter);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 2000);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Trading Signals</h1>
          <p className={styles.pageSubtitle}>{signals.length} signals available</p>
        </div>
        <Button variant="primary" onClick={handleGenerate} disabled={generating}>
          {generating ? '⏳ Generating...' : '⚡ Generate Signals'}
        </Button>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        {DIRECTION_OPTIONS.map((dir) => (
          <button
            key={dir}
            className={`${styles.filterBtn} ${filter === dir ? styles.filterActive : ''}`}
            onClick={() => setFilter(dir)}
          >
            {dir === 'ALL' ? 'ALL' : dir.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredSignals.length === 0 && (
        <Card className={styles.emptyState}>
          <div className={styles.emptyIcon}>📊</div>
          <h3 className={styles.emptyTitle}>No Signals Found</h3>
          <p className={styles.emptyText}>
            {filter !== 'ALL'
              ? `Tidak ada signal dengan direction "${filter.replace('_', ' ')}" saat ini.`
              : 'Belum ada trading signal yang tersedia. Generate signal baru untuk memulai.'}
          </p>
          <Button variant="primary" onClick={handleGenerate} disabled={generating}>
            ⚡ Generate Signals
          </Button>
        </Card>
      )}

      {/* Signal Cards Grid */}
      {filteredSignals.length > 0 && (
        <div className={styles.grid}>
          {filteredSignals.map((signal, i) => (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <Card className={styles.signalCard}>
                <div className={styles.signalHeader}>
                  <div className={styles.signalTicker}>
                    <span className={styles.tickerText}>{signal.ticker}</span>
                    <span className={styles.signalName}>{signal.name}</span>
                  </div>
                  <span className={`${styles.directionBadge} ${getDirectionBadgeClass(signal.direction)}`}>
                    {signal.direction.replace('_', ' ')}
                  </span>
                </div>

                <div className={styles.signalInfo}>
                  <div className={styles.signalMeta}>
                    <span className={styles.metaLabel}>Timeframe</span>
                    <span className={styles.metaValue}>{signal.timeframe}</span>
                  </div>
                  <div className={styles.signalMeta}>
                    <span className={styles.metaLabel}>Generated</span>
                    <span className={styles.metaValue}>{timeAgo(signal.timestamp)}</span>
                  </div>
                </div>

                <p className={styles.signalReason}>{signal.reason}</p>

                <div className={styles.priceLevels}>
                  <div className={styles.priceLevel}>
                    <span className={styles.priceLabel}>Entry</span>
                    <span className={styles.priceValue}>{formatPrice(signal.entryPrice)}</span>
                  </div>
                  <div className={styles.priceLevel}>
                    <span className={styles.priceLabel}>SL</span>
                    <span className={`${styles.priceValue} ${styles.slValue}`}>{formatPrice(signal.stopLoss)}</span>
                  </div>
                  <div className={styles.priceLevel}>
                    <span className={styles.priceLabel}>TP1</span>
                    <span className={`${styles.priceValue} ${styles.tpValue}`}>{formatPrice(signal.takeProfit1)}</span>
                  </div>
                  <div className={styles.priceLevel}>
                    <span className={styles.priceLabel}>TP2</span>
                    <span className={`${styles.priceValue} ${styles.tpValue}`}>{formatPrice(signal.takeProfit2)}</span>
                  </div>
                </div>

                <div className={styles.confidenceSection}>
                  <div className={styles.rrRow}>
                    <span className={styles.rrLabel}>Risk/Reward</span>
                    <span className={styles.rrValue}>{signal.riskReward.toFixed(1)}</span>
                  </div>

                  <div className={styles.confidenceRow}>
                    <div className={styles.confidenceLabel}>
                      <span>Confidence</span>
                      <span className={styles.confidencePercent}>{signal.confidence}%</span>
                    </div>
                    <div className={styles.confidenceTrack}>
                      <div
                        className={styles.confidenceFill}
                        style={{ width: `${signal.confidence}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Technical Indicators */}
                <details className={styles.indicators}>
                  <summary className={styles.indicatorsSummary}>Technical Indicators</summary>
                  <div className={styles.indicatorsGrid}>
                    <div className={styles.indicator}>
                      <span className={styles.indicatorLabel}>RSI</span>
                      <span className={styles.indicatorValue}>{signal.indicators.rsi}</span>
                    </div>
                    <div className={styles.indicator}>
                      <span className={styles.indicatorLabel}>MACD</span>
                      <span className={styles.indicatorValue}>{signal.indicators.macd}</span>
                    </div>
                    <div className={styles.indicator}>
                      <span className={styles.indicatorLabel}>MA</span>
                      <span className={styles.indicatorValue}>{signal.indicators.ma}</span>
                    </div>
                    <div className={styles.indicator}>
                      <span className={styles.indicatorLabel}>Bollinger</span>
                      <span className={styles.indicatorValue}>{signal.indicators.bollinger}</span>
                    </div>
                  </div>
                </details>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
