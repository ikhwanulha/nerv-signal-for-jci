'use client'
import { useStore } from '@/store/useStore'
import { useEffect, useState, useRef, useCallback } from 'react'
import { cn, formatNumber, formatPercent, formatPrice, calculateRiskReward, signalColor, signalLabel } from '@/lib/utils'
import { TradingSignal } from '@/types'

export function StockDetail() {
  const { selectedTicker, setSelectedTicker, stocks, signals, gainers, losers } = useStore()
  const [chartData, setChartData] = useState<{ time: number; value: number }[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Find the stock from any available source
  const stock = [...stocks, ...gainers, ...losers].find(
    s => s.ticker === selectedTicker
  )

  // Generate mock candle-like chart data
  useEffect(() => {
    if (!selectedTicker) return
    const basePrice = stock?.price || 5000
    const points: { time: number; value: number }[] = []
    let price = basePrice * 0.97
    for (let i = 0; i < 60; i++) {
      const change = (Math.random() - 0.48) * basePrice * 0.02
      price += change
      points.push({
        time: Date.now() - (60 - i) * 3600000,
        value: Math.max(price, basePrice * 0.85),
      })
    }
    setChartData(points)
  }, [selectedTicker, stock?.price])

  // Draw canvas chart
  useEffect(() => {
    if (!canvasRef.current || chartData.length === 0) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    const w = rect.width
    const h = rect.height

    ctx.clearRect(0, 0, w, h)

    const values = chartData.map(d => d.value)
    const min = Math.min(...values) * 0.998
    const max = Math.max(...values) * 1.002
    const range = max - min

    // Draw grid lines
    ctx.strokeStyle = '#1e1e1e'
    ctx.lineWidth = 0.5
    for (let i = 0; i < 5; i++) {
      const y = (h / 5) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()

      // Price labels on right
      const priceVal = max - (range / 5) * i
      ctx.fillStyle = '#555'
      ctx.font = '9px JetBrains Mono'
      ctx.textAlign = 'right'
      ctx.fillText(formatPrice(priceVal), w - 4, y + 10)
    }

    // Draw price line
    const startPrice = values[0]
    const endPrice = values[values.length - 1]
    const isUp = endPrice >= startPrice
    ctx.strokeStyle = isUp ? '#00c853' : '#ff1744'
    ctx.lineWidth = 1.5

    ctx.beginPath()
    chartData.forEach((d, i) => {
      const x = (i / (chartData.length - 1)) * w
      const y = h - ((d.value - min) / range) * (h - 20) - 10
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, h)
    const color = isUp ? 'rgba(0,200,83,0.15)' : 'rgba(255,23,68,0.15)'
    gradient.addColorStop(0, color)
    gradient.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = gradient
    ctx.lineTo(w, h)
    ctx.lineTo(0, h)
    ctx.closePath()
    ctx.fill()
  }, [chartData])

  // Get signals for this stock
  const stockSignals = signals.filter(s => s.ticker === selectedTicker)

  const handleClose = useCallback(() => {
    setSelectedTicker(null)
  }, [setSelectedTicker])

  if (!selectedTicker) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="terminal-panel w-[700px] max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="terminal-header">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-[var(--text-primary)]">
              {selectedTicker}
            </span>
            {stock && (
              <span className="text-xs text-[var(--text-dim)]">{stock.name}</span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="btn-terminal text-[11px] px-2 py-0.5"
          >
            ✕ Close
          </button>
        </div>

        <div className="p-3 space-y-3">
          {stock ? (
            <>
              {/* Price Header */}
              <div className="flex items-end gap-4">
                <div>
                  <span className="text-2xl font-bold font-mono">
                    {formatPrice(stock.price)}
                  </span>
                  <span className={cn(
                    'ml-3 text-sm font-mono font-semibold',
                    stock.change >= 0 ? 'text-green' : 'text-red'
                  )}>
                    {stock.change >= 0 ? '▲' : '▼'} {stock.change.toLocaleString('id-ID')}
                    <span className="ml-1">({formatPercent(stock.changePercent)})</span>
                  </span>
                </div>
              </div>

              {/* Chart */}
              <div className="terminal-panel">
                <div className="terminal-header">
                  <span>PRICE CHART — 60 Periods</span>
                </div>
                <div className="p-1">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-52"
                  />
                </div>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-5 gap-2">
                {[
                  { label: 'Open', value: formatPrice(stock.open) },
                  { label: 'High', value: formatPrice(stock.high) },
                  { label: 'Low', value: formatPrice(stock.low) },
                  { label: 'Volume', value: formatNumber(stock.volume) },
                  { label: 'Market Cap', value: stock.marketCap ? formatPrice(stock.marketCap) : '-' },
                ].map(stat => (
                  <div key={stat.label} className="terminal-panel p-2 text-center">
                    <div className="stat-label">{stat.label}</div>
                    <div className="stat-value text-xs mt-0.5">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Trading Signals */}
              <div className="terminal-panel">
                <div className="terminal-header">
                  <span>TRADING SIGNALS</span>
                  <span className="text-[10px]">{stockSignals.length} signals</span>
                </div>
                {stockSignals.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono">
                      <thead>
                        <tr className="text-[10px] text-[var(--text-dim)] border-b border-[var(--border)]">
                          <th className="text-left px-3 py-1.5 font-medium">Direction</th>
                          <th className="text-right px-3 py-1.5 font-medium">Entry</th>
                          <th className="text-right px-3 py-1.5 font-medium">Stop</th>
                          <th className="text-right px-3 py-1.5 font-medium">TP1</th>
                          <th className="text-right px-3 py-1.5 font-medium">TP2</th>
                          <th className="text-right px-3 py-1.5 font-medium">R:R</th>
                          <th className="text-right px-3 py-1.5 font-medium">Confidence</th>
                          <th className="text-left px-3 py-1.5 font-medium">Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stockSignals.map(s => (
                          <tr key={s.id} className="data-row">
                            <td className="px-3 py-1">
                              <span className="font-semibold" style={{ color: signalColor(s.direction) }}>
                                {signalLabel(s.direction)}
                              </span>
                            </td>
                            <td className="px-3 py-1 text-right">{formatPrice(s.entryPrice)}</td>
                            <td className="px-3 py-1 text-right text-red">{formatPrice(s.stopLoss)}</td>
                            <td className="px-3 py-1 text-right text-green">{formatPrice(s.takeProfit1)}</td>
                            <td className="px-3 py-1 text-right text-green">{formatPrice(s.takeProfit2)}</td>
                            <td className="px-3 py-1 text-right font-semibold">{s.riskReward}:1</td>
                            <td className="px-3 py-1 text-right">
                              <div className="inline-flex items-center gap-1">
                                <span>{s.confidence}%</span>
                                <div className="w-12 h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                                  <div
                                    className={cn(
                                      'h-full rounded-full',
                                      s.confidence >= 70 ? 'bg-green' : s.confidence >= 50 ? 'bg-[var(--amber)]' : 'bg-red'
                                    )}
                                    style={{ width: `${s.confidence}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-1 text-[10px] text-[var(--text-dim)] truncate max-w-[150px]">{s.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-[var(--text-dim)]">
                    No signals available for {selectedTicker}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-6 text-center">
              <p className="text-sm text-[var(--text-dim)] mb-2">Loading stock data for {selectedTicker}...</p>
              <div className="animate-pulse flex justify-center gap-2">
                <span className="w-2 h-2 bg-[var(--accent)] rounded-full" />
                <span className="w-2 h-2 bg-[var(--accent)] rounded-full animation-delay-150" />
                <span className="w-2 h-2 bg-[var(--accent)] rounded-full animation-delay-300" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close */}
      <div className="absolute inset-0 -z-10" onClick={handleClose} />
    </div>
  )
}
