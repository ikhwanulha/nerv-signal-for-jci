'use client'
import { useState, useMemo } from 'react'
import { cn, formatPercent } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import { ChartPattern } from '@/types'

const patterns: { ticker: string; pattern: ChartPattern; direction: 'bullish' | 'bearish'; confidence: number; targetPrice: number }[] = [
  { ticker: 'BBCA', pattern: 'Cup & Handle', direction: 'bullish', confidence: 85, targetPrice: 11200 },
  { ticker: 'BBRI', pattern: 'Ascending Triangle', direction: 'bullish', confidence: 78, targetPrice: 6200 },
  { ticker: 'TLKM', pattern: 'Double Bottom', direction: 'bullish', confidence: 72, targetPrice: 4200 },
  { ticker: 'GGRM', pattern: 'Bull Flag', direction: 'bullish', confidence: 80, targetPrice: 26500 },
  { ticker: 'ASII', pattern: 'Head & Shoulders', direction: 'bearish', confidence: 75, targetPrice: 5500 },
  { ticker: 'ADRO', pattern: 'Descending Triangle', direction: 'bearish', confidence: 70, targetPrice: 2800 },
  { ticker: 'UNVR', pattern: 'Double Top', direction: 'bearish', confidence: 68, targetPrice: 2500 },
  { ticker: 'EXCL', pattern: 'Bull Flag', direction: 'bullish', confidence: 74, targetPrice: 2450 },
  { ticker: 'BYAN', pattern: 'Falling Wedge', direction: 'bullish', confidence: 65, targetPrice: 20500 },
  { ticker: 'KLBF', pattern: 'Rising Wedge', direction: 'bearish', confidence: 60, targetPrice: 1450 },
]

export function PatternScanner() {
  const { setSelectedTicker } = useStore()
  const [filterDir, setFilterDir] = useState<'all' | 'bullish' | 'bearish'>('all')
  const [scanning, setScanning] = useState(false)

  const filtered = useMemo(() => {
    if (filterDir === 'all') return patterns
    return patterns.filter(p => p.direction === filterDir)
  }, [filterDir])

  const handleScan = () => {
    setScanning(true)
    setTimeout(() => setScanning(false), 1500)
  }

  return (
    <div className="p-2 space-y-2">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold font-mono">📐 PATTERN SCANNER</h1>
        <button onClick={handleScan} className="btn-terminal-active" disabled={scanning}>
          {scanning ? '⏳ Scanning...' : '🔄 Scan'}
        </button>
      </div>

      <div className="flex gap-1">
        {(['all', 'bullish', 'bearish'] as const).map(d => (
          <button key={d} onClick={() => setFilterDir(d)}
            className={cn(
              'px-3 py-1 text-xs font-mono rounded transition-colors',
              filterDir === d ? 'bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30' : 'text-[var(--text-dim)] border border-transparent'
            )}>
            {d === 'all' ? 'All' : d === 'bullish' ? '🟢 Bullish' : '🔴 Bearish'}
          </button>
        ))}
      </div>

      <div className="terminal-panel">
        <div className="terminal-header">
          <span>DETECTED PATTERNS</span>
          <span className="text-[10px]">{filtered.length} patterns</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-[10px] text-[var(--text-dim)] border-b border-[var(--border)]">
                <th className="text-left px-3 py-1.5">Ticker</th>
                <th className="text-left px-3 py-1.5">Pattern</th>
                <th className="text-left px-3 py-1.5">Direction</th>
                <th className="text-right px-3 py-1.5">Confidence</th>
                <th className="text-right px-3 py-1.5">Target Price</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={`${p.ticker}-${p.pattern}`} className="data-row" onClick={() => setSelectedTicker(p.ticker)}>
                  <td className="px-3 py-1 font-bold">{p.ticker}</td>
                  <td className="px-3 py-1 text-[var(--text-primary)]">{p.pattern}</td>
                  <td className="px-3 py-1">
                    <span className={p.direction === 'bullish' ? 'badge-green' : 'badge-red'}>
                      {p.direction === 'bullish' ? '🟢 Bullish' : '🔴 Bearish'}
                    </span>
                  </td>
                  <td className="px-3 py-1 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span>{p.confidence}%</span>
                      <div className="w-16 h-1.5 rounded-full bg-[var(--bg-primary)] overflow-hidden">
                        <div className={cn('h-full rounded-full', p.confidence >= 80 ? 'bg-[var(--green)]' : p.confidence >= 70 ? 'bg-[var(--amber)]' : 'bg-[var(--red)]')}
                          style={{ width: `${p.confidence}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-1 text-right font-medium">
                    Rp{p.targetPrice.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-8 text-center text-[var(--text-dim)]">No patterns detected</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
