'use client'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import { useSectors } from '@/lib/api'

export function Heatmap() {
  const { data: sectors } = useSectors()
  const { setSelectedTicker } = useStore()

  if (!sectors) return <div className="p-8 text-center text-xs font-mono text-[var(--text-dim)]">Loading sector data...</div>

  // Generate heatmap cells per sector with company breakdowns
  const cells = useMemo(() => {
    if (!sectors) return {}
    const sectorCompanies: Record<string, { ticker: string; name: string; marketCap: number; changePercent: number }[]> = {
      'Financials': [
        { ticker: 'BBCA', name: 'BCA', marketCap: 1_200_000_000_000_000, changePercent: 0.74 },
        { ticker: 'BBRI', name: 'BRI', marketCap: 800_000_000_000_000, changePercent: 0.87 },
        { ticker: 'BMRI', name: 'Mandiri', marketCap: 600_000_000_000_000, changePercent: 1.2 },
      ],
      'Energy': [
        { ticker: 'ADRO', name: 'Adaro', marketCap: 150_000_000_000_000, changePercent: -2.34 },
        { ticker: 'BYAN', name: 'Bayan', marketCap: 350_000_000_000_000, changePercent: -1.32 },
        { ticker: 'PGAS', name: 'Perusahaan Gas', marketCap: 80_000_000_000_000, changePercent: 0.5 },
      ],
      'Consumer': [
        { ticker: 'UNVR', name: 'Unilever', marketCap: 180_000_000_000_000, changePercent: -1.72 },
        { ticker: 'GGRM', name: 'Gudang Garam', marketCap: 90_000_000_000_000, changePercent: 2.11 },
        { ticker: 'ICBP', name: 'Indofood CBP', marketCap: 120_000_000_000_000, changePercent: 1.15 },
      ],
      'Telecommunications': [
        { ticker: 'TLKM', name: 'Telkom', marketCap: 400_000_000_000_000, changePercent: -0.63 },
        { ticker: 'EXCL', name: 'XL Axiata', marketCap: 50_000_000_000_000, changePercent: 2.35 },
      ],
      'Healthcare': [
        { ticker: 'KLBF', name: 'Kalbe Farma', marketCap: 80_000_000_000_000, changePercent: 1.56 },
      ],
      'Automotive': [
        { ticker: 'ASII', name: 'Astra', marketCap: 250_000_000_000_000, changePercent: 1.63 },
      ],
    }
    return sectorCompanies
  }, [])

  const getIntensity = (changePercent: number): string => {
    const abs = Math.abs(changePercent)
    if (changePercent >= 0) {
      if (abs >= 3) return 'bg-[var(--green)] opacity-90'
      if (abs >= 2) return 'bg-[var(--green)] opacity-70'
      if (abs >= 1) return 'bg-[var(--green)] opacity-50'
      if (abs >= 0.5) return 'bg-[var(--green)] opacity-30'
      return 'bg-[var(--green)] opacity-15'
    } else {
      if (abs >= 3) return 'bg-[var(--red)] opacity-90'
      if (abs >= 2) return 'bg-[var(--red)] opacity-70'
      if (abs >= 1) return 'bg-[var(--red)] opacity-50'
      if (abs >= 0.5) return 'bg-[var(--red)] opacity-30'
      return 'bg-[var(--red)] opacity-15'
    }
  }

  return (
    <div className="p-2 space-y-2">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold font-mono">🗺 SECTOR HEATMAP</h1>
        <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--text-dim)]">
          <span className="w-3 h-3 rounded bg-[var(--green)] opacity-30" /> Weak +
          <span className="w-3 h-3 rounded bg-[var(--green)] opacity-70" /> Medium +
          <span className="w-3 h-3 rounded bg-[var(--green)] opacity-90" /> Strong +
          <span className="w-3 h-3 rounded bg-[var(--red)] opacity-30 ml-2" /> Weak -
          <span className="w-3 h-3 rounded bg-[var(--red)] opacity-90" /> Strong -
        </div>
      </div>

      {/* Sector tiles */}
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(cells).map(([sector, companies]) => {
          const avgChange = companies.reduce((a, c) => a + c.changePercent, 0) / companies.length
          return (
            <div key={sector} className="terminal-panel">
              <div className={cn(
                'terminal-header',
                avgChange >= 0 ? 'border-l-2 border-l-[var(--green)]' : 'border-l-2 border-l-[var(--red)]'
              )}>
                <span>{sector}</span>
                <span className={avgChange >= 0 ? 'text-green' : 'text-red'}>
                  {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(2)}%
                </span>
              </div>
              <div className="grid grid-cols-1 gap-1 p-2">
                {companies.map(company => (
                  <div
                    key={company.ticker}
                    className={cn(
                      'p-2 rounded cursor-pointer transition-all hover:scale-[1.02] border border-transparent hover:border-[var(--border-light)]',
                      getIntensity(company.changePercent)
                    )}
                    onClick={() => setSelectedTicker(company.ticker)}
                    style={{ fontSize: `${Math.max(11, Math.min(16, 10 + Math.log10(company.marketCap) / 2))}px` }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold font-mono text-sm">{company.ticker}</span>
                        <span className="text-[10px] text-[var(--text-dim)] ml-1">{company.name}</span>
                      </div>
                      <span className={cn('font-mono font-bold', company.changePercent >= 0 ? 'text-green' : 'text-red')}>
                        {company.changePercent >= 0 ? '+' : ''}{company.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
