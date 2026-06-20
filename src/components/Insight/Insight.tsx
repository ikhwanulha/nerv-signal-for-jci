'use client'
import { useStore } from '@/store/useStore'
import { useState } from 'react'
import { cn, formatNumber, formatPercent, timeAgo } from '@/lib/utils'
import { useNews, useIHSG, useTopGainers, useTopLosers, useSectors } from '@/lib/api'

export function Insight() {
  const { setSelectedTicker } = useStore()
  const { data: ihsg } = useIHSG()
  const { data: gainers } = useTopGainers()
  const { data: losers } = useTopLosers()
  const { data: sectors } = useSectors()
  const { data: news } = useNews()
  
  const [activeNewsTab, setActiveNewsTab] = useState<'all' | 'positive' | 'negative'>('all')

  if (!ihsg || !gainers || !news || !sectors) {
    return <div className="p-8 text-center text-xs font-mono text-[var(--text-dim)]">Loading market data...</div>
  }

  const filteredNews = activeNewsTab === 'all' ? news : news.filter(n => n.sentiment === activeNewsTab)
  const positiveNews = news.filter(n => n.sentiment === 'positive').length
  const negativeNews = news.filter(n => n.sentiment === 'negative').length
  const neutralNews = news.filter(n => n.sentiment === 'neutral').length

  const totalSectorsUp = sectors.filter(s => s.changePercent >= 0).length
  const totalSectorsDown = sectors.filter(s => s.changePercent < 0).length

  return (
    <div className="p-2 space-y-3">
      <h1 className="text-lg font-bold font-mono">💡 MARKET INSIGHT</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-2">
        <div className="card-stats">
          <div className="stat-label">IHSG</div>
          <div className={cn('stat-value mt-1', (ihsg?.change || 0) >= 0 ? 'text-green' : 'text-red')}>
            {ihsg?.price.toFixed(2) || '-'}
          </div>
          <div className={cn('text-[10px] font-mono mt-1', (ihsg?.changePercent || 0) >= 0 ? 'text-green' : 'text-red')}>
            {(ihsg?.changePercent || 0) >= 0 ? '+' : ''}{(ihsg?.changePercent || 0).toFixed(2)}%
          </div>
        </div>
        <div className="card-stats">
          <div className="stat-label">Sentiment</div>
          <div className="stat-value mt-1 text-sm">
            <span className="text-green">{positiveNews}P</span>
            <span className="text-[var(--text-dim)]"> / </span>
            <span className="text-red">{negativeNews}N</span>
          </div>
          <div className="text-[10px] text-[var(--text-dim)] font-mono mt-1">
            {(positiveNews / (news.length || 1) * 100).toFixed(0)}% positive
          </div>
        </div>
        <div className="card-stats">
          <div className="stat-label">Top Sector</div>
          <div className="stat-value mt-1 text-green text-sm">
            {sectors.reduce((best, s) => s.changePercent > best.changePercent ? s : best, sectors[0])?.sector}
          </div>
          <div className="text-[10px] font-mono mt-1 text-green">
            +{sectors.reduce((best, s) => s.changePercent > best.changePercent ? s : best, sectors[0])?.changePercent.toFixed(1)}%
          </div>
        </div>
        <div className="card-stats">
          <div className="stat-label">Sector Breadth</div>
          <div className="stat-value mt-1 text-sm font-mono">
            <span className="text-green">↑ {totalSectorsUp}</span>
            <span className="text-[var(--text-dim)]"> / </span>
            <span className="text-red">↓ {totalSectorsDown}</span>
          </div>
          <div className="text-[10px] font-mono mt-1 text-[var(--text-dim)]">
            Advancing vs Declining
          </div>
        </div>
      </div>

      {/* News feed */}
      <div className="grid grid-cols-2 gap-2">
        <div className="terminal-panel">
          <div className="terminal-header">
            <span>📰 Latest News</span>
            <div className="flex gap-1">
              {(['all', 'positive', 'negative'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveNewsTab(tab)}
                  className={cn('px-2 py-0.5 text-[9px] font-mono rounded transition-colors',
                    activeNewsTab === tab ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'text-[var(--text-dim)]'
                  )}>
                  {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="max-h-[55vh] overflow-y-auto">
            {filteredNews.map(n => (
              <div key={n.id} className="px-3 py-2.5 border-b border-[var(--border)]/50 hover:bg-[var(--bg-hover)] cursor-pointer">
                <div className="flex items-start gap-2">
                  <span className={cn('mt-1 w-1.5 h-1.5 rounded-full shrink-0',
                    n.sentiment === 'positive' ? 'bg-[var(--green)]' : n.sentiment === 'negative' ? 'bg-[var(--red)]' : 'bg-[var(--amber)]'
                  )} />
                  <div className="flex-1">
                    <p className="text-xs font-medium leading-snug">{n.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono text-[var(--text-dim)]">{n.source}</span>
                      <span className="text-[10px] font-mono text-[var(--text-dim)]">{timeAgo(n.timestamp)}</span>
                      {n.tickers?.map(t => <span key={t} className="badge-blue text-[9px] cursor-pointer" onClick={() => setSelectedTicker(t)}>{t}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="terminal-panel">
          <div className="terminal-header"><span>📊 Market Analysis</span></div>
          <div className="p-4 space-y-4">
            {/* Sentiment bar */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-green">Positive ({positiveNews})</span>
                <span className="text-amber">Neutral ({neutralNews})</span>
                <span className="text-red">Negative ({negativeNews})</span>
              </div>
              <div className="h-3 rounded-full bg-[var(--bg-primary)] overflow-hidden flex">
                <div className="bg-[var(--green)] h-full" style={{ width: `${(positiveNews / news.length) * 100}%` }} />
                <div className="bg-[var(--amber)] h-full" style={{ width: `${(neutralNews / news.length) * 100}%` }} />
                <div className="bg-[var(--red)] h-full" style={{ width: `${(negativeNews / news.length) * 100}%` }} />
              </div>
            </div>

            {/* Sector analysis */}
            <div>
              <div className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-wider mb-2">Sector Performance</div>
              <div className="space-y-1.5">
                {sectors.sort((a, b) => b.changePercent - a.changePercent).slice(0, 6).map(s => (
                  <div key={s.sector} className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[var(--text-dim)]">{s.sector}</span>
                    <span className={cn('font-medium', s.changePercent >= 0 ? 'text-green' : 'text-red')}>
                      {formatPercent(s.changePercent)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Summary */}
            <div className="terminal-panel">
              <div className="terminal-header"><span>AI Market Summary</span></div>
              <div className="p-2 text-xs font-mono text-[var(--text-dim)] leading-relaxed">
                Pasar hari ini didominasi sentimen {positiveNews > negativeNews ? 'positif' : 'negatif'} dari sektor{' '}
                {sectors.reduce((best, s) => s.changePercent > best.changePercent ? s : best, sectors[0])?.sector}. 
                IHSG bergerak di level {ihsg?.price.toFixed(0)} dengan volume{' '}
                {formatNumber(ihsg?.volume || 0)}. Sektor{' '}
                {sectors.reduce((worst, s) => s.changePercent < worst.changePercent ? s : worst, sectors[0])?.sector} 
                masih tertekan.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
