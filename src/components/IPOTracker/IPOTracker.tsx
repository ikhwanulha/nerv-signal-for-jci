'use client'
import { useState, useMemo } from 'react'
import { cn, formatNumber, formatPercent } from '@/lib/utils'
import { IPOData } from '@/types'

const ipoData: IPOData[] = [
  { ticker: 'AMMN', name: 'Amman Mineral', sector: 'Energy', offeringPrice: 2000, currentPrice: 3200, sharesOffered: 5_000_000_000, proceeds: 10_000_000_000_000, listingDate: '2025-06-15', status: 'current', subscriptionRate: 18.5, returnPercent: 60 },
  { ticker: 'DCII', name: 'DCI Indonesia', sector: 'Technology', offeringPrice: 5000, currentPrice: 7800, sharesOffered: 500_000_000, proceeds: 2_500_000_000_000, listingDate: '2025-06-01', status: 'current', subscriptionRate: 25.2, returnPercent: 56 },
  { ticker: 'BREN', name: 'Barito Renewables', sector: 'Energy', offeringPrice: 1500, currentPrice: 2850, sharesOffered: 3_000_000_000, proceeds: 4_500_000_000_000, listingDate: '2025-05-20', status: 'completed', subscriptionRate: 45.8, returnPercent: 90 },
  { ticker: 'CUAN', name: 'Petro Energy', sector: 'Energy', offeringPrice: 3500, currentPrice: 4100, sharesOffered: 1_000_000_000, proceeds: 3_500_000_000_000, listingDate: '2025-05-10', status: 'completed', subscriptionRate: 12.3, returnPercent: 17.1 },
  { ticker: 'NFSS', name: 'Nusantara Sejahtera', sector: 'Infrastructure', offeringPrice: 1200, currentPrice: 950, sharesOffered: 2_000_000_000, proceeds: 2_400_000_000_000, listingDate: '2025-07-15', status: 'upcoming', subscriptionRate: undefined, returnPercent: undefined },
  { ticker: 'TRON', name: 'Teknologi Digital', sector: 'Technology', offeringPrice: 2500, currentPrice: undefined, sharesOffered: 800_000_000, proceeds: 2_000_000_000_000, listingDate: '2025-08-01', status: 'upcoming', subscriptionRate: undefined, returnPercent: undefined },
]

export function IPOTracker() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'current' | 'completed'>('all')

  const filtered = useMemo(() => 
    statusFilter === 'all' ? ipoData : ipoData.filter(ipo => ipo.status === statusFilter),
    [statusFilter]
  )

  return (
    <div className="p-2 space-y-2">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold font-mono">🚀 IPO TRACKER</h1>
        <div className="flex gap-1">
          {(['all', 'upcoming', 'current', 'completed'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-1 text-xs font-mono rounded transition-colors',
                statusFilter === s 
                  ? 'bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30' 
                  : 'text-[var(--text-dim)] border border-transparent'
              )}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-2">
        <div className="card-stats">
          <div className="stat-label">Total IPOs</div>
          <div className="stat-value mt-1">{ipoData.length}</div>
        </div>
        <div className="card-stats">
          <div className="stat-label">Avg Return</div>
          <div className="stat-value mt-1 text-green">
            {ipoData.filter(i => i.returnPercent).length > 0 
              ? '+' + (ipoData.filter(i => i.returnPercent).reduce((a, i) => a + (i.returnPercent || 0), 0) / ipoData.filter(i => i.returnPercent).length).toFixed(1) + '%' 
              : '-'}
          </div>
        </div>
        <div className="card-stats">
          <div className="stat-label">Total Raised</div>
          <div className="stat-value mt-1 text-sm">{formatNumber(ipoData.reduce((a, i) => a + i.proceeds, 0))}</div>
        </div>
        <div className="card-stats">
          <div className="stat-label">Upcoming</div>
          <div className="stat-value mt-1 text-amber">{ipoData.filter(i => i.status === 'upcoming').length}</div>
        </div>
      </div>

      {/* Table */}
      <div className="terminal-panel">
        <div className="terminal-header"><span>IPO LIST</span></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-[10px] text-[var(--text-dim)] border-b border-[var(--border)]">
                <th className="text-left px-3 py-1.5">Ticker</th>
                <th className="text-left px-3 py-1.5">Name</th>
                <th className="text-left px-3 py-1.5">Sector</th>
                <th className="text-right px-3 py-1.5">IPO Price</th>
                <th className="text-right px-3 py-1.5">Current</th>
                <th className="text-right px-3 py-1.5">Return</th>
                <th className="text-left px-3 py-1.5">Listing Date</th>
                <th className="text-left px-3 py-1.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(ipo => (
                <tr key={ipo.ticker} className="data-row">
                  <td className="px-3 py-1 font-bold">{ipo.ticker}</td>
                  <td className="px-3 py-1 text-[var(--text-dim)]">{ipo.name}</td>
                  <td className="px-3 py-1 text-[var(--text-dim)]">{ipo.sector}</td>
                  <td className="px-3 py-1 text-right">Rp{ipo.offeringPrice.toLocaleString('id-ID')}</td>
                  <td className="px-3 py-1 text-right">
                    {ipo.currentPrice ? `Rp${ipo.currentPrice.toLocaleString('id-ID')}` : '-'}
                  </td>
                  <td className={cn('px-3 py-1 text-right font-medium',
                    ipo.returnPercent && ipo.returnPercent > 0 ? 'text-green' : ipo.returnPercent && ipo.returnPercent < 0 ? 'text-red' : ''
                  )}>
                    {ipo.returnPercent ? formatPercent(ipo.returnPercent) : '-'}
                  </td>
                  <td className="px-3 py-1 text-[var(--text-dim)]">{ipo.listingDate}</td>
                  <td className="px-3 py-1">
                    <span className={cn(
                      'px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded',
                      ipo.status === 'upcoming' ? 'badge-blue' : ipo.status === 'current' ? 'badge-green' : 'text-[var(--text-dim)] bg-[var(--bg-elevated)]'
                    )}>
                      {ipo.status === 'upcoming' ? 'UPCOMING' : ipo.status === 'current' ? 'TRADING' : 'LISTED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
