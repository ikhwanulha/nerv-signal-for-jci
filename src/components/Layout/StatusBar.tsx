'use client'
import { useStore } from '@/store/useStore'
import { useIHSG } from '@/lib/api'
import { formatPercent, formatNumber } from '@/lib/utils'
import { useEffect, useState } from 'react'

export function StatusBar() {
  const { activePanel, panels } = useStore()
  const { data: ihsg } = useIHSG()
  const [time, setTime] = useState(new Date())
  const [marketStatus, setMarketStatus] = useState<'OPEN' | 'CLOSED' | 'PRE'>('CLOSED')

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    const checkMarket = () => {
      const h = new Date().getHours()
      const m = new Date().getMinutes()
      const totalMin = h * 60 + m
      if (totalMin >= 540 && totalMin < 960) setMarketStatus('OPEN') // 09:00 - 16:00
      else if (totalMin >= 480 && totalMin < 540) setMarketStatus('PRE')
      else setMarketStatus('CLOSED')
    }
    checkMarket()
    const marketTimer = setInterval(checkMarket, 60000)
    return () => { clearInterval(timer); clearInterval(marketTimer) }
  }, [])

  const activePanelLabel = panels.find(p => p.id === activePanel)?.label || 'Dashboard'

  // Detect when data was last fetched from React Query cache freshness
  const lastUpdateStr = time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })

  return (
    <footer className="h-6 bg-[var(--bg-elevated)] border-t border-[var(--border)] flex items-center px-3 text-[10px] font-mono text-[var(--text-dim)] select-none shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${
            marketStatus === 'OPEN' ? 'bg-[var(--green)]' : 
            marketStatus === 'PRE' ? 'bg-[var(--amber)]' : 'bg-[var(--red-dim)]'
          }`} />
          {marketStatus === 'OPEN' ? 'LIVE' : marketStatus === 'PRE' ? 'PRE-OPEN' : 'CLOSED'}
        </span>
        <span className="text-[var(--border-light)]">|</span>
        {ihsg && (
          <>
            <span>IHSG: {ihsg.price.toFixed(2)}</span>
            <span className={ihsg.change >= 0 ? 'text-green' : 'text-red'}>
              {formatPercent(ihsg.changePercent)}
            </span>
            <span className="text-[var(--border-light)]">|</span>
            <span>Vol: {formatNumber(ihsg.volume)}</span>
          </>
        )}
      </div>

      {/* Center */}
      <div className="flex-1 text-center text-[var(--text-dim)]">
        {activePanelLabel}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <span className="text-[var(--accent)]">
          ◉ LIVE
        </span>
        <span className="text-[var(--border-light)]">|</span>
        <span>
          Last: {lastUpdateStr}
        </span>
        <span className="text-[var(--border-light)]">|</span>
        <span>
          {time.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <span className="text-[var(--accent)] font-semibold">
          {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })} WIB
        </span>
        <span className="flex items-center gap-1 ml-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse-slow" />
          <span className="text-[9px]">5s</span>
        </span>
      </div>
    </footer>
  )
}
