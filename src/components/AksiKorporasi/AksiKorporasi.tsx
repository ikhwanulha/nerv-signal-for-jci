'use client'
import { useStore } from '@/store/useStore'
import { useState, useMemo } from 'react'
import { cn, formatPrice, formatDate } from '@/lib/utils'
import { CorporateAction } from '@/types'

const ACTION_TYPES = ['all', 'dividend', 'stock_split', 'rights', 'buyback', 'rups'] as const
const ACTION_LABELS: Record<string, string> = {
  all: 'ALL',
  dividend: 'Dividend',
  stock_split: 'Stock Split',
  rights: 'Rights Issue',
  buyback: 'Buyback',
  rups: 'RUPS',
}

const ACTION_COLORS: Record<string, string> = {
  dividend: 'badge-green',
  stock_split: 'badge-blue',
  rights: 'badge-amber',
  buyback: 'badge-red',
  rups: 'badge-blue',
}

export function AksiKorporasi() {
  const { setSelectedTicker } = useStore()
  const [filterType, setFilterType] = useState<string>('all')
  const actions: CorporateAction[] = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    return [
      { id: 'ca1', ticker: 'BBCA', name: 'Bank BCA', type: 'dividend', date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-15`, description: 'Dividen Tunai Rp 250 per saham', value: 250 },
      { id: 'ca2', ticker: 'BBRI', name: 'Bank BRI', type: 'dividend', date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-20`, description: 'Dividen Tunai Rp 180 per saham', value: 180 },
      { id: 'ca3', ticker: 'TLKM', name: 'Telkom Indonesia', type: 'dividend', date: `${currentYear}-${String(currentMonth + 2).padStart(2, '0')}-05`, description: 'Dividen Final Rp 120 per saham', value: 120 },
      { id: 'ca4', ticker: 'ASII', name: 'Astra International', type: 'stock_split', date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-28`, description: 'Stock Split 1:5', ratio: '1:5' },
      { id: 'ca5', ticker: 'ADRO', name: 'Adaro Energy', type: 'rights', date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-10`, description: 'HMETD dengan rasio 2:1', ratio: '2:1' },
      { id: 'ca6', ticker: 'GGRM', name: 'Gudang Garam', type: 'buyback', date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-25`, description: 'Buyback saham hingga Rp 1 triliun', value: 1_000_000_000_000 },
      { id: 'ca7', ticker: 'UNVR', name: 'Unilever Indonesia', type: 'rups', date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-30`, description: 'RUPS Tahunan & Luar Biasa' },
      { id: 'ca8', ticker: 'BMRI', name: 'Bank Mandiri', type: 'dividend', date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-12`, description: 'Dividen Tunai Rp 200 per saham', value: 200 },
      { id: 'ca9', ticker: 'HMSP', name: 'HM Sampoerna', type: 'dividend', date: `${currentYear}-${String(currentMonth + 3).padStart(2, '0')}-08`, description: 'Dividen Interim Rp 90 per saham', value: 90 },
      { id: 'ca10', ticker: 'INDF', name: 'Indofood Sukses Makmur', type: 'rights', date: `${currentYear}-${String(currentMonth + 2).padStart(2, '0')}-15`, description: 'HMETD dengan rasio 5:2', ratio: '5:2' },
    ]
  }, [])

  const filtered = filterType === 'all'
    ? actions
    : actions.filter(a => a.type === filterType)

  // Group by month
  const groupedByMonth = useMemo(() => {
    const groups: Record<string, CorporateAction[]> = {}
    filtered.forEach(a => {
      const d = new Date(a.date)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      if (!groups[key]) groups[key] = []
      groups[key].push(a)
    })
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
  }, [filtered])

  const typeLabels: Record<string, string> = ACTION_LABELS

  return (
    <div className="p-2 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold font-mono text-[var(--text-primary)]">
            📋 AKSI KORPORASI
          </h1>
          <p className="text-[10px] text-[var(--text-dim)] font-mono">
            Corporate actions calendar for IDX
          </p>
        </div>
        <span className="text-[10px] text-[var(--text-dim)] font-mono">
          {filtered.length} events
        </span>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-1 flex-wrap">
        {ACTION_TYPES.map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={cn(
              'px-2.5 py-1 text-[10px] font-mono rounded border transition-colors',
              filterType === t
                ? 'bg-[var(--bg-elevated)] border-[var(--accent)] text-[var(--accent)]'
                : 'bg-transparent border-[var(--border-light)] text-[var(--text-dim)] hover:text-[var(--text-primary)]'
            )}
          >
            {ACTION_LABELS[t]}
            <span className="ml-1 text-[9px] opacity-60">
              ({t === 'all' ? actions.length : actions.filter(a => a.type === t).length})
            </span>
          </button>
        ))}
      </div>

      {/* Grouped by month */}
      {groupedByMonth.length > 0 ? (
        <div className="space-y-3">
          {groupedByMonth.map(([monthKey, monthActions]) => {
            const [year, month] = monthKey.split('-')
            const monthDate = new Date(parseInt(year), parseInt(month))
            const monthName = monthDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

            return (
              <div key={monthKey} className="terminal-panel">
                <div className="terminal-header">
                  <span>{monthName.toUpperCase()}</span>
                  <span className="text-[10px]">{monthActions.length} events</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="text-[10px] text-[var(--text-dim)] border-b border-[var(--border)]">
                        <th className="text-left px-3 py-1.5 font-medium">Date</th>
                        <th className="text-left px-3 py-1.5 font-medium">Ticker</th>
                        <th className="text-left px-3 py-1.5 font-medium">Name</th>
                        <th className="text-center px-3 py-1.5 font-medium">Type</th>
                        <th className="text-left px-3 py-1.5 font-medium">Description</th>
                        <th className="text-right px-3 py-1.5 font-medium">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthActions.map(ca => (
                        <tr
                          key={ca.id}
                          className="data-row"
                          onClick={() => setSelectedTicker(ca.ticker)}
                        >
                          <td className="px-3 py-1 text-[var(--text-dim)]">
                            {new Date(ca.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </td>
                          <td className="px-3 py-1 font-bold text-[var(--text-primary)]">{ca.ticker}</td>
                          <td className="px-3 py-1 text-[var(--text-dim)] truncate max-w-[150px]">{ca.name}</td>
                          <td className="px-3 py-1 text-center">
                            <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded', ACTION_COLORS[ca.type] || 'badge-blue')}>
                              {typeLabels[ca.type] || ca.type}
                            </span>
                          </td>
                          <td className="px-3 py-1 text-[var(--text-dim)] max-w-[250px] truncate">{ca.description}</td>
                          <td className="px-3 py-1 text-right text-[var(--text-dim)]">
                            {ca.value ? formatPrice(ca.value) : ca.ratio || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="terminal-panel p-8 text-center">
          <div className="text-3xl mb-3">📋</div>
          <p className="text-sm text-[var(--text-dim)] mb-2">No corporate actions found</p>
          <p className="text-xs text-[var(--text-dim)]">
            {filterType !== 'all' ? 'No events for this type. Try a different filter.' : 'No upcoming corporate actions.'}
          </p>
          {filterType !== 'all' && (
            <button onClick={() => setFilterType('all')} className="btn-terminal mt-3">
              Show All Types
            </button>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="terminal-panel p-2">
        <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-[var(--text-dim)] flex-wrap">
          <span><span className="badge-green mr-1">●</span> Dividend</span>
          <span><span className="badge-blue mr-1">●</span> Stock Split</span>
          <span><span className="badge-amber mr-1">●</span> Rights Issue</span>
          <span><span className="badge-red mr-1">●</span> Buyback</span>
          <span><span className="badge-blue mr-1">●</span> RUPS</span>
        </div>
      </div>
    </div>
  )
}
