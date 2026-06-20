'use client'
import { useState, useMemo } from 'react'
import { cn, formatNumber } from '@/lib/utils'
import { useStore } from '@/store/useStore'

const netAsingData = {
  date: '2025-06-20',
  netBuy: 1_250_000_000_000,
  netSell: 850_000_000_000,
  total: 400_000_000_000,
  topBuy: [
    { ticker: 'BBCA', value: 450_000_000_000 },
    { ticker: 'BBRI', value: 320_000_000_000 },
    { ticker: 'TLKM', value: 210_000_000_000 },
    { ticker: 'ASII', value: 150_000_000_000 },
    { ticker: 'GGRM', value: 120_000_000_000 },
  ],
  topSell: [
    { ticker: 'ADRO', value: 280_000_000_000 },
    { ticker: 'UNVR', value: 200_000_000_000 },
    { ticker: 'BYAN', value: 150_000_000_000 },
    { ticker: 'HMSP', value: 120_000_000_000 },
    { ticker: 'KLBF', value: 100_000_000_000 },
  ],
}

export function NetAsing() {
  const { setSelectedTicker } = useStore()

  const isNetBuy = netAsingData.total > 0

  return (
    <div className="p-2 space-y-2">
      <h1 className="text-lg font-bold font-mono">🌐 NET ASING</h1>
      <p className="text-xs font-mono text-[var(--text-dim)]">Aksi investor asing · {netAsingData.date}</p>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-2">
        <div className="card-stats">
          <div className="stat-label">Net Foreign</div>
          <div className={cn('stat-value mt-1', isNetBuy ? 'text-green' : 'text-red')}>
            {isNetBuy ? '+' : ''}{formatNumber(netAsingData.total)}
          </div>
          <div className="text-[10px] font-mono mt-1">
            <span className={isNetBuy ? 'text-green' : 'text-red'}>{isNetBuy ? 'NET BUY' : 'NET SELL'}</span>
          </div>
        </div>
        <div className="card-stats">
          <div className="stat-label">Total Buy</div>
          <div className="stat-value mt-1 text-green">{formatNumber(netAsingData.netBuy)}</div>
        </div>
        <div className="card-stats">
          <div className="stat-label">Total Sell</div>
          <div className="stat-value mt-1 text-red">{formatNumber(netAsingData.netSell)}</div>
        </div>
        <div className="card-stats">
          <div className="stat-label">Ratio (B/S)</div>
          <div className="stat-value mt-1 text-sm">
            {(netAsingData.netBuy / netAsingData.netSell).toFixed(2)}x
          </div>
        </div>
      </div>

      {/* Top Buys / Sales */}
      <div className="grid grid-cols-2 gap-2">
        <div className="terminal-panel">
          <div className="terminal-header"><span>🟢 TOP FOREIGN BUYS</span></div>
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-[10px] text-[var(--text-dim)] border-b border-[var(--border)]">
                <th className="text-left px-3 py-1.5">#</th>
                <th className="text-left px-3 py-1.5">Ticker</th>
                <th className="text-right px-3 py-1.5">Value (Rp)</th>
              </tr>
            </thead>
            <tbody>
              {netAsingData.topBuy.map((item, i) => (
                <tr key={item.ticker} className="data-row" onClick={() => setSelectedTicker(item.ticker)}>
                  <td className="px-3 py-1 text-[var(--text-dim)]">{i + 1}</td>
                  <td className="px-3 py-1 font-bold text-green">{item.ticker}</td>
                  <td className="px-3 py-1 text-right text-green font-medium">{formatNumber(item.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="terminal-panel">
          <div className="terminal-header"><span>🔴 TOP FOREIGN SELLS</span></div>
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-[10px] text-[var(--text-dim)] border-b border-[var(--border)]">
                <th className="text-left px-3 py-1.5">#</th>
                <th className="text-left px-3 py-1.5">Ticker</th>
                <th className="text-right px-3 py-1.5">Value (Rp)</th>
              </tr>
            </thead>
            <tbody>
              {netAsingData.topSell.map((item, i) => (
                <tr key={item.ticker} className="data-row" onClick={() => setSelectedTicker(item.ticker)}>
                  <td className="px-3 py-1 text-[var(--text-dim)]">{i + 1}</td>
                  <td className="px-3 py-1 font-bold text-red">{item.ticker}</td>
                  <td className="px-3 py-1 text-right text-red font-medium">{formatNumber(item.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bar chart summary */}
      <div className="terminal-panel p-3">
        <div className="text-xs font-mono text-[var(--text-dim)] mb-2">Foreign Flow Distribution</div>
        <div className="space-y-2">
          {netAsingData.topBuy.map(item => {
            const pct = (item.value / netAsingData.netBuy) * 100
            return (
              <div key={`b-${item.ticker}`} className="flex items-center gap-2 text-xs font-mono">
                <span className="w-14 font-bold text-green">{item.ticker}</span>
                <div className="flex-1 h-4 rounded bg-[var(--bg-primary)] overflow-hidden">
                  <div className="h-full bg-[var(--green)]/60 rounded" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-20 text-right text-green">{pct.toFixed(1)}%</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
