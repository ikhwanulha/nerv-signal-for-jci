'use client'
import { useStore } from '@/store/useStore'
import { useState, useCallback } from 'react'
import { cn, formatPrice, formatPercent } from '@/lib/utils'
import { WatchlistItem, PriceAlert } from '@/types'

export function Watchlist() {
  const { watchlist, alerts, addToWatchlist, removeFromWatchlist, addAlert, removeAlert, setSelectedTicker } = useStore()
  const [newTicker, setNewTicker] = useState('')
  const [configuringAlert, setConfiguringAlert] = useState<string | null>(null)
  const [alertType, setAlertType] = useState<'above' | 'below'>('above')
  const [alertPrice, setAlertPrice] = useState('')

  const handleAdd = useCallback(() => {
    const ticker = newTicker.toUpperCase().trim()
    if (!ticker || watchlist.some(w => w.ticker === ticker)) return
    const item: WatchlistItem = {
      ticker,
      name: ticker,
      addedAt: Date.now(),
    }
    addToWatchlist(item)
    setNewTicker('')
  }, [newTicker, watchlist, addToWatchlist])

  const handleAddAlert = useCallback((ticker: string) => {
    const price = parseFloat(alertPrice)
    if (isNaN(price) || price <= 0) return
    const alert: PriceAlert = {
      id: `alert-${ticker}-${Date.now()}`,
      ticker,
      type: alertType,
      price,
      triggered: false,
      createdAt: Date.now(),
    }
    addAlert(alert)
    setConfiguringAlert(null)
    setAlertPrice('')
  }, [alertPrice, alertType, addAlert])

  const getTickerAlerts = (ticker: string) => alerts.filter(a => a.ticker === ticker)

  // Simulate price for watchlist display
  const getPrice = (ticker: string) => {
    const base = 1000 + (ticker.charCodeAt(0) + ticker.charCodeAt(1)) * 25
    const noise = (Math.random() - 0.5) * base * 0.04
    const price = Math.round(base + noise)
    const change = Math.round((Math.random() - 0.5) * base * 0.04)
    const changePercent = Math.round((change / base) * 10000) / 100
    return { price, change, changePercent }
  }

  return (
    <div className="p-2 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold font-mono text-[var(--text-primary)]">
            👁 WATCHLIST
          </h1>
          <p className="text-[10px] text-[var(--text-dim)] font-mono">
            Monitor stocks and set price alerts
          </p>
        </div>
        <span className="text-[10px] text-[var(--text-dim)] font-mono">
          {watchlist.length} watched · {alerts.length} alerts
        </span>
      </div>

      {/* Add to Watchlist */}
      <div className="terminal-panel p-2">
        <div className="flex items-center gap-2">
          <input
            className="input-terminal flex-1"
            placeholder="Add ticker... (e.g. BBCA)"
            value={newTicker}
            onChange={e => setNewTicker(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            maxLength={4}
          />
          <button
            onClick={handleAdd}
            disabled={!newTicker.trim()}
            className="btn-terminal"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Watchlist Items */}
      {watchlist.length > 0 ? (
        <div className="space-y-1">
          {watchlist.map(item => {
            const priceData = getPrice(item.ticker)
            const itemAlerts = getTickerAlerts(item.ticker)
            const isConfiguring = configuringAlert === item.ticker

            return (
              <div key={item.ticker} className="terminal-panel">
                <div className="p-2">
                  {/* Main row */}
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => setSelectedTicker(item.ticker)}
                    >
                      <span className="font-bold font-mono text-sm text-[var(--text-primary)]">
                        {item.ticker}
                      </span>
                      <span className="text-xs text-[var(--text-dim)]">{item.name}</span>
                    </div>
                    {priceData ? (
                      <div className="flex items-center gap-4 font-mono text-xs">
                        <span className="font-semibold">{formatPrice(priceData.price)}</span>
                        <span className={cn(
                          priceData.change >= 0 ? 'text-green' : 'text-red'
                        )}>
                          {formatPercent(priceData.changePercent)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--text-dim)] font-mono">No data</span>
                    )}
                    <div className="flex items-center gap-1 ml-3">
                      <button
                        onClick={() => {
                          setConfiguringAlert(isConfiguring ? null : item.ticker)
                          setAlertPrice('')
                        }}
                        className={cn(
                          'text-[10px] px-2 py-0.5 rounded font-mono',
                          isConfiguring
                            ? 'bg-[var(--accent)]/20 text-[var(--accent)]'
                            : 'text-[var(--text-dim)] hover:text-[var(--accent)]'
                        )}
                      >
                        🔔
                      </button>
                      <button
                        onClick={() => removeFromWatchlist(item.ticker)}
                        className="text-[10px] px-1 py-0.5 text-[var(--text-dim)] hover:text-red"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Alerts display */}
                  {itemAlerts.length > 0 && !isConfiguring && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {itemAlerts.map(alert => (
                        <span
                          key={alert.id}
                          className={cn(
                            'inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-mono rounded',
                            alert.type === 'above' ? 'bg-green/10 text-green' : 'bg-red/10 text-red'
                          )}
                        >
                          {alert.type === 'above' ? '↑' : '↓'} {formatPrice(alert.price)}
                          <button
                            onClick={() => removeAlert(alert.id)}
                            className="ml-0.5 hover:text-[var(--text-primary)]"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Alert config form */}
                  {isConfiguring && (
                    <div className="mt-2 pt-2 border-t border-[var(--border)]">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <button
                            onClick={() => setAlertType('above')}
                            className={cn(
                              'px-2 py-0.5 text-[10px] font-mono rounded',
                              alertType === 'above'
                                ? 'bg-green/20 text-green border border-green/30'
                                : 'bg-[var(--bg-primary)] text-[var(--text-dim)] border border-[var(--border-light)]'
                            )}
                          >
                            ↑ Above
                          </button>
                          <button
                            onClick={() => setAlertType('below')}
                            className={cn(
                              'px-2 py-0.5 text-[10px] font-mono rounded',
                              alertType === 'below'
                                ? 'bg-red/20 text-red border border-red/30'
                                : 'bg-[var(--bg-primary)] text-[var(--text-dim)] border border-[var(--border-light)]'
                            )}
                          >
                            ↓ Below
                          </button>
                        </div>
                        <input
                          className="input-terminal w-28"
                          type="number"
                          placeholder="Price..."
                          value={alertPrice}
                          onChange={e => setAlertPrice(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAddAlert(item.ticker)}
                        />
                        <button
                          onClick={() => handleAddAlert(item.ticker)}
                          disabled={!alertPrice}
                          className="btn-terminal text-[10px]"
                        >
                          Set
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="terminal-panel p-8 text-center">
          <div className="text-3xl mb-3">👁</div>
          <p className="text-sm text-[var(--text-dim)] mb-2">Your watchlist is empty</p>
          <p className="text-xs text-[var(--text-dim)] mb-4">
            Add stocks to monitor prices and set alerts
          </p>
          <div className="inline-flex items-center gap-2">
            <input
              className="input-terminal w-32"
              placeholder="BBCA"
              value={newTicker}
              onChange={e => setNewTicker(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              maxLength={4}
            />
            <button onClick={handleAdd} disabled={!newTicker.trim()} className="btn-terminal-active">
              + Add Stock
            </button>
          </div>
        </div>
      )}

      {/* Keyboard hints */}
      <div className="text-[10px] text-[var(--text-dim)] font-mono text-center py-1">
        <span className="mx-2">Enter Add ticker</span>
        <span className="mx-2">🔔 Configure alert</span>
        <span className="mx-2">Click ticker to view</span>
      </div>
    </div>
  )
}
