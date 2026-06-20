'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStockStore } from '@/store/stockStore';
import Card from '@/components/ui/Card/Card';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import type { PortfolioPosition } from '@/types';
import styles from './portfolio.module.scss';

function formatPrice(p: number): string {
  return p.toLocaleString('id-ID');
}

function formatVolume(v: number): string {
  if (v >= 1_000_000_000_000) return `${(v / 1_000_000_000_000).toFixed(2)}T`;
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  return v.toString();
}

export default function PortfolioPage() {
  const { portfolio, removeFromPortfolio, allStocks, stocks } = useStockStore();

  const [showForm, setShowForm] = useState(false);
  const [newTicker, setNewTicker] = useState('');
  const [newEntryPrice, setNewEntryPrice] = useState('');
  const [newLots, setNewLots] = useState('');

  const totalCost = portfolio.reduce((sum, p) => sum + p.entryPrice * p.quantity, 0);
  const totalValue = portfolio.reduce((sum, p) => sum + p.currentPrice * p.quantity, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  const handleAddPosition = () => {
    if (!newTicker.trim() || !newEntryPrice || !newLots) return;

    const lots = parseInt(newLots, 10);
    const entryPrice = parseInt(newEntryPrice.replace(/\D/g, ''), 10);
    if (isNaN(lots) || isNaN(entryPrice) || lots <= 0 || entryPrice <= 0) return;

    const stockData = allStocks.find((s) => s.ticker === newTicker.toUpperCase()) || stocks.find((s) => s.ticker === newTicker.toUpperCase());
    const currentPrice = stocks.find((s) => s.ticker === newTicker.toUpperCase())?.price || entryPrice;

    const newPosition: PortfolioPosition = {
      id: `p-${Date.now()}`,
      ticker: newTicker.toUpperCase(),
      name: stockData?.name || newTicker.toUpperCase(),
      entryPrice,
      quantity: lots * 100,
      lots,
      currentPrice,
      entryDate: new Date().toISOString().split('T')[0],
      sector: stockData?.sector || '-',
    };

    useStockStore.getState().addToPortfolio(newPosition);
    setNewTicker('');
    setNewEntryPrice('');
    setNewLots('');
    setShowForm(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Portfolio</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Position'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryGrid}>
        <Card>
          <div className={styles.summaryLabel}>Total Cost</div>
          <div className={styles.summaryValue}>Rp{formatVolume(totalCost)}</div>
        </Card>
        <Card>
          <div className={styles.summaryLabel}>Market Value</div>
          <div className={styles.summaryValue}>Rp{formatVolume(totalValue)}</div>
        </Card>
        <Card>
          <div className={styles.summaryLabel}>Total P&L</div>
          <div className={`${styles.summaryValue} ${totalPnl >= 0 ? styles.positive : styles.negative}`}>
            {totalPnl >= 0 ? '+' : ''}Rp{formatVolume(Math.abs(totalPnl))}
          </div>
          <div className={`${styles.summaryPercent} ${totalPnl >= 0 ? styles.positive : styles.negative}`}>
            {totalPnlPercent >= 0 ? '+' : ''}{totalPnlPercent.toFixed(2)}%
          </div>
        </Card>
      </div>

      {/* Add Position Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <Card className={styles.formCard}>
            <div className={styles.sectionTitle}>Add New Position</div>
            <div className={styles.formGrid}>
              <Input
                label="Ticker"
                placeholder="BBCA"
                value={newTicker}
                onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
              />
              <Input
                label="Entry Price (Rp)"
                placeholder="10000"
                type="number"
                value={newEntryPrice}
                onChange={(e) => setNewEntryPrice(e.target.value)}
              />
              <Input
                label="Lots (1 lot = 100 shares)"
                placeholder="5"
                type="number"
                value={newLots}
                onChange={(e) => setNewLots(e.target.value)}
              />
            </div>
            <div className={styles.formActions}>
              <Button variant="primary" onClick={handleAddPosition}>Add to Portfolio</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Empty State */}
      {portfolio.length === 0 && !showForm && (
        <Card className={styles.emptyState}>
          <div className={styles.emptyIcon}>📂</div>
          <h3 className={styles.emptyTitle}>Portfolio Kosong</h3>
          <p className={styles.emptyText}>
            Belum ada posisi saham di portfolio Anda. Mulai dengan menambahkan posisi baru.
          </p>
          <Button variant="primary" onClick={() => setShowForm(true)}>+ Tambah Posisi</Button>
        </Card>
      )}

      {/* Portfolio Table (Desktop) */}
      {portfolio.length > 0 && (
        <Card>
          <div className={styles.cardHeader}>
            <div className={styles.sectionTitle}>Positions</div>
            <span className={styles.positionCount}>{portfolio.length} positions</span>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Ticker</th>
                  <th>Name</th>
                  <th>Entry</th>
                  <th>Current</th>
                  <th>Lots</th>
                  <th>Cost</th>
                  <th>Value</th>
                  <th>P&L</th>
                  <th>P&L%</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map((pos, i) => {
                  const cost = pos.entryPrice * pos.quantity;
                  const value = pos.currentPrice * pos.quantity;
                  const pnl = value - cost;
                  const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;

                  return (
                    <motion.tr
                      key={pos.id}
                      className={styles.row}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <td className={styles.tickerCell}>{pos.ticker}</td>
                      <td className={styles.nameCell}>{pos.name}</td>
                      <td className={styles.numCell}>{formatPrice(pos.entryPrice)}</td>
                      <td className={styles.numCell}>{formatPrice(pos.currentPrice)}</td>
                      <td className={styles.numCell}>{pos.lots}</td>
                      <td className={styles.numCell}>Rp{formatVolume(cost)}</td>
                      <td className={styles.numCell}>Rp{formatVolume(value)}</td>
                      <td className={`${styles.numCell} ${pnl >= 0 ? styles.positive : styles.negative}`}>
                        {pnl >= 0 ? '+' : ''}Rp{formatVolume(Math.abs(pnl))}
                      </td>
                      <td className={`${styles.numCell} ${pnl >= 0 ? styles.positive : styles.negative}`}>
                        {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                      </td>
                      <td>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromPortfolio(pos.id)}
                        >
                          ✕
                        </Button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className={styles.mobileList}>
            {portfolio.map((pos, i) => {
              const cost = pos.entryPrice * pos.quantity;
              const value = pos.currentPrice * pos.quantity;
              const pnl = value - cost;
              const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;

              return (
                <motion.div
                  key={pos.id}
                  className={styles.mobileCard}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <div className={styles.mobileHeader}>
                    <div>
                      <span className={styles.mobileTicker}>{pos.ticker}</span>
                      <span className={styles.mobileName}>{pos.name}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeFromPortfolio(pos.id)}>✕</Button>
                  </div>
                  <div className={styles.mobileRow}>
                    <span className={styles.mobileLabel}>Entry</span>
                    <span className={styles.mobileVal}>{formatPrice(pos.entryPrice)}</span>
                  </div>
                  <div className={styles.mobileRow}>
                    <span className={styles.mobileLabel}>Current</span>
                    <span className={styles.mobileVal}>{formatPrice(pos.currentPrice)}</span>
                  </div>
                  <div className={styles.mobileRow}>
                    <span className={styles.mobileLabel}>Lots</span>
                    <span className={styles.mobileVal}>{pos.lots}</span>
                  </div>
                  <div className={styles.mobileRow}>
                    <span className={styles.mobileLabel}>Cost</span>
                    <span className={styles.mobileVal}>Rp{formatVolume(cost)}</span>
                  </div>
                  <div className={styles.mobileRow}>
                    <span className={styles.mobileLabel}>Value</span>
                    <span className={styles.mobileVal}>Rp{formatVolume(value)}</span>
                  </div>
                  <div className={`${styles.mobileRow} ${styles.mobilePnl}`}>
                    <span className={styles.mobileLabel}>P&L</span>
                    <span className={`${styles.mobileVal} ${pnl >= 0 ? styles.positive : styles.negative}`}>
                      {pnl >= 0 ? '+' : ''}Rp{formatVolume(Math.abs(pnl))} ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
