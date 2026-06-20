'use client'
import { useStore } from '@/store/useStore'
import { useState, useMemo, useCallback } from 'react'
import { cn, formatNumber, formatPercent, formatPrice } from '@/lib/utils'
import { StockQuote, ScreenerFilter } from '@/types'

const SECTORS = [
  'All', 'Financials', 'Energy', 'Consumer Cyclicals', 'Infrastructure',
  'Healthcare', 'Technology', 'Basic Materials', 'Property & Real Estate',
]

export function Screener() {
  const { screenerFilters, setScreenerFilters, setSelectedTicker } = useStore()

  // Filter state
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [changeMin, setChangeMin] = useState('')
  const [changeMax, setChangeMax] = useState('')
  const [volumeMin, setVolumeMin] = useState('')
  const [sector, setSector] = useState('All')
  const [sortBy, setSortBy] = useState<string>('changePercent')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Generate mock stocks for screener
  const mockStocks: StockQuote[] = useMemo(() => {
    const tickers = [
      { t: 'BBCA', n: 'Bank BCA', sec: 'Financials' },
      { t: 'BBRI', n: 'Bank BRI', sec: 'Financials' },
      { t: 'BMRI', n: 'Bank Mandiri', sec: 'Financials' },
      { t: 'TLKM', n: 'Telkom Indonesia', sec: 'Infrastructure' },
      { t: 'GGRM', n: 'Gudang Garam', sec: 'Consumer Cyclicals' },
      { t: 'ASII', n: 'Astra International', sec: 'Consumer Cyclicals' },
      { t: 'UNVR', n: 'Unilever Indonesia', sec: 'Consumer Cyclicals' },
      { t: 'ADRO', n: 'Adaro Energy', sec: 'Energy' },
      { t: 'BYAN', n: 'Bayan Resources', sec: 'Energy' },
      { t: 'INDF', n: 'Indofood Sukses Makmur', sec: 'Consumer Cyclicals' },
      { t: 'HMSP', n: 'HM Sampoerna', sec: 'Consumer Cyclicals' },
      { t: 'KLBF', n: 'Kalbe Farma', sec: 'Healthcare' },
      { t: 'ICBP', n: 'Indofood CBP', sec: 'Consumer Cyclicals' },
      { t: 'CPIN', n: 'Charoen Pokphand', sec: 'Consumer Cyclicals' },
      { t: 'EXCL', n: 'XL Axiata', sec: 'Infrastructure' },
      { t: 'ISAT', n: 'Indosat Ooredoo', sec: 'Infrastructure' },
      { t: 'PGAS', n: 'Perusahaan Gas Negara', sec: 'Energy' },
      { t: 'PTBA', n: 'Bukit Asam', sec: 'Energy' },
      { t: 'SMGR', n: 'Semen Indonesia', sec: 'Basic Materials' },
      { t: 'WSBP', n: 'Waskita Beton', sec: 'Infrastructure' },
    ]
    return tickers.map((t, i) => ({
      ticker: t.t,
      name: t.n,
      price: Math.round(1000 + Math.random() * 49000),
      change: Math.random() > 0.4 ? Math.random() * 1500 : -Math.random() * 1500,
      changePercent: 0,
      volume: Math.round(Math.random() * 50_000_000),
      value: Math.random() * 1e12,
      frequency: Math.random() * 50000,
      open: 5000,
      high: 6000,
      low: 4000,
      previousClose: 5500,
      sector: t.sec,
      marketCap: Math.round(Math.random() * 500_000_000_000_000),
    })).map(s => ({
      ...s,
      changePercent: (s.change / (s.price - s.change)) * 100,
    }))
  }, [])

  const filtered = useMemo(() => {
    let result = [...mockStocks]

    // Apply filters
    if (priceMin) result = result.filter(s => s.price >= parseFloat(priceMin))
    if (priceMax) result = result.filter(s => s.price <= parseFloat(priceMax))
    if (changeMin) result = result.filter(s => s.changePercent >= parseFloat(changeMin))
    if (changeMax) result = result.filter(s => s.changePercent <= parseFloat(changeMax))
    if (volumeMin) result = result.filter(s => s.volume >= parseFloat(volumeMin))
    if (sector && sector !== 'All') result = result.filter(s => s.sector === sector)

    // Sort
    result.sort((a, b) => {
      const av = a[sortBy as keyof StockQuote] as number
      const bv = b[sortBy as keyof StockQuote] as number
      return sortOrder === 'desc' ? bv - av : av - bv
    })

    return result
  }, [mockStocks, priceMin, priceMax, changeMin, changeMax, volumeMin, sector, sortBy, sortOrder])

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(o => o === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const handleApply = useCallback(() => {
    const filters: ScreenerFilter = {}
    if (priceMin) filters.priceMin = parseFloat(priceMin)
    if (priceMax) filters.priceMax = parseFloat(priceMax)
    if (changeMin) filters.changeMin = parseFloat(changeMin)
    if (changeMax) filters.changeMax = parseFloat(changeMax)
    if (volumeMin) filters.volumeMin = parseFloat(volumeMin)
    if (sector && sector !== 'All') filters.sector = sector
    filters.sortBy = sortBy
    filters.sortOrder = sortOrder
    setScreenerFilters(filters)
  }, [priceMin, priceMax, changeMin, changeMax, volumeMin, sector, sortBy, sortOrder, setScreenerFilters])

  const handleClear = useCallback(() => {
    setPriceMin('')
    setPriceMax('')
    setChangeMin('')
    setChangeMax('')
    setVolumeMin('')
    setSector('All')
    setSortBy('changePercent')
    setSortOrder('desc')
    setScreenerFilters({})
  }, [setScreenerFilters])

  const sortArrow = (field: string) => {
    if (sortBy !== field) return ' ↕'
    return sortOrder === 'desc' ? ' ▼' : ' ▲'
  }

  return (
    <div className="p-2 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold font-mono text-[var(--text-primary)]">
            🔍 STOCK SCREENER
          </h1>
          <p className="text-[10px] text-[var(--text-dim)] font-mono">
            Filter and sort IDX stocks
          </p>
        </div>
        <span className="text-[10px] text-[var(--text-dim)] font-mono">
          {filtered.length} results
        </span>
      </div>

      {/* Filter Row */}
      <div className="terminal-panel p-3">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <div>
            <label className="stat-label block mb-0.5">Price Min</label>
            <input
              className="input-terminal"
              type="number"
              placeholder="Min"
              value={priceMin}
              onChange={e => setPriceMin(e.target.value)}
            />
          </div>
          <div>
            <label className="stat-label block mb-0.5">Price Max</label>
            <input
              className="input-terminal"
              type="number"
              placeholder="Max"
              value={priceMax}
              onChange={e => setPriceMax(e.target.value)}
            />
          </div>
          <div>
            <label className="stat-label block mb-0.5">Chg % Min</label>
            <input
              className="input-terminal"
              type="number"
              placeholder="Min %"
              value={changeMin}
              onChange={e => setChangeMin(e.target.value)}
            />
          </div>
          <div>
            <label className="stat-label block mb-0.5">Chg % Max</label>
            <input
              className="input-terminal"
              type="number"
              placeholder="Max %"
              value={changeMax}
              onChange={e => setChangeMax(e.target.value)}
            />
          </div>
          <div>
            <label className="stat-label block mb-0.5">Vol Min</label>
            <input
              className="input-terminal"
              type="number"
              placeholder="Min volume"
              value={volumeMin}
              onChange={e => setVolumeMin(e.target.value)}
            />
          </div>
          <div>
            <label className="stat-label block mb-0.5">Sector</label>
            <select
              className="input-terminal"
              value={sector}
              onChange={e => setSector(e.target.value)}
            >
              {SECTORS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-3">
          <button onClick={handleClear} className="btn-terminal">
            Clear
          </button>
          <button onClick={handleApply} className="btn-terminal-active">
            Apply Filters
          </button>
        </div>
      </div>

      {/* Results Table */}
      {filtered.length > 0 ? (
        <div className="terminal-panel">
          <div className="terminal-header">
            <span>RESULTS</span>
            <span className="text-[10px]">{filtered.length} of {mockStocks.length} stocks</span>
          </div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-[10px] text-[var(--text-dim)] border-b border-[var(--border)] sticky top-0 bg-[var(--bg-surface)]">
                  <th className="text-left px-3 py-1.5 font-medium cursor-pointer hover:text-[var(--text-primary)]" onClick={() => handleSort('ticker')}>
                    Ticker{sortArrow('ticker')}
                  </th>
                  <th className="text-left px-3 py-1.5 font-medium">Name</th>
                  <th className="text-right px-3 py-1.5 font-medium cursor-pointer hover:text-[var(--text-primary)]" onClick={() => handleSort('price')}>
                    Price{sortArrow('price')}
                  </th>
                  <th className="text-right px-3 py-1.5 font-medium cursor-pointer hover:text-[var(--text-primary)]" onClick={() => handleSort('changePercent')}>
                    Change%{sortArrow('changePercent')}
                  </th>
                  <th className="text-right px-3 py-1.5 font-medium cursor-pointer hover:text-[var(--text-primary)]" onClick={() => handleSort('volume')}>
                    Volume{sortArrow('volume')}
                  </th>
                  <th className="text-left px-3 py-1.5 font-medium cursor-pointer hover:text-[var(--text-primary)]" onClick={() => handleSort('marketCap')}>
                    Sector{sortArrow('sector')}
                  </th>
                  <th className="text-right px-3 py-1.5 font-medium cursor-pointer hover:text-[var(--text-primary)]" onClick={() => handleSort('marketCap')}>
                    Market Cap{sortArrow('marketCap')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr
                    key={s.ticker}
                    className="data-row"
                    onClick={() => setSelectedTicker(s.ticker)}
                  >
                    <td className="px-3 py-1 font-bold text-[var(--text-primary)]">{s.ticker}</td>
                    <td className="px-3 py-1 text-[var(--text-dim)] truncate max-w-[180px]">{s.name}</td>
                    <td className="px-3 py-1 text-right font-medium">{formatPrice(s.price)}</td>
                    <td className={cn('px-3 py-1 text-right font-medium', s.changePercent >= 0 ? 'text-green' : 'text-red')}>
                      {formatPercent(s.changePercent)}
                    </td>
                    <td className="px-3 py-1 text-right text-[var(--text-dim)]">{formatNumber(s.volume)}</td>
                    <td className="px-3 py-1 text-[var(--text-dim)]">{s.sector}</td>
                    <td className="px-3 py-1 text-right text-[var(--text-dim)]">{formatPrice(s.marketCap || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="terminal-panel p-8 text-center">
          <div className="text-3xl mb-3">🔍</div>
          <p className="text-sm text-[var(--text-dim)] mb-2">No stocks match your filters</p>
          <p className="text-xs text-[var(--text-dim)]">
            Try expanding your price range, volume threshold, or select a different sector
          </p>
        </div>
      )}

      {/* Hint */}
      <div className="text-[10px] text-[var(--text-dim)] font-mono text-center py-1">
        <span className="mx-2">Click column header to sort</span>
        <span className="mx-2">Click row to view stock</span>
      </div>
    </div>
  )
}
