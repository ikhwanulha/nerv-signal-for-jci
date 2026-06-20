'use client'
import { useStore } from '@/store/useStore'
import { useState, useMemo } from 'react'
import { formatNumber, formatPercent, cn, timeAgo } from '@/lib/utils'
import { 
  useIHSG, useTopGainers, useTopLosers, useSectors, 
  useAllStocks, useNews, useMarketStats 
} from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'

export function Dashboard() {
  const { setSelectedTicker, openNewsModal } = useStore()
  const { data: ihsg } = useIHSG()
  const { data: gainers } = useTopGainers()
  const { data: losers } = useTopLosers()
  const { data: sectors } = useSectors()
  const { data: allStocks } = useAllStocks()
  const { data: news } = useNews()
  const { data: marketStats } = useMarketStats()
  const queryClient = useQueryClient()

  const [activeView, setActiveView] = useState<'gainers' | 'losers' | 'sectors'>('gainers')
  const [expandedNewsId, setExpandedNewsId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredStocks = useMemo(() => {
    if (!allStocks) return []
    if (!searchTerm) return allStocks.slice(0, 20)
    const q = searchTerm.toUpperCase()
    return allStocks
      .filter(s => s.ticker.includes(q) || s.name.toUpperCase().includes(q))
      .slice(0, 20)
  }, [allStocks, searchTerm])

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['ihsg'] })
    queryClient.invalidateQueries({ queryKey: ['topGainers'] })
    queryClient.invalidateQueries({ queryKey: ['allStocks'] })
    queryClient.invalidateQueries({ queryKey: ['news'] })
  }

  return (
    <div className="p-2 space-y-2">
      {/* ─── Top Bar ─── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold font-mono">
            IHSG <span className="text-[var(--text-dim)] font-normal text-xs">Indeks Harga Saham Gabungan</span>
          </h1>
          <span className="badge-green text-[10px] animate-pulse-slow">LIVE</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[var(--text-dim)]">
            {allStocks?.length || 0} stocks tracked
          </span>
          <button onClick={handleRefresh} className="btn-terminal text-xs">
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* ─── IHSG Ticker ─── */}
      {ihsg && (
        <div className="terminal-panel">
          <div className="terminal-header">
            <span>IHSG · IDX Composite</span>
            <span className="text-[10px] text-[var(--accent)]">
              ◉ {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })} WIB
            </span>
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
              <div><span className="text-[var(--text-dim)]">Prev</span><br/>{ihsg.previousClose.toFixed(2)}</div>
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
              {marketStats && (
                <div>
                  <span className="text-[var(--text-dim)]">Breadth</span>
                  <br/>
                  <span className="text-green">↑{marketStats.advancing}</span>
                  <span className="text-[var(--text-dim)]">/</span>
                  <span className="text-red">↓{marketStats.declining}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Main Grid ─── */}
      <div className="grid grid-cols-3 gap-2">
        {/* Left: Stock Lists */}
        <div className="col-span-2 space-y-2">
          {/* Tabs */}
          <div className="flex gap-1">
            {(['gainers', 'losers', 'sectors'] as const).map(view => (
              <button key={view} onClick={() => setActiveView(view)}
                className={cn('px-3 py-1 text-xs font-mono rounded-t border-b-2 transition-colors',
                  activeView === view
                    ? 'bg-[var(--bg-surface)] border-[var(--accent)] text-[var(--text-primary)]'
                    : 'bg-transparent border-transparent text-[var(--text-dim)] hover:text-[var(--text-primary)]'
                )}>
                {view === 'gainers' ? '📈 Top Gainers' : view === 'losers' ? '📉 Top Losers' : '🏢 Sectors'}
              </button>
            ))}
          </div>

          {/* Market table */}
          <div className="terminal-panel">
            <div className="terminal-header">
              <span>{activeView === 'gainers' ? 'TOP GAINERS' : activeView === 'losers' ? 'TOP LOSERS' : 'SEKTOR'}</span>
              <span className="text-[10px]">
                {activeView === 'gainers' ? gainers?.length || 0 : activeView === 'losers' ? losers?.length || 0 : sectors?.length || 0} items
              </span>
            </div>
            <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="text-[10px] text-[var(--text-dim)] border-b border-[var(--border)] sticky top-0 bg-[var(--bg-surface)]">
                    <th className="text-left px-3 py-1.5 font-medium">#</th>
                    <th className="text-left px-3 py-1.5 font-medium">Ticker</th>
                    <th className="text-left px-3 py-1.5 font-medium">Name</th>
                    <th className="text-right px-3 py-1.5 font-medium">Price</th>
                    <th className="text-right px-3 py-1.5 font-medium">Change</th>
                    <th className="text-right px-3 py-1.5 font-medium">% Chg</th>
                    <th className="text-right px-3 py-1.5 font-medium">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {activeView === 'sectors' ? (
                    sectors?.map((s, i) => (
                      <tr key={s.sector} className="data-row">
                        <td className="px-3 py-1 text-[var(--text-dim)]">{i + 1}</td>
                        <td className="px-3 py-1 font-bold" colSpan={2}>{s.sector}</td>
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
                    (activeView === 'gainers' ? gainers : losers)?.map((s, i) => (
                      <tr key={`${s.ticker}-${i}`} className="data-row" onClick={() => setSelectedTicker(s.ticker)}>
                        <td className="px-3 py-1 text-[var(--text-dim)]">{i + 1}</td>
                        <td className="px-3 py-1 font-bold">{s.ticker}</td>
                        <td className="px-3 py-1 text-[var(--text-dim)] truncate max-w-[180px]">{s.name}</td>
                        <td className="px-3 py-1 text-right">Rp{s.price.toLocaleString('id-ID')}</td>
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

          {/* Quick search / All stocks */}
          <div className="terminal-panel">
            <div className="terminal-header">
              <span>📌 ALL STOCKS</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Cari ticker/nama..."
                  className="input-terminal w-48"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <span className="text-[10px]">{filteredStocks.length} stocks</span>
              </div>
            </div>
            <div className="max-h-[250px] overflow-y-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="text-[10px] text-[var(--text-dim)] border-b border-[var(--border)] sticky top-0 bg-[var(--bg-surface)]">
                    <th className="text-left px-3 py-1.5">Ticker</th>
                    <th className="text-left px-3 py-1.5">Name</th>
                    <th className="text-right px-3 py-1.5">Price</th>
                    <th className="text-right px-3 py-1.5">% Chg</th>
                    <th className="text-right px-3 py-1.5">Volume</th>
                    <th className="text-left px-3 py-1.5">Sector</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStocks.map(s => (
                    <tr key={s.ticker} className="data-row" onClick={() => setSelectedTicker(s.ticker)}>
                      <td className="px-3 py-1 font-bold">{s.ticker}</td>
                      <td className="px-3 py-1 text-[var(--text-dim)] truncate max-w-[150px]">{s.name}</td>
                      <td className="px-3 py-1 text-right">Rp{s.price.toLocaleString('id-ID')}</td>
                      <td className={cn('px-3 py-1 text-right font-medium', s.changePercent >= 0 ? 'text-green' : 'text-red')}>
                        {formatPercent(s.changePercent)}
                      </td>
                      <td className="px-3 py-1 text-right text-[var(--text-dim)]">{formatNumber(s.volume)}</td>
                      <td className="px-3 py-1 text-[var(--text-dim)] text-[10px]">{s.sector}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: News */}
        <div className="space-y-2">
          <div className="terminal-panel h-full">
            <div className="terminal-header">
              <span>📰 BERITA TERKINI</span>
              <span className="text-[10px]">{news?.length || 0} items</span>
            </div>
            <div className="h-[calc(100%-32px)] overflow-y-auto">
              {news?.map(n => (
                <div key={n.id}>
                  <div 
                    className="px-3 py-2.5 border-b border-[var(--border)]/50 hover:bg-[var(--bg-hover)] cursor-pointer"
                    onClick={() => {
                      if (expandedNewsId === n.id) {
                        setExpandedNewsId(null)
                      } else {
                        setExpandedNewsId(n.id)
                      }
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <span className={cn(
                        'mt-1 w-1.5 h-1.5 rounded-full shrink-0',
                        n.sentiment === 'positive' ? 'bg-[var(--green)]' : n.sentiment === 'negative' ? 'bg-[var(--red)]' : 'bg-[var(--amber)]'
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium leading-tight text-[var(--text-primary)]">{n.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono text-[var(--text-dim)]">{n.source}</span>
                          <span className="text-[10px] font-mono text-[var(--text-dim)]">{timeAgo(n.timestamp)}</span>
                          <span className="text-[10px] font-mono text-[var(--accent)] ml-auto">
                            {expandedNewsId === n.id ? '▲' : '▼'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expandable content */}
                    {expandedNewsId === n.id && (
                      <div className="mt-2 pt-2 border-t border-[var(--border)]/30 animate-fade-in">
                        <p className="text-xs font-mono text-[var(--text-secondary)] leading-relaxed">
                          {n.summary || n.title}
                        </p>
                        {n.tickers && n.tickers.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {n.tickers.map((t: string) => (
                              <span key={t} className="badge-blue text-[9px] cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedTicker(t) }}>
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <button 
                            className="btn-terminal text-[10px]"
                            onClick={(e) => { e.stopPropagation(); openNewsModal(n.id) }}
                          >
                            📖 Baca Lengkap
                          </button>
                          <a href={n.url} target="_blank" rel="noopener noreferrer" 
                             className="text-[10px] font-mono text-[var(--accent)] hover:underline"
                             onClick={e => e.stopPropagation()}>
                            Sumber ↗
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-[10px] text-[var(--text-dim)] font-mono text-center py-1">
        <span className="mx-2">⌘K Search</span>
        <span className="mx-2">⌘1-9 Switch Panel</span>
        <span className="mx-2">F5 Refresh</span>
        <span className="mx-2">Click news title to expand</span>
      </div>
    </div>
  )
}
