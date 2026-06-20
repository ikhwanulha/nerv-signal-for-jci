'use client'
import { useStore } from '@/store/useStore'
import { formatNumber, formatPercent } from '@/lib/utils'
import { useEffect, useState } from 'react'

export function StatusBar() {
  const { ihsg, activePanel, panels, lastUpdate } = useStore()
  const [time, setTime] = useState(new Date())
  const [marketStatus, setMarketStatus] = useState<'OPEN' | 'CLOSED' | 'PRE'>('CLOSED')

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    // Simulate market hours (9:00-16:00)
    const h = new Date().getHours()
    if (h >= 9 && h < 16) setMarketStatus('OPEN')
    else if (h >= 8 && h < 9) setMarketStatus('PRE')
    else setMarketStatus('CLOSED')
    return () => clearInterval(timer)
  }, [])

  const activePanelLabel = panels.find(p => p.id === activePanel)?.label || 'Dashboard'

  return (
    <footer className="h-6 bg-[var(--bg-elevated)] border-t border-[var(--border)] flex items-center px-3 text-[10px] font-mono text-[var(--text-dim)] select-none shrink-0">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${
            marketStatus === 'OPEN' ? 'bg-[var(--green)]' : 
            marketStatus === 'PRE' ? 'bg-[var(--amber)]' : 'bg-[var(--red-dim)]'
          }`} />
          {marketStatus === 'OPEN' ? 'MARKET OPEN' : marketStatus === 'PRE' ? 'PRE-OPEN' : 'CLOSED'}
        </span>
        <span className="text-[var(--border-light)]">|</span>
        <span>IHSG: {ihsg.price.toFixed(2)}</span>
        <span className={ihsg.change >= 0 ? 'text-green' : 'text-red'}>
          {formatPercent(ihsg.changePercent)}
        </span>
        <span className="text-[var(--border-light)]">|</span>
        <span>Vol: {formatNumber(ihsg.volume)}</span>
      </div>

      {/* Center */}
      <div className="flex-1 text-center text-[var(--text-dim)]">
        {activePanelLabel}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <span>
          Last: {lastUpdate.market ? new Date(lastUpdate.market).toLocaleTimeString('id-ID') : '---'}
        </span>
        <span className="text-[var(--border-light)]">|</span>
        <span>
          {time.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <span className="text-[var(--accent)] font-semibold">
          {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })} WIB
        </span>
      </div>
    </footer>
  )
}
