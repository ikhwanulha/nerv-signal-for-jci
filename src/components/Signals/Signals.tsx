'use client'
import { useState, useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { useSignals } from '@/lib/api'
import { cn, signalColor, signalLabel, getSignalBadge, formatPrice } from '@/lib/utils'
import { TradingSignal, SignalDirection } from '@/types'
import toast from 'react-hot-toast'

export function Signals() {
  const { setSelectedTicker } = useStore()
  const { data: signals, isLoading } = useSignals()
  const [filter, setFilter] = useState<SignalDirection | 'ALL'>('ALL')
  const [hoveredSignal, setHoveredSignal] = useState<string | null>(null)

  const filtered = useMemo(() => 
    filter === 'ALL' ? (signals || []) : (signals || []).filter(s => s.direction === filter),
    [signals, filter]
  )

  const filters = ['ALL', 'STRONG_BUY', 'BUY', 'NEUTRAL', 'SELL', 'STRONG_SELL'] as const
  
  const handleSignalClick = (signal: TradingSignal) => {
    setSelectedTicker(signal.ticker)
    toast(
      `${signal.direction} ${signal.ticker} @ Rp${signal.entryPrice.toLocaleString('id-ID')} | SL: ${signal.stopLoss} | TP1: ${signal.takeProfit1}`,
      { icon: signal.direction.includes('BUY') ? '🟢' : '🔴' }
    )
  }

  return (
    <div className="p-2 space-y-2">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold font-mono">🔄 TRADING SIGNALS</h1>
        <span className="text-xs font-mono text-[var(--text-dim)]">
          {signals?.length || 0} signals · Auto-refresh 15s
        </span>
      </div>

      {/* Filter bar */}
      <div className="flex gap-1 flex-wrap">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1 text-xs font-mono rounded transition-colors',
              filter === f 
                ? 'bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30'
                : 'text-[var(--text-dim)] border border-transparent hover:text-[var(--text-primary)]'
            )}>
            {f === 'ALL' ? 'All' : f === 'STRONG_BUY' ? '🟢 Strong Buy' : f === 'BUY' ? '🟢 Buy' : f === 'NEUTRAL' ? '🟡 Neutral' : f === 'SELL' ? '🔴 Sell' : '🔴 Strong Sell'}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="text-center py-8 text-[var(--text-dim)] font-mono text-xs">Loading signals...</div>
      )}

      {/* Signal cards grid */}
      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-8 text-[var(--text-dim)] font-mono text-xs">No signals match the current filter</div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {filtered.map(signal => {
          const confidence = getSignalBadge(signal.confidence)
          return (
            <div 
              key={signal.id}
              className={cn(
                'terminal-panel cursor-pointer transition-all hover:scale-[1.01]',
                hoveredSignal === signal.id && 'ring-1 ring-[var(--accent)]'
              )}
              onClick={() => handleSignalClick(signal)}
              onMouseEnter={() => setHoveredSignal(signal.id)}
              onMouseLeave={() => setHoveredSignal(null)}
            >
              {/* Signal header */}
              <div className="terminal-header">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{signal.ticker}</span>
                  <span className="text-[10px] text-[var(--text-dim)]">{signal.name}</span>
                </div>
                <span 
                  className="px-2 py-0.5 text-[10px] font-bold rounded"
                  style={{ 
                    background: `${signalColor(signal.direction)}20`,
                    color: signalColor(signal.direction),
                    border: `1px solid ${signalColor(signal.direction)}40`
                  }}
                >
                  {signalLabel(signal.direction)}
                </span>
              </div>

              <div className="p-3 space-y-2">
                {/* Price levels */}
                <div className="grid grid-cols-4 gap-2 text-[10px] font-mono text-center">
                  <div className="card-stats p-1.5">
                    <div className="text-[var(--text-dim)]">Entry</div>
                    <div className="font-bold text-sm">Rp{signal.entryPrice.toLocaleString('id-ID')}</div>
                  </div>
                  <div className="card-stats p-1.5">
                    <div className="text-[var(--text-dim)]">Stop Loss</div>
                    <div className="font-bold text-sm text-red">
                      Rp{signal.stopLoss.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div className="card-stats p-1.5">
                    <div className="text-[var(--text-dim)]">TP1</div>
                    <div className="font-bold text-sm text-green">
                      Rp{signal.takeProfit1.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div className="card-stats p-1.5">
                    <div className="text-[var(--text-dim)]">TP2</div>
                    <div className="font-bold text-sm text-green/80">
                      Rp{signal.takeProfit2.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>

                {/* R:R & Confidence */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono text-[var(--text-dim)]">R:R</span>
                    <span className="text-sm font-mono font-bold">1:{signal.riskReward}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-1">
                    <span className="text-[10px] font-mono text-[var(--text-dim)]">Confidence</span>
                    <div className="flex-1 h-2 rounded-full bg-[var(--bg-primary)] overflow-hidden max-w-24">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${signal.confidence}%`,
                          background: signal.confidence >= 85 ? 'var(--green)' : signal.confidence >= 70 ? 'var(--amber)' : 'var(--red-dim)'
                        }}
                      />
                    </div>
                    <span className={cn(
                      'text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded',
                      confidence.label === 'HIGH' ? 'badge-green' : confidence.label === 'MEDIUM' ? 'badge-amber' : 'text-[var(--red)] bg-[var(--red)]/10'
                    )}>
                      {signal.confidence}%
                    </span>
                  </div>
                </div>

                {/* Indicators */}
                <div className="grid grid-cols-4 gap-1 text-[10px] font-mono">
                  <div><span className="text-[var(--text-dim)]">RSI: </span>{signal.indicators.rsi.toFixed(1)}</div>
                  <div><span className="text-[var(--text-dim)]">MACD: </span>{signal.indicators.macd}</div>
                  <div><span className="text-[var(--text-dim)]">MA: </span>{signal.indicators.ma}</div>
                  <div><span className="text-[var(--text-dim)]">BB: </span>{signal.indicators.bollinger}</div>
                </div>

                {/* Reason */}
                <div className="text-[10px] font-mono text-[var(--text-dim)] leading-relaxed p-2 rounded bg-[var(--bg-primary)]">
                  {signal.reason}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="text-[10px] text-[var(--text-dim)] font-mono text-center py-1">
        Auto-generated every 15s from real-time price data · Click signal to see stock detail
      </div>
    </div>
  )
}
