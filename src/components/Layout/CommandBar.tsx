'use client'
import { useState, useEffect, useRef } from 'react'
import { useStore } from '@/store/useStore'
import { searchStocks } from '@/lib/api'
import { StockQuote, PanelId } from '@/types'
import toast from 'react-hot-toast'

const commands = [
  { id: 'dashboard', label: 'Go to Dashboard', icon: '📊', panel: 'dashboard' as PanelId },
  { id: 'screener', label: 'Open Screener', icon: '🔍', panel: 'screener' as PanelId },
  { id: 'signals', label: 'View Trading Signals', icon: '🔄', panel: 'signals' as PanelId },
  { id: 'portfolio', label: 'Open Portfolio', icon: '💼', panel: 'portfolio' as PanelId },
  { id: 'watchlist', label: 'Open Watchlist', icon: '👁', panel: 'watchlist' as PanelId },
  { id: 'heatmap', label: 'Sector Heatmap', icon: '🗺', panel: 'heatmap' as PanelId },
  { id: 'unusual_volume', label: 'Unusual Volume', icon: '🔥', panel: 'unusual_volume' as PanelId },
  { id: 'net_asing', label: 'Net Asing', icon: '🌐', panel: 'net_asing' as PanelId },
  { id: 'ipo_tracker', label: 'IPO Tracker', icon: '🚀', panel: 'ipo_tracker' as PanelId },
  { id: 'kalkulator', label: 'Kalkulator Lot', icon: '🔢', panel: 'kalkulator_lot' as PanelId },
  { id: 'calendar', label: 'Market Calendar', icon: '📅', panel: 'calendar' as PanelId },
  { id: 'pattern', label: 'Pattern Scanner', icon: '📐', panel: 'pattern_scanner' as PanelId },
  { id: 'insight', label: 'Market Insight', icon: '💡', panel: 'insight' as PanelId },
  { id: 'aksi', label: 'Aksi Korporasi', icon: '📋', panel: 'aksi_korporasi' as PanelId },
  { id: 'refresh', label: 'Refresh All Data', icon: '🔄', panel: 'dashboard' as PanelId },
]

export function CommandBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<StockQuote[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toggleCommandBar, togglePanel, setSelectedTicker } = useStore()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (query.length >= 1) {
      searchStocks(query).then(setResults)
    } else {
      setResults([])
    }
    setSelectedIndex(0)
  }, [query])

  const filteredCommands = query
    ? commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()) || c.id.includes(query.toLowerCase()))
    : commands

  const totalItems = filteredCommands.length + results.length

  const handleSelect = (index: number) => {
    if (index < filteredCommands.length) {
      const cmd = filteredCommands[index]
      if (cmd.id === 'refresh') {
        useStore.getState().refreshData()
        toast.success('Data refreshed ✓')
      } else {
        togglePanel(cmd.panel)
      }
    } else {
      const stockIndex = index - filteredCommands.length
      const stock = results[stockIndex]
      if (stock) {
        setSelectedTicker(stock.ticker)
        togglePanel('dashboard')
        toast(`📈 ${stock.ticker} — ${stock.name}`, { icon: '📊' })
      }
    }
    toggleCommandBar()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, totalItems - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      handleSelect(selectedIndex)
    }
  }

  return (
    <div className="command-bar-overlay" onClick={(e) => { if (e.target === e.currentTarget) toggleCommandBar() }}>
      <div className="command-bar">
        <input
          ref={inputRef}
          type="text"
          placeholder="Cari saham (ticker/nama) atau ketik perintah..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="command-results">
          {filteredCommands.map((cmd, i) => (
            <div
              key={cmd.id}
              className={`command-item ${i === selectedIndex ? 'active' : ''}`}
              onClick={() => handleSelect(i)}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              <div className="flex items-center gap-2">
                <span>{cmd.icon}</span>
                <span>{cmd.label}</span>
              </div>
              <span className="text-[10px] text-[var(--text-dim)]">panel</span>
            </div>
          ))}
          
          {results.length > 0 && (
            <>
              <div className="px-4 py-1 text-[10px] text-[var(--text-dim)] font-mono border-t border-[var(--border)]">
                SAHAM — {results.length} hasil
              </div>
              {results.map((stock, i) => {
                const idx = filteredCommands.length + i
                return (
                  <div
                    key={stock.ticker}
                    className={`command-item ${idx === selectedIndex ? 'active' : ''}`}
                    onClick={() => handleSelect(idx)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--text-primary)]">{stock.ticker}</span>
                      <span className="text-[var(--text-dim)]">{stock.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono">
                        Rp{stock.price.toLocaleString('id-ID')}
                      </span>
                      <span className={stock.change >= 0 ? 'text-green' : 'text-red'}>
                        {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </>
          )}

          {query.length > 0 && filteredCommands.length === 0 && results.length === 0 && (
            <div className="px-4 py-8 text-center text-[var(--text-dim)] font-mono">
              Tidak ada hasil untuk &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
        
        <div className="px-4 py-1.5 border-t border-[var(--border)] flex gap-4 text-[10px] text-[var(--text-dim)] font-mono">
          <span>↑↓ Navigasi</span>
          <span>⏎ Pilih</span>
          <span>Esc Tutup</span>
        </div>
      </div>
    </div>
  )
}
