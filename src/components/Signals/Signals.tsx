'use client'
import { useStore } from '@/store/useStore'
import { useState, useCallback } from 'react'
import { cn, formatPrice, signalColor, signalLabel } from '@/lib/utils'
import { SignalDirection } from '@/types'

const DIRECTION_FILTERS: (SignalDirection | 'ALL')[] = ['ALL', 'STRONG_BUY', 'BUY', 'NEUTRAL', 'SELL', 'STRONG_SELL']

export function Signals() {
  const { signals, generateSignals, setSelectedTicker, loading } = useStore()
  const [filter, setFilter] = useState<SignalDirection | 'ALL'>('ALL')
  const [generating, setGenerating] = useState(false)

  const filteredSignals = filter === 'ALL'
    ? signals
    : signals.filter(s => s.direction === filter)

  const handleGenerate = useCallback(async () => {
    setGenerating(true)
    useStore.getState().setLoading('signals', true)
    // Simulate async generation
    await new Promise(r => setTimeout(r, 800))
    generateSignals()
    useStore.getState().setLoading('signals', false)
    setGenerating(false)
  }, [generateSignals])

  const signalCounts = {
    ALL: signals.length,
    STRONG_BUY: signals.filter(s => s.direction === 'STRONG_BUY').length,
    BUY: signals.filter(s => s.direction === 'BUY').length,
    NEUTRAL: signals.filter(s => s.direction === 'NEUTRAL').length,
    SELL: signals.filter(s => s.direction === 'SELL').length,
    STRONG_SELL: signals.filter(s => s.direction === 'STRONG_SELL').length,
  }

  return (
    <div className="p-2 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold font-mono text-[var(--text-primary)]">
            🔄 TRADING SIGNALS
          </h1>
          <p className="text-[10px] text-[var(--text-dim)] font-mono">
            Technical analysis signals generated from multi-indicator framework
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[var(--text-dim)] font-mono">
            {signals.length} signals
          </span>
          <button
            onClick={handleGenerate}
            disabled={generating || loading['signals']}
            className="btn-terminal-active"
          >
            {generating || loading['signals'] ? '⏳ Scanning...' : '🎯 Generate Signals'}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-1 flex-wrap">
        {DIRECTION_FILTERS.map(d => (
          <button
            key={d}
            onClick={() => setFilter(d)}
            className={cn(
              'px-2.5 py-1 text-[10px] font-mono rounded border transition-colors',
              filter === d
                ? 'bg-[var(--bg-elevated)] border-[var(--accent)] text-[var(--accent)]'
                : 'bg-transparent border-[var(--border-light)] text-[var(--text-dim)] hover:text-[var(--text-primary)]'
            )}
          >
            {d === 'ALL' ? 'ALL' : signalLabel(d as SignalDirection)}
            <span className="ml-1 opacity-60">({signalCounts[d]})</span>
          </button>
        ))}
      </div>

      {/* Signal Grid */}
      {filteredSignals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
          {filteredSignals.map(s => (
            <div
              key={s.id}
              className="terminal-panel scan-line cursor-pointer hover:border-[var(--accent)]/30 transition-colors"
              onClick={() => setSelectedTicker(s.ticker)}
            >
              {/* Card Header */}
              <div className="terminal-header">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[var(--text-primary)]">{s.ticker}</span>
                  <span className="text-[10px] text-[var(--text-dim)]">{s.name}</span>
                </div>
                <span className={cn(
                  'px-2 py-0.5 text-[10px] font-bold rounded',
                )}
                  style={{
                    background: `${signalColor(s.direction)}20`,
                    color: signalColor(s.direction),
                  }}
                >
                  {signalLabel(s.direction)}
                </span>
              </div>

              <div className="p-3 space-y-2">
                {/* Price Levels */}
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div>
                    <div className="stat-label">Entry</div>
                    <div className="text-[var(--text-primary)] font-semibold">{formatPrice(s.entryPrice)}</div>
                  </div>
                  <div>
                    <div className="stat-label">Stop Loss</div>
                    <div className="text-red">{formatPrice(s.stopLoss)}</div>
                  </div>
                  <div>
                    <div className="stat-label">Take Profit 1</div>
                    <div className="text-green">{formatPrice(s.takeProfit1)}</div>
                  </div>
                </div>

                {/* R:R + Confidence */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="stat-label">Risk : Reward</div>
                    <div className="text-xs font-mono font-semibold text-[var(--accent)]">{s.riskReward}:1</div>
                  </div>
                  <div>
                    <div className="stat-label">Confidence</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold">{s.confidence}%</span>
                      <div className="flex-1 h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${s.confidence}%`,
                            background: s.confidence >= 70
                              ? 'var(--green)'
                              : s.confidence >= 50
                                ? 'var(--amber)'
                                : 'var(--red)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Indicators */}
                <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-[var(--text-dim)]">
                  <div>RSI: <span className="text-[var(--text-primary)]">{s.indicators.rsi.toFixed(1)}</span></div>
                  <div>MACD: <span className="text-[var(--text-primary)]">{s.indicators.macd}</span></div>
                  <div>MA: <span className="text-[var(--text-primary)]">{s.indicators.ma}</span></div>
                  <div>Bollinger: <span className="text-[var(--text-primary)]">{s.indicators.bollinger}</span></div>
                </div>

                {/* Reason */}
                <div className="text-[10px] font-mono text-[var(--text-dim)] leading-relaxed border-t border-[var(--border)] pt-2 mt-1">
                  {s.reason}
                </div>

                {/* Timeframe + timestamp */}
                <div className="flex justify-between text-[9px] font-mono text-[var(--text-dim)]">
                  <span>TF: {s.timeframe}</span>
                  <span>{new Date(s.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="terminal-panel p-8 text-center">
          <div className="text-3xl mb-3">🔄</div>
          <p className="text-sm text-[var(--text-dim)] mb-2">No signals found</p>
          <p className="text-xs text-[var(--text-dim)] mb-4">
            {filter !== 'ALL'
              ? `No ${signalLabel(filter as SignalDirection)} signals currently. Try a different filter.`
              : 'Click "Generate Signals" to scan the market for trading opportunities.'}
          </p>
          {filter !== 'ALL' ? (
            <button onClick={() => setFilter('ALL')} className="btn-terminal">
              Show All Signals
            </button>
          ) : (
            <button onClick={handleGenerate} className="btn-terminal-active">
              🎯 Generate Signals
            </button>
          )}
        </div>
      )}

      {/* Keyboard Shortcut Hint */}
      <div className="text-[10px] text-[var(--text-dim)] font-mono text-center py-1">
        <span className="mx-2">← → Filter signals</span>
        <span className="mx-2">Enter View details</span>
        <span className="mx-2">G Generate signals</span>
      </div>
    </div>
  )
}
