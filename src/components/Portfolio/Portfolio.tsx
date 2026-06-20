'use client'
import { useStore } from '@/store/useStore'
import { useState, useCallback } from 'react'
import { cn, formatPrice, formatPercent, formatNumber, formatDate, calculatePnL } from '@/lib/utils'
import { PortfolioPosition } from '@/types'

const LOTS = 100 // 1 lot = 100 shares

export function Portfolio() {
  const { portfolio, addPosition, removePosition, setSelectedTicker } = useStore()

  // Add position form state
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    ticker: '',
    entryPrice: '',
    lots: '',
    date: new Date().toISOString().split('T')[0],
  })

  const handleAddPosition = useCallback(() => {
    const ticker = formData.ticker.toUpperCase()
    const entryPrice = parseFloat(formData.entryPrice)
    const lots = parseInt(formData.lots)
    if (!ticker || isNaN(entryPrice) || isNaN(lots) || lots <= 0) return

    const position: PortfolioPosition = {
      ticker,
      name: ticker,
      entryPrice,
      quantity: lots * LOTS,
      lots,
      currentPrice: entryPrice,
      entryDate: formData.date,
      trailingActivated: false,
    }
    addPosition(position)
    setFormData({ ticker: '', entryPrice: '', lots: '', date: new Date().toISOString().split('T')[0] })
    setShowForm(false)
  }, [formData, addPosition])

  const totalPnL = portfolio.reduce((sum, p) => sum + calculatePnL(p).pnl, 0)
  const totalValue = portfolio.reduce((sum, p) => sum + p.currentPrice * p.quantity, 0)
  const totalCost = portfolio.reduce((sum, p) => sum + p.entryPrice * p.quantity, 0)
  const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0

  // Pie chart data for positions
  const totalPortfolioValue = portfolio.reduce((sum, p) => sum + p.currentPrice * p.quantity, 0)

  return (
    <div className="p-2 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold font-mono text-[var(--text-primary)]">
            💼 PORTFOLIO TRACKER
          </h1>
          <p className="text-[10px] text-[var(--text-dim)] font-mono">
            IDX position tracker (1 lot = {LOTS} shares)
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={cn('btn-terminal', showForm && 'btn-terminal-active')}
        >
          {showForm ? '✕ Cancel' : '+ Add Position'}
        </button>
      </div>

      {/* Add Position Form */}
      {showForm && (
        <div className="terminal-panel p-3">
          <div className="terminal-header mb-2">
            <span>NEW POSITION</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="stat-label block mb-1">Ticker</label>
              <input
                className="input-terminal"
                placeholder="e.g. BBCA"
                value={formData.ticker}
                onChange={e => setFormData(f => ({ ...f, ticker: e.target.value.toUpperCase() }))}
                maxLength={4}
              />
            </div>
            <div>
              <label className="stat-label block mb-1">Entry Price (Rp)</label>
              <input
                className="input-terminal"
                type="number"
                placeholder="5000"
                value={formData.entryPrice}
                onChange={e => setFormData(f => ({ ...f, entryPrice: e.target.value }))}
              />
            </div>
            <div>
              <label className="stat-label block mb-1">Lots (×{LOTS})</label>
              <input
                className="input-terminal"
                type="number"
                placeholder="1"
                value={formData.lots}
                onChange={e => setFormData(f => ({ ...f, lots: e.target.value }))}
              />
            </div>
            <div>
              <label className="stat-label block mb-1">Date</label>
              <input
                className="input-terminal"
                type="date"
                value={formData.date}
                onChange={e => setFormData(f => ({ ...f, date: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <button onClick={handleAddPosition} className="btn-terminal-active">
              + Add to Portfolio
            </button>
          </div>
        </div>
      )}

      {/* P&L Summary Bar */}
      {portfolio.length > 0 && (
        <div className={cn(
          'terminal-panel p-3 flex items-center justify-between',
          totalPnL >= 0 ? 'border-l-2 border-[var(--green)]' : 'border-l-2 border-[var(--red)]'
        )}>
          <div className="flex items-center gap-6 text-xs font-mono">
            <div>
              <span className="stat-label">Total Value</span>
              <div className="font-semibold text-[var(--text-primary)]">{formatPrice(totalValue)}</div>
            </div>
            <div>
              <span className="stat-label">Total Cost</span>
              <div className="text-[var(--text-primary)]">{formatPrice(totalCost)}</div>
            </div>
            <div>
              <span className="stat-label">Total P&L</span>
              <div className={cn('font-bold text-sm', totalPnL >= 0 ? 'text-green' : 'text-red')}>
                {totalPnL >= 0 ? '+' : ''}{formatPrice(totalPnL)}
              </div>
            </div>
            <div>
              <span className="stat-label">P&L %</span>
              <div className={cn('font-bold text-sm', totalPnLPercent >= 0 ? 'text-green' : 'text-red')}>
                {formatPercent(totalPnLPercent)}
              </div>
            </div>
            <div>
              <span className="stat-label">Positions</span>
              <div className="font-semibold">{portfolio.length}</div>
            </div>
          </div>

          {/* Mini pie chart */}
          <div className="flex items-center gap-2">
            {totalPortfolioValue > 0 && (
              <div className="relative w-10 h-10 rounded-full overflow-hidden" style={{ background: '#111' }}>
                {portfolio.map((p, i) => {
                  const pct = (p.currentPrice * p.quantity / totalPortfolioValue) * 360
                  const colors = ['#00c853', '#2979ff', '#ffab00', '#ff1744', '#aa00ff', '#00bcd4', '#ff6d00', '#76ff03']
                  const color = colors[i % colors.length]
                  // Simple CSS conic gradient for donut
                  return null
                })}
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                  {(() => {
                    let cumulative = 0
                    return portfolio.map((p, i) => {
                      const pct = (p.currentPrice * p.quantity / totalPortfolioValue) * 360
                      const r = 40
                      const x1 = 50 + r * Math.cos((cumulative - 90) * Math.PI / 180)
                      const y1 = 50 + r * Math.sin((cumulative - 90) * Math.PI / 180)
                      const x2 = 50 + r * Math.cos((cumulative + pct - 90) * Math.PI / 180)
                      const y2 = 50 + r * Math.sin((cumulative + pct - 90) * Math.PI / 180)
                      const largeArc = pct > 180 ? 1 : 0
                      const colors = ['#00c853', '#2979ff', '#ffab00', '#ff1744', '#aa00ff', '#00bcd4', '#ff6d00', '#76ff03']
                      const path = pct >= 360
                        ? `M50,10 A40,40 0 1,1 49.99,10 Z`
                        : `M50,50 L${x1},${y1} A40,40 0 ${largeArc},1 ${x2},${y2} Z`
                      cumulative += pct
                      return <path key={i} d={path} fill={colors[i % colors.length]} opacity={0.8} />
                    })
                  })()}
                </svg>
                <div className="absolute inset-2 rounded-full" style={{ background: 'var(--bg-surface)' }} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Portfolio Table */}
      {portfolio.length > 0 ? (
        <div className="terminal-panel">
          <div className="terminal-header">
            <span>POSITIONS</span>
            <span className="text-[10px]">{portfolio.length} positions</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-[10px] text-[var(--text-dim)] border-b border-[var(--border)]">
                  <th className="text-left px-3 py-1.5 font-medium">Ticker</th>
                  <th className="text-right px-3 py-1.5 font-medium">Entry</th>
                  <th className="text-right px-3 py-1.5 font-medium">Current</th>
                  <th className="text-right px-3 py-1.5 font-medium">Qty</th>
                  <th className="text-right px-3 py-1.5 font-medium">Lots</th>
                  <th className="text-right px-3 py-1.5 font-medium">P&L</th>
                  <th className="text-right px-3 py-1.5 font-medium">P&L %</th>
                  <th className="text-right px-3 py-1.5 font-medium">Value</th>
                  <th className="text-right px-3 py-1.5 font-medium">Date</th>
                  <th className="text-center px-3 py-1.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map(p => {
                  const { pnl, pnlPercent } = calculatePnL(p)
                  return (
                    <tr
                      key={p.ticker}
                      className="data-row"
                      onClick={() => setSelectedTicker(p.ticker)}
                    >
                      <td className="px-3 py-1 font-bold text-[var(--text-primary)]">{p.ticker}</td>
                      <td className="px-3 py-1 text-right">{formatPrice(p.entryPrice)}</td>
                      <td className="px-3 py-1 text-right">{formatPrice(p.currentPrice)}</td>
                      <td className="px-3 py-1 text-right">{formatNumber(p.quantity)}</td>
                      <td className="px-3 py-1 text-right">{p.lots}</td>
                      <td className={cn('px-3 py-1 text-right font-semibold', pnl >= 0 ? 'text-green' : 'text-red')}>
                        {pnl >= 0 ? '+' : ''}{formatPrice(pnl)}
                      </td>
                      <td className={cn('px-3 py-1 text-right', pnlPercent >= 0 ? 'text-green' : 'text-red')}>
                        {formatPercent(pnlPercent)}
                      </td>
                      <td className="px-3 py-1 text-right">{formatPrice(p.currentPrice * p.quantity)}</td>
                      <td className="px-3 py-1 text-right text-[var(--text-dim)]">{formatDate(p.entryDate)}</td>
                      <td className="px-3 py-1 text-center">
                        <button
                          onClick={e => { e.stopPropagation(); removePosition(p.ticker) }}
                          className="text-[10px] text-[var(--text-dim)] hover:text-red transition-colors"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="terminal-panel p-8 text-center">
          <div className="text-3xl mb-3">💼</div>
          <p className="text-sm text-[var(--text-dim)] mb-2">No positions in portfolio</p>
          <p className="text-xs text-[var(--text-dim)] mb-4">
            Add your positions to track P&L, visualize allocation, and manage risk
          </p>
          <button onClick={() => setShowForm(true)} className="btn-terminal-active">
            + Add First Position
          </button>
        </div>
      )}

      {/* Legend / Fee Note */}
      {portfolio.length > 0 && (
        <div className="text-[10px] text-[var(--text-dim)] font-mono text-center py-1 border-t border-[var(--border)]">
          <span className="mx-3">1 lot = {LOTS} shares</span>
          <span className="mx-3">IDX broker fee: 0.1-0.3%</span>
          <span className="mx-3">Click row to view stock</span>
        </div>
      )}
    </div>
  )
}
