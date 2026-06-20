'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStockStore } from '@/store/stockStore';
import Card from '@/components/ui/Card/Card';
import Button from '@/components/ui/Button/Button';
import type { StockQuote, TradingSignal, CandleData } from '@/types';
import styles from './stock.module.scss';

function formatPrice(p: number): string {
  return p.toLocaleString('id-ID');
}

function formatVolume(v: number): string {
  if (v >= 1_000_000_000_000) return `${(v / 1_000_000_000_000).toFixed(2)}T`;
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toString();
}

// Generate mock candlestick data based on current price
function generateCandles(basePrice: number, count: number = 50): CandleData[] {
  const candles: CandleData[] = [];
  let price = basePrice - basePrice * 0.05 + Math.random() * basePrice * 0.1;
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const open = price;
    const volatility = open * 0.02;
    const close = open + (Math.random() - 0.45) * volatility;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.floor(Math.random() * 10000000) + 1000000;
    const date = new Date(now - (count - i) * 86400000);
    candles.push({
      time: date.toISOString().split('T')[0],
      open: Math.round(open),
      high: Math.round(high),
      low: Math.round(low),
      close: Math.round(close),
      volume,
    });
    price = close;
  }
  return candles;
}

function CandleChart({ candles }: { candles: CandleData[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chartWidth, setChartWidth] = useState(0);

  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current?.parentElement) {
        setChartWidth(canvasRef.current.parentElement.clientWidth);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement?.clientWidth || 600;
    const height = 320;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const padding = { top: 20, right: 16, bottom: 30, left: 60 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Find price range
    const high = Math.max(...candles.map(c => c.high));
    const low = Math.min(...candles.map(c => c.low));
    const range = high - low || 1;
    const paddedLow = low - range * 0.1;
    const paddedHigh = high + range * 0.1;
    const paddedRange = paddedHigh - paddedLow;

    const candleWidth = Math.max(4, Math.min(12, chartW / candles.length * 0.6));
    const gap = chartW / candles.length;

    // Clear
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 0.5;
    const gridCount = 6;
    for (let i = 0; i <= gridCount; i++) {
      const y = padding.top + (chartH / gridCount) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // Price label
      const priceVal = paddedHigh - (paddedRange / gridCount) * i;
      ctx.fillStyle = '#5a5a72';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(priceVal).toLocaleString(), padding.left - 6, y + 3);
    }

    // Draw candles
    candles.forEach((c, i) => {
      const x = padding.left + i * gap;
      const isUp = c.close >= c.open;

      const yHigh = padding.top + ((paddedHigh - c.high) / paddedRange) * chartH;
      const yLow = padding.top + ((paddedHigh - c.low) / paddedRange) * chartH;
      const yOpen = padding.top + ((paddedHigh - c.open) / paddedRange) * chartH;
      const yClose = padding.top + ((paddedHigh - c.close) / paddedRange) * chartH;

      ctx.strokeStyle = isUp ? '#00ff41' : '#ff3355';
      ctx.lineWidth = 1;

      // Wick
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, yHigh);
      ctx.lineTo(x + candleWidth / 2, yLow);
      ctx.stroke();

      // Body
      const bodyTop = Math.min(yOpen, yClose);
      const bodyHeight = Math.max(1, Math.abs(yClose - yOpen));
      ctx.fillStyle = isUp ? '#00ff41' : '#ff3355';
      ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);
    });

    // Volume bars (bottom)
    const maxVol = Math.max(...candles.map(c => c.volume));
    const volHeight = 30;
    candles.forEach((c, i) => {
      const x = padding.left + i * gap;
      const barH = (c.volume / maxVol) * volHeight;
      const y = height - padding.bottom - barH;
      ctx.fillStyle = c.close >= c.open ? 'rgba(0,255,65,0.3)' : 'rgba(255,51,85,0.3)';
      ctx.fillRect(x, y, candleWidth, barH);
    });

    // Time labels
    const labelStep = Math.max(1, Math.floor(candles.length / 8));
    ctx.fillStyle = '#5a5a72';
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    for (let i = 0; i < candles.length; i += labelStep) {
      const x = padding.left + i * gap + candleWidth / 2;
      const dateStr = candles[i].time.slice(5);
      ctx.fillText(dateStr, x, height - 6);
    }

  }, [candles, chartWidth]);

  return (
    <div className={styles.chartContainer}>
      <canvas ref={canvasRef} />
    </div>
  );
}

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticker = params.ticker as string;

  const { stocks, signals, watchlist, addToWatchlist, removeFromWatchlist } = useStockStore();

  const stock = stocks.find((s) => s.ticker === ticker);
  const stockSignals = signals.filter((s) => s.ticker === ticker);
  const isWatchlisted = watchlist.some(w => w.ticker === ticker);

  const candles = useMemo(() => {
    if (!stock) return [];
    return generateCandles(stock.price, 50);
  }, [stock?.price]);

  if (!stock) {
    return (
      <div className={styles.page}>
        <Card className={styles.notFound}>
          <h2>Saham {ticker} tidak ditemukan</h2>
          <p>Saham dengan kode <strong>{ticker}</strong> tidak tersedia.</p>
          <Button onClick={() => router.push('/')}>Kembali ke Dashboard</Button>
        </Card>
      </div>
    );
  }

  const isPositive = stock.change >= 0;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.ticker}>{stock.ticker}</h1>
          <span className={styles.companyName}>{stock.name}</span>
          <span className={styles.sectorTag}>{stock.sector}</span>
        </div>
        <div className={styles.headerRight}>
          <span className={`${styles.price} ${isPositive ? styles.positive : styles.negative}`}>
            {formatPrice(stock.price)}
          </span>
          <span className={`${styles.change} ${isPositive ? styles.positive : styles.negative}`}>
            {isPositive ? '+' : ''}{formatPrice(stock.change)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Chart Section */}
        <div className={styles.chartSection}>
          <Card>
            <div className={styles.sectionTitle}>Price Chart</div>
            <CandleChart candles={candles} />
          </Card>
        </div>

        {/* Stats Section */}
        <div className={styles.statsSection}>
          <Card>
            <div className={styles.sectionTitle}>Key Statistics</div>
            <div className={styles.statsGrid}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Open</span>
                <span className={styles.statValue}>{formatPrice(stock.open)}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>High</span>
                <span className={styles.statValue}>{formatPrice(stock.high)}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Low</span>
                <span className={styles.statValue}>{formatPrice(stock.low)}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Volume</span>
                <span className={styles.statValue}>{formatVolume(stock.volume)}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Market Cap</span>
                <span className={styles.statValue}>
                  {stock.marketCap ? `Rp${(stock.marketCap / 1_000_000_000_000).toFixed(2)}T` : '-'}
                </span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>P/E Ratio</span>
                <span className={styles.statValue}>{stock.peRatio?.toFixed(2) || '-'}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>P/B Ratio</span>
                <span className={styles.statValue}>{stock.pbRatio?.toFixed(2) || '-'}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Dividend Yield</span>
                <span className={styles.statValue}>{stock.dividendYield ? `${stock.dividendYield.toFixed(2)}%` : '-'}</span>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className={styles.actions}>
            <Button variant={isWatchlisted ? 'danger' : 'primary'} onClick={() => {
              isWatchlisted ? removeFromWatchlist(ticker) : addToWatchlist({ ticker, name: stock?.name || ticker, addedAt: Date.now() });
            }}>
              {isWatchlisted ? '★ Remove from Watchlist' : '☆ Add to Watchlist'}
            </Button>
            <Button variant="primary" className={styles.btnBuy}>Buy</Button>
            <Button variant="danger" className={styles.btnSell}>Sell</Button>
          </div>

          {/* Signals */}
          {stockSignals.length > 0 && (
            <Card>
              <div className={styles.sectionTitle}>Signals</div>
              <div className={styles.signalList}>
                {stockSignals.map((signal) => (
                  <div key={signal.id} className={styles.signalItem}>
                    <div className={styles.signalHeader}>
                      <span className={`${styles.directionBadge} ${styles[signal.direction.toLowerCase()]}`}>
                        {signal.direction}
                      </span>
                      <span className={styles.signalTimeframe}>{signal.timeframe}</span>
                    </div>
                    <p className={styles.signalReason}>{signal.reason}</p>
                    <div className={styles.signalDetails}>
                      <div className={styles.signalDetail}>
                        <span className={styles.signalDetailLabel}>Entry</span>
                        <span className={styles.signalDetailValue}>{formatPrice(signal.entryPrice)}</span>
                      </div>
                      <div className={styles.signalDetail}>
                        <span className={styles.signalDetailLabel}>SL</span>
                        <span className={styles.signalDetailValue}>{formatPrice(signal.stopLoss)}</span>
                      </div>
                      <div className={styles.signalDetail}>
                        <span className={styles.signalDetailLabel}>TP1</span>
                        <span className={styles.signalDetailValue}>{formatPrice(signal.takeProfit1)}</span>
                      </div>
                      <div className={styles.signalDetail}>
                        <span className={styles.signalDetailLabel}>TP2</span>
                        <span className={styles.signalDetailValue}>{formatPrice(signal.takeProfit2)}</span>
                      </div>
                      <div className={styles.signalDetail}>
                        <span className={styles.signalDetailLabel}>RR</span>
                        <span className={styles.signalDetailValue}>{signal.riskReward.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className={styles.confidenceBar}>
                      <div className={styles.confidenceLabel}>Confidence: {signal.confidence}%</div>
                      <div className={styles.confidenceTrack}>
                        <div
                          className={styles.confidenceFill}
                          style={{ width: `${signal.confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
