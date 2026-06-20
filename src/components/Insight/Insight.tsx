'use client'
import { useStore } from '@/store/useStore'
import { useState } from 'react'
import { cn, formatNumber, formatPercent, formatPrice, timeAgo } from '@/lib/utils'

export function Insight() {
  const { ihsg, gainers, losers, news, sectors, setSelectedTicker } = useStore()
  const [activeNewsTab, setActiveNewsTab] = useState<'all' | 'positive' | 'negative'>('all')

  const filteredNews = activeNewsTab === 'all'
    ? news
    : news.filter(n => n.sentiment === activeNewsTab)

  const positiveNews = news.filter(n => n.sentiment === 'positive').length
  const negativeNews = news.filter(n => n.sentiment === 'negative').length
  const neutralNews = news.filter(n => n.sentiment === 'neutral').length

  // Market summary
  const advancers = gainers.length
  const decliners = losers.length
  const totalSectorsUp = sectors.filter(s => s.changePercent >= 0).length
  const totalSectorsDown = sectors.filter(s => s.changePercent < 0).length
  const advDecRatio = decliners > 0 ? (advancers / decliners).toFixed(2) : '∞'

  const topStories = [
    {
      title: 'IHSG Ditutup Menguat, Investor Asing Catatkan Net Buy Rp 1.2 Triliun',
      source: 'Kontan',
      sentiment: 'positive' as const,
      summary: `IHSG ditutup menguat ${formatPercent(ihsg.changePercent)} di level ${ihsg.price.toFixed(2)}. Investor asing mencatatkan net buy sebesar Rp 1.2 triliun, terutama di sektor perbankan.`,
    },
    {
      title: 'Bank Indonesia Pertahankan Suku Bunga Acuan di 6%',
      source: 'Bisnis.com',
      sentiment: 'neutral' as const,
      summary: 'BI mempertahankan BI-Rate di 6% dalam RDG bulan ini, sesuai dengan ekspektasi pasar. Stabilitas nilai tukar dan inflasi tetap terjaga.',
    },
    {
      title: 'Harga Komoditas Anjlok, Sektor Energi Tertekan',
      source: 'Bloomberg Technoz',
      sentiment: 'negative' as const,
      summary: 'Harga batubara dan CPO turun signifikan, memberikan tekanan pada saham-saham energi dan perkebunan.',
    },
  ]

  return (
    <div className="p-2 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold font-mono text-[var(--text-primary)]">
            💡 MARKET INSIGHT
          </h1>
          <p className="text-[10px] text-[var(--text-dim)] font-mono">
            Market analysis, news, and key statistics
          </p>
        </div>
        <span className="text-[10px] text-[var(--text-dim)] font-mono">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* Left column: Market Summary + Key Stats */}
        <div className="space-y-2">
          {/* Market Summary */}
          <div className="terminal-panel">
            <div className="terminal-header">
              <span>📊 MARKET SUMMARY</span>
            </div>
            <div className="p-3 text-xs text-[var(--text-primary)] leading-relaxed font-mono space-y-2">
              <p>
                Pasar saham Indonesia ditutup{' '}
                <span className={ihsg.change >= 0 ? 'text-green font-semibold' : 'text-red font-semibold'}>
                  {ihsg.change >= 0 ? 'menguat' : 'melemah'}
                </span>{' '}
                dengan IHSG di <span className="font-bold">{ihsg.price.toFixed(2)}</span>,{' '}
                {ihsg.change >= 0 ? 'naik' : 'turun'}{' '}
                <span className={ihsg.change >= 0 ? 'text-green' : 'text-red'}>{formatPercent(ihsg.changePercent)}</span>.
              </p>
              <p>
                Dari {sectors.length} sektor, <span className="text-green">{totalSectorsUp} sektor</span> menguat
                dan <span className="text-red">{totalSectorsDown} sektor</span> melemah.
                Rasio saham naik vs turun adalah <span className="font-bold">{advDecRatio}:1</span>.
              </p>
              <p>
                Volume perdagangan mencapai {formatNumber(ihsg.volume)} dengan nilai transaksi
                sebesar {formatPrice(ihsg.value)}. Frekuensi tercatat {formatNumber(ihsg.frequency)} kali.
              </p>
            </div>
          </div>

          {/* Key Market Statistics */}
          <div className="terminal-panel">
            <div className="terminal-header">
              <span>📈 KEY STATISTICS</span>
            </div>
            <div className="grid grid-cols-2 gap-0">
              {[
                { label: 'IHSG Level', value: ihsg.price.toFixed(2), color: '' },
                { label: 'Daily Change', value: formatPercent(ihsg.changePercent), color: ihsg.change >= 0 ? 'text-green' : 'text-red' },
                { label: 'Advancers', value: advancers.toString(), color: 'text-green' },
                { label: 'Decliners', value: decliners.toString(), color: 'text-red' },
                { label: 'A/D Ratio', value: advDecRatio, color: '' },
                { label: 'Volume', value: formatNumber(ihsg.volume), color: '' },
                { label: 'Value (Rp)', value: formatPrice(ihsg.value), color: '' },
                { label: 'Frequency', value: formatNumber(ihsg.frequency), color: '' },
              ].map(stat => (
                <div key={stat.label} className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--border)]/50">
                  <span className="text-[10px] font-mono text-[var(--text-dim)]">{stat.label}</span>
                  <span className={cn('text-xs font-mono font-semibold', stat.color || 'text-[var(--text-primary)]')}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: News + Top Stories */}
        <div className="space-y-2">
          {/* News Feed with Sentiment */}
          <div className="terminal-panel h-[300px]">
            <div className="terminal-header">
              <span>📰 NEWS FEED</span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-green">{positiveNews} ↑</span>
                <span className="text-[10px] text-red">{negativeNews} ↓</span>
                <span className="text-[10px] text-[var(--text-dim)]">{neutralNews} →</span>
              </div>
            </div>
            {/* Sentiment tabs */}
            <div className="flex border-b border-[var(--border)]">
              {(['all', 'positive', 'negative'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveNewsTab(tab)}
                  className={cn(
                    'flex-1 px-2 py-1 text-[10px] font-mono transition-colors',
                    activeNewsTab === tab
                      ? 'border-b-2 border-[var(--accent)] text-[var(--text-primary)]'
                      : 'text-[var(--text-dim)] hover:text-[var(--text-primary)]'
                  )}
                >
                  {tab === 'all' ? 'ALL' : tab === 'positive' ? 'POSITIVE' : 'NEGATIVE'}
                </button>
              ))}
            </div>
            <div className="overflow-y-auto h-[calc(100%-60px)]">
              {filteredNews.map(n => (
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
                          <span key={t} className="badge-blue text-[9px] cursor-pointer" onClick={() => setSelectedTicker(t)}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredNews.length === 0 && (
                <div className="p-4 text-center text-[10px] text-[var(--text-dim)]">
                  No news with this sentiment
                </div>
              )}
            </div>
          </div>

          {/* Top Stories Section */}
          <div className="terminal-panel">
            <div className="terminal-header">
              <span>📌 TOP STORIES</span>
            </div>
            <div className="divide-y divide-[var(--border)]/50">
              {topStories.map((story, i) => (
                <div key={i} className="p-3 hover:bg-[var(--bg-hover)]">
                  <div className="flex items-start gap-2">
                    <span className={cn(
                      'mt-0.5 w-1.5 h-1.5 rounded-full shrink-0',
                      story.sentiment === 'positive' ? 'bg-[var(--green)]' :
                      story.sentiment === 'negative' ? 'bg-[var(--red)]' : 'bg-[var(--amber)]'
                    )} />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-[var(--text-primary)] leading-snug">{story.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-[var(--text-dim)]">{story.source}</span>
                        <span className={cn(
                          'text-[9px] px-1 py-0.5 rounded font-mono',
                          story.sentiment === 'positive' ? 'badge-green' :
                          story.sentiment === 'negative' ? 'badge-red' : 'badge-amber'
                        )}>
                          {story.sentiment.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[10px] text-[var(--text-dim)] mt-1 leading-relaxed">{story.summary}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-[10px] text-[var(--text-dim)] font-mono text-center py-1 border-t border-[var(--border)]">
        <span className="mx-2">🟢 Positive sentiment</span>
        <span className="mx-2">🔴 Negative sentiment</span>
        <span className="mx-2">🟡 Neutral sentiment</span>
      </div>
    </div>
  )
}
