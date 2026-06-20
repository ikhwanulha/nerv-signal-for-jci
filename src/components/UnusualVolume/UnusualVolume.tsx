'use client'
import { useState, useMemo } from 'react'
import { cn, formatPercent, formatNumber } from '@/lib/utils'
import { useStore } from '@/store/useStore'

export function UnusualVolume() {
  const { setSelectedTicker } = useStore()

  const stocks = useMemo(() => {
    const tickers = ['BBCA', 'BBRI', 'TLKM', 'GGRM', 'ASII', 'ADRO', 'EXCL', 'BYAN', 'UNVR', 'KLBF']
    return tickers.map((ticker, i) => {
      const ratio = 1.5 + Math.random() * 8
      const avgVol = 10_000_000 + Math.random() * 50_000_000
      return {
        ticker,
        name: ['Bank Central Asia', 'Bank BRI', 'Telkom', 'Gudang Garam', 'Astra', 'Adaro Energy', 'XL Axiata', 'Bayan Resources', 'Unilever', 'Kalbe Farma'][i],
        currentVolume: avgVol * ratio,
        avgVolume: avgVol,
        volumeRatio: ratio,
        price: [10250, 5800, 3950, 24250, 6225, 3125, 2175, 18750, 2850, 1625][i],
        change: [75, 50, -25, 500, 100, -75, 50, -250, -50, 25][i],
        changePercent: [0.74, 0.87, -0.63, 2.11, 1.63, -2.34, 2.35, -1.32, -1.72, 1.56][i],
      }
    }).sort((a, b) => b.volumeRatio - a.volumeRatio)
  }, [])

  const [minRatio, setMinRatio] = useState(1.5)

  const filtered = useMemo(() => stocks.filter(s => s.volumeRatio >= minRatio), [stocks, minRatio])

  return (
    <div className="p-2 space-y-2">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold font-mono">🔥 UNUSUAL VOLUME</h1>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[var(--text-dim)]">Min Ratio:</span>
          <select className="input-terminal w-20" value={minRatio} onChange={e => setMinRatio(Number(e.target.value))}>
            <option value={1}>1x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
            <option value={3}>3x</option>
            <option value={5}>5x</option>
          </select>
        </div>
      </div>

      <div className="terminal-panel">
        <div className="terminal-header">
          <span>STOCKS WITH UNUSUAL VOLUME</span>
          <span className="text-[10px]">{filtered.length} results</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-[10px] text-[var(--text-dim)] border-b border-[var(--border)]">
                <th className="text-left px-3 py-1.5">Ticker</th>
                <th className="text-left px-3 py-1.5">Name</th>
                <th className="text-right px-3 py-1.5">Current Vol</th>
                <th className="text-right px-3 py-1.5">Avg Vol</th>
                <th className="text-right px-3 py-1.5">Volume Ratio</th>
                <th className="text-right px-3 py-1.5">Price</th>
                <th className="text-right px-3 py-1.5">Change</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.ticker} className="data-row" onClick={() => setSelectedTicker(s.ticker)}>
                  <td className="px-3 py-1 font-bold">{s.ticker}</td>
                  <td className="px-3 py-1 text-[var(--text-dim)]">{s.name}</td>
                  <td className="px-3 py-1 text-right text-[var(--text-primary)]">{formatNumber(s.currentVolume)}</td>
                  <td className="px-3 py-1 text-right text-[var(--text-dim)]">{formatNumber(s.avgVolume)}</td>
                  <td className="px-3 py-1 text-right">
                    <span className={cn(
                      'font-bold',
                      s.volumeRatio >= 3 ? 'text-green' : s.volumeRatio >= 2 ? 'text-amber' : 'text-[var(--text-primary)]'
                    )}>
                      {s.volumeRatio.toFixed(1)}x
                    </span>
                    <div className="h-1 rounded-full bg-[var(--bg-primary)] mt-0.5 overflow-hidden">
                      <div 
                        className={cn('h-full rounded-full', s.volumeRatio >= 3 ? 'bg-[var(--green)]' : 'bg-[var(--amber)]')}
                        style={{ width: `${Math.min(s.volumeRatio * 20, 100)}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-3 py-1 text-right">
                    Rp{s.price.toLocaleString('id-ID')}
                  </td>
                  <td className={cn('px-3 py-1 text-right font-medium', s.changePercent >= 0 ? 'text-green' : 'text-red')}>
                    {formatPercent(s.changePercent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-3 py-8 text-center text-[var(--text-dim)] font-mono text-xs">
            No stocks with unusual volume detected
          </div>
        )}
      </div>
    </div>
  )
}
