'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { StockQuote } from '@/types';
import styles from './StockTable.module.scss';

interface StockTableProps {
  stocks: StockQuote[];
  onSelect?: (ticker: string) => void;
  showSector?: boolean;
}

function formatVolume(v: number): string {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toString();
}

function formatPrice(p: number): string {
  return p.toLocaleString('id-ID');
}

export default function StockTable({ stocks, onSelect, showSector = true }: StockTableProps) {
  return (
    <>
      {/* Desktop Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Name</th>
              <th>Price</th>
              <th>Change</th>
              <th>Change%</th>
              <th>Volume</th>
              {showSector && <th>Sector</th>}
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock, i) => (
              <motion.tr
                key={stock.ticker}
                className={styles.row}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => onSelect?.(stock.ticker)}
              >
                <td className={styles.tickerCell}>{stock.ticker}</td>
                <td className={styles.nameCell}>{stock.name}</td>
                <td className={styles.priceCell}>{formatPrice(stock.price)}</td>
                <td className={stock.change >= 0 ? styles.positive : styles.negative}>
                  {stock.change >= 0 ? '+' : ''}{formatPrice(stock.change)}
                </td>
                <td className={stock.changePercent >= 0 ? styles.positive : styles.negative}>
                  {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </td>
                <td className={styles.volumeCell}>{formatVolume(stock.volume)}</td>
                {showSector && <td className={styles.sectorCell}>{stock.sector || '-'}</td>}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className={styles.mobileList}>
        {stocks.map((stock, i) => (
          <motion.div
            key={stock.ticker}
            className={styles.mobileCard}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            onClick={() => onSelect?.(stock.ticker)}
          >
            <div className={styles.mobileHeader}>
              <div>
                <span className={styles.mobileTicker}>{stock.ticker}</span>
                <span className={styles.mobileName}>{stock.name}</span>
              </div>
              <div className={stock.change >= 0 ? styles.positive : styles.negative}>
                <span className={styles.mobilePrice}>{formatPrice(stock.price)}</span>
              </div>
            </div>
            <div className={styles.mobileDetails}>
              <span className={stock.change >= 0 ? styles.positive : styles.negative}>
                {stock.change >= 0 ? '+' : ''}{formatPrice(stock.change)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
              </span>
              <span className={styles.mobileVolume}>Vol: {formatVolume(stock.volume)}</span>
              {showSector && stock.sector && (
                <span className={styles.mobileSector}>{stock.sector}</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}
