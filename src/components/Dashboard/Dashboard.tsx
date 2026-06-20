'use client'
import { useStore } from '@/store/useStore'
import { useEffect, useState } from 'react'
import { formatNumber, formatPercent, cn, timeAgo } from '@/lib/utils'
import { fetchIHSG, searchStocks, fetchNews } from '@/lib/api'
import { StockQuote, NewsItem } from '@/types'
import toast from 'react-hot-toast'

export function Dashboard() {
  const { 
    ihsg, gainers, losers, sectors, news, selectedTicker, setSelectedTicker,
    refreshData, lastUpdate, loading
  } = useStore()

  const [stocks, setStocks] = useState<StockQuote[]>([])
  const [activeView, setActiveView] = useState<'gainers' | 'losers' | 'sectors'>('gainers')

  useEffect(() => {
    fetchIHSG()
    searchStocks('').then(setStocks)
  }, [])

  // Auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(() => refreshData(), 60000)
    return () => clearInterval(interval)
  }, [refreshData])

  return (
    <div className="p-2 space-y-2">
      {/* ─── Header Row ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold font-mono text-[var(--text-primary)]">
            IHSG <span className="text-[var(--text-dim)] font-normal text-xs">Indeks Harga Saham Gabungan</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[var(--text-dim)] font-mono">
            Updated: {lastUpdate.market ? timeAgo(lastUpdate.market) : '---'}
          </span>
          <button onClick={refreshData} className="btn-terminal" disabled={loading['ihsg']}>
            {loading['ihsg'] ? '⏳' : '↻ Refresh'}
          </button>
        </div>
      </div>

      {/* ─── IHSG Ticker Tape ─── */}
      <div className="terminal-panel">
        <div className="terminal-header">
          <span>IHSG · IDX Composite</span>
          <span className="text-[10px]">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
        <div className="p-4 flex items-center gap-8 flex-wrap">
          <div>
            <div className="text-3xl font-bold font-mono tracking-tight">
              {ihsg.price.toFixed(2)}
            </div>
            <div className={cn(
              'flex items-center gap-2 mt-1 text-sm font-mono',
              ihsg.change >= 0 ? 'text-green' : 'text-red'
            )}>
              <span className={cn('text-xl', ihsg.change >= 0 ? '' : 'rotate-180 inline-block')}>
                {ihsg.change >= 0 ? '▲' : '▼'}
              </span>
              <span>{ihsg.change >= 0 ? '+' : ''}{ihsg.change.toFixed(2)}</span>
              <span className="font-semibold">({formatPercent(ihsg.changePercent)})</span>
            </div>
          </div>
          <div className="flex gap-6 text-xs font-mono">
            <div><span className="text-[var(--text-dim)]">Open</span><br/>{ihsg.open.toFixed(2)}</div>
            <div><span className="text-[var(--text-dim)]">High</span><br/>{ihsg.high.toFixed(2)}</div>
            <div><span className="text-[var(--text-dim)]">Low</span><br/>{ihsg.low.toFixed(2)}</div>
            <div><span className="text-[var(--text-dim)]">Prev Close</span><br/>{ihsg.previousClose.toFixed(2)}</div>
          </div>
          <div className="flex gap-6 text-xs font-mono border-l border-[var(--border)] pl-6">
            <div>
              <span className="text-[var(--text-dim)]">Volume</span>
              <br/><span className="font-semibold">{formatNumber(ihsg.volume)}</span>
            </div>
            <div>
              <span className="text-[var(--text-dim)]">Value</span>
              <br/><span className="font-semibold">{formatNumber(ihsg.value)}</span>
            </div>
            <div>
              <span className="text-[var(--text-dim)]">Frequency</span>
              <br/><span className="font-semibold">{formatNumber(ihsg.frequency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Grid: Left (Gainers/Losers/Sectors) | Right (News) ─── */}
      <div className="grid grid-cols-3 gap-2">
        {/* Left: Gainers/Losers */}
        <div className="col-span-2 space-y-2">
          {/* Tab buttons */}
          <div className="flex gap-1">
            {(['gainers', 'losers', 'sectors'] as const).map(view => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={cn(
                  'px-3 py-1 text-xs font-mono rounded-t border-b-2 transition-colors',
                  activeView === view
                    ? 'bg-[var(--bg-surface)] border-[var(--accent)] text-[var(--text-primary)]'
                    : 'bg-transparent border-transparent text-[var(--text-dim)] hover:text-[var(--text-primary)]'
                )}
              >
                {view === 'gainers' ? '📈 Top Gainers' : view === 'losers' ? '📉 Top Losers' : '🏢 Sectors'}
              </button>
            ))}
          </div>

          <div className="terminal-panel">
            <div className="terminal-header">
              <span>{activeView === 'gainers' ? 'TOP GAINERS' : activeView === 'losers' ? 'TOP LOSERS' : 'SEKTOR UNGGULAN'}</span>
              <span className="text-[10px]">{activeView === 'gainers' ? gainers.length : activeView === 'losers' ? losers.length : sectors.length} items</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="text-[10px] text-[var(--text-dim)] border-b border-[var(--border)]">
                    <th className="text-left px-3 py-1.5 font-medium">#</th>
                    <th className="text-left px-3 py-1.5 font-medium">Ticker</th>
                    <th className="text-left px-3 py-1.5 font-medium">Name</th>
                    <th className="text-right px-3 py-1.5 font-medium">Price</th>
                    <th className="text-right px-3 py-1.5 font-medium">Change</th>
                    <th className="text-right px-3 py-1.5 font-medium">% Change</th>
                    <th className="text-right px-3 py-1.5 font-medium">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {activeView === 'sectors' ? (
                    sectors.map((s, i) => (
                      <tr key={s.sector} className="data-row">
                        <td className="px-3 py-1 text-[var(--text-dim)]">{i + 1}</td>
                        <td className="px-3 py-1" colSpan={2}>{s.sector}</td>
                        <td className="px-3 py-1 text-right">-</td>
                        <td className={cn('px-3 py-1 text-right font-medium', s.change >= 0 ? 'text-green' : 'text-red')}>
                          {s.change >= 0 ? '+' : ''}{s.change.toFixed(1)}
                        </td>
                        <td className={cn('px-3 py-1 text-right font-medium', s.changePercent >= 0 ? 'text-green' : 'text-red')}>
                          {formatPercent(s.changePercent)}
                        </td>
                        <td className="px-3 py-1 text-right text-[var(--text-dim)]">{formatNumber(s.volume)}</td>
                      </tr>
                    ))
                  ) : (
                    (activeView === 'gainers' ? gainers : losers).map((s, i) => (
                      <tr 
                        key={`${s.ticker}-${i}`} 
                        className="data-row"
                        onClick={() => setSelectedTicker(s.ticker)}
                      >
                        <td className="px-3 py-1 text-[var(--text-dim)]">{i + 1}</td>
                        <td className="px-3 py-1 font-bold text-[var(--text-primary)]">{s.ticker}</td>
                        <td className="px-3 py-1 text-[var(--text-dim)] truncate max-w-[200px]">{s.name}</td>
                        <td className="px-3 py-1 text-right font-medium">
                          Rp{s.price.toLocaleString('id-ID')}
                        </td>
                        <td className={cn('px-3 py-1 text-right font-medium', s.change >= 0 ? 'text-green' : 'text-red')}>
                          {s.change >= 0 ? '+' : ''}{s.change.toLocaleString('id-ID')}
                        </td>
                        <td className={cn('px-3 py-1 text-right font-medium', s.changePercent >= 0 ? 'text-green' : 'text-red')}>
                          {formatPercent(s.changePercent)}
                        </td>
                        <td className="px-3 py-1 text-right text-[var(--text-dim)]">{formatNumber(s.volume)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Search Results */}
          <div className="terminal-panel">
            <div className="terminal-header">
              <span>📌 QUOTE WATCH</span>
              <span className="text-[10px]">{stocks.length} stocks</span>
            </div>
            <div className="max-h-40 overflow-y-auto">
              {stocks.slice(0, 8).map(s => (
                <div 
                  key={s.ticker}
                  className="data-row"
                  onClick={() => setSelectedTicker(s.ticker)}
                >
                  <span className="w-14 font-bold text-[var(--text-primary)]">{s.ticker}</span>
                  <span className="flex-1 text-[var(--text-dim)] truncate">{s.name}</span>
                  <span className="w-24 text-right font-medium">
                    Rp{s.price.toLocaleString('id-ID')}
                  </span>
                  <span className={cn('w-20 text-right', s.change >= 0 ? 'text-green' : 'text-red')}>
                    {formatPercent(s.changePercent)}
                  </span>
                  <span className="w-20 text-right text-[var(--text-dim)]">{formatNumber(s.volume)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: News Feed */}
        <div className="space-y-1">
          <div className="terminal-panel h-full">
            <div className="terminal-header">
              <span>📰 BERITA TERKINI</span>
              <span className="text-[10px]">{news.length} items</span>
            </div>
            <div className="h-[calc(100%-32px)] overflow-y-auto">
              {news.map((n, i) => (
                <div key={n.id} className="px-3 py-2 border-b border-[var(--border)]/50 hover:bg-[var(--bg-hover)] cursor-pointer">
                  <div className="flex items-start gap-2">
                    <span className={cn(
                      'mt-1 w-1.5 h-1.5 rounded-full shrink-0',
                      n.sentiment === 'positive' ? 'bg-[var(--green)]' :
                      n.sentiment === 'negative' ? 'bg-[var(--red)]' : 'bg-[var(--amber)]'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium leading-tight text-[var(--text-primary)] line-clamp-2">{n.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-[var(--text-dim)]">{n.source}</span>
                        <span className="text-[10px] font-mono text-[var(--text-dim)]">{timeAgo(n.timestamp)}</span>
                        {n.tickers?.map(t => (
                          <span key={t} className="badge-blue text-[9px]" onClick={() => setSelectedTicker(t)}>{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Keyboard Shortcuts Hint ─── */}
      <div className="text-[10px] text-[var(--text-dim)] font-mono text-center py-1">
        <span className="mx-2">⌘K Search</span>
        <span className="mx-2">⌘1-9 Switch Panel</span>
        <span className="mx-2">F5 Refresh</span>
        <span className="mx-2">↑↓ Navigate tables</span>
      </div>
    </div>
  )
}
