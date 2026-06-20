'use client'
import { useStore } from '@/store/useStore'
import { useState, useMemo, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { CalendarEvent } from '@/types'

const EVENT_COLORS: Record<string, string> = {
  dividend: 'bg-green/30 border-green',
  earnings: 'bg-[var(--blue)]/30 border-[var(--blue)]',
  corporate_action: 'bg-[var(--amber)]/30 border-[var(--amber)]',
  economic: 'bg-[var(--accent)]/30 border-[var(--accent)]',
  ipo: 'bg-[var(--red)]/30 border-[var(--red)]',
}

const EVENT_LABELS: Record<string, string> = {
  dividend: '💰 Div',
  earnings: '📊 Earn',
  corporate_action: '📋 Corp',
  economic: '📈 Econ',
  ipo: '🚀 IPO',
}

const EVENT_TYPES = ['all', 'dividend', 'earnings', 'corporate_action', 'economic', 'ipo'] as const

export function Calendar() {
  const { calendarEvents, setSelectedTicker } = useStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [filterType, setFilterType] = useState<string>('all')
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  // Generate mock calendar events
  const events: CalendarEvent[] = useMemo(() => {
    if (calendarEvents.length > 0) return calendarEvents

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const templates: Omit<CalendarEvent, 'id' | 'date'>[] = [
      { ticker: 'BBCA', title: 'Ex-Dividend Date', type: 'dividend', description: 'Dividen tunai Rp 250/saham' },
      { ticker: 'BBRI', title: 'Ex-Dividend Date', type: 'dividend', description: 'Dividen tunai Rp 180/saham' },
      { ticker: 'TLKM', title: 'Ex-Dividend Date', type: 'dividend', description: 'Dividen final Rp 120/saham' },
      { ticker: 'UNVR', title: 'Earnings Release', type: 'earnings', description: 'Laporan keuangan Q2-2025' },
      { ticker: 'ASII', title: 'Earnings Release', type: 'earnings', description: 'Laporan keuangan Q2-2025' },
      { ticker: 'GGRM', title: 'RUPS Tahunan', type: 'corporate_action', description: 'Rapat Umum Pemegang Saham' },
      { ticker: '', title: 'Inflasi Juni 2025', type: 'economic', description: 'Rilis data inflasi bulanan' },
      { ticker: '', title: 'BI Rate Decision', type: 'economic', description: 'RDG Bank Indonesia' },
      { ticker: 'FOOD', title: 'IPO Listing', type: 'ipo', description: 'IPO FoodChain Indonesia' },
      { ticker: 'EDGE', title: 'IPO Bookbuilding', type: 'ipo', description: 'Bookbuilding saham Edge DC' },
    ]

    const generated: CalendarEvent[] = []
    templates.forEach((t, i) => {
      const day = ((i * 3) % daysInMonth) + 1
      generated.push({
        id: `cal-${i}`,
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        ...t,
      })
    })
    return generated
  }, [calendarEvents, currentDate])

  const filteredEvents = filterType === 'all'
    ? events
    : events.filter(e => e.type === filterType)

  // Calendar grid calculation
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const calendarDays = useMemo(() => {
    const days: { day: number; isCurrentMonth: boolean; events: CalendarEvent[] }[] = []

    // Previous month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, isCurrentMonth: false, events: [] })
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const dayEvents = filteredEvents.filter(e => e.date === dateStr)
      days.push({ day: d, isCurrentMonth: true, events: dayEvents })
    }

    // Next month padding
    const remaining = 7 - (days.length % 7)
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        days.push({ day: d, isCurrentMonth: false, events: [] })
      }
    }

    return days
  }, [firstDay, daysInMonth, daysInPrevMonth, year, month, filteredEvents])

  const monthName = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

  const navigate = useCallback((dir: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const d = new Date(prev)
      d.setMonth(d.getMonth() + (dir === 'next' ? 1 : -1))
      return d
    })
    setSelectedDay(null)
  }, [])

  const selectedDateEvents = selectedDay
    ? filteredEvents.filter(e => e.date === `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`)
    : []

  const eventTypeCounts = EVENT_TYPES.reduce((acc, t) => {
    acc[t] = t === 'all' ? events.length : events.filter(e => e.type === t).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="p-2 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold font-mono text-[var(--text-primary)]">
            📅 MARKET CALENDAR
          </h1>
          <p className="text-[10px] text-[var(--text-dim)] font-mono">
            Dividend dates, earnings, corporate actions & economic releases
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setCurrentDate(new Date()); setSelectedDay(null) }} className="btn-terminal text-[10px]">
            Today
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 flex-wrap">
        {EVENT_TYPES.map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={cn(
              'px-2.5 py-1 text-[10px] font-mono rounded border transition-colors',
              filterType === t
                ? 'bg-[var(--bg-elevated)] border-[var(--accent)] text-[var(--accent)]'
                : 'bg-transparent border-[var(--border-light)] text-[var(--text-dim)] hover:text-[var(--text-primary)]'
            )}
          >
            {t === 'all' ? 'ALL' : EVENT_LABELS[t] || t}
            <span className="ml-1 text-[9px] opacity-60">({eventTypeCounts[t]})</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 terminal-panel">
          {/* Navigation */}
          <div className="terminal-header">
            <button onClick={() => navigate('prev')} className="btn-terminal text-[10px] px-2">
              ◀ Prev
            </button>
            <span className="text-xs font-bold">{monthName.toUpperCase()}</span>
            <button onClick={() => navigate('next')} className="btn-terminal text-[10px] px-2">
              Next ▶
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-[var(--border)]">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => (
              <div key={d} className="px-1 py-1 text-[9px] font-mono text-[var(--text-dim)] text-center font-semibold uppercase">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((d, i) => {
              const isToday = d.isCurrentMonth && d.day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()
              const isSelected = d.day === selectedDay && d.isCurrentMonth

              return (
                <div
                  key={i}
                  className={cn(
                    'min-h-[70px] p-1 border border-[var(--border)]/30 cursor-pointer transition-colors',
                    d.isCurrentMonth
                      ? 'bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)]'
                      : 'bg-[var(--bg-primary)] opacity-40',
                    isToday && 'border-[var(--accent)]',
                    isSelected && 'bg-[var(--accent)]/10'
                  )}
                  onClick={() => d.isCurrentMonth && setSelectedDay(d.day)}
                >
                  <div className={cn(
                    'text-[10px] font-mono font-semibold mb-0.5',
                    isToday ? 'text-[var(--accent)]' : d.isCurrentMonth ? 'text-[var(--text-primary)]' : 'text-[var(--text-dim)]'
                  )}>
                    {d.day}
                  </div>
                  <div className="space-y-0.5">
                    {d.events.slice(0, 2).map(e => (
                      <div
                        key={e.id}
                        className={cn(
                          'text-[7px] leading-tight px-0.5 py-[1px] rounded truncate',
                          EVENT_COLORS[e.type] || 'bg-[var(--bg-hover)] border-[var(--border)]',
                        )}
                        title={e.title}
                      >
                        {EVENT_LABELS[e.type] || e.type} {e.ticker && e.ticker}
                      </div>
                    ))}
                    {d.events.length > 2 && (
                      <div className="text-[7px] text-[var(--text-dim)] font-mono">
                        +{d.events.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Events Panel */}
        <div className="terminal-panel">
          <div className="terminal-header">
            <span>
              {selectedDay
                ? `${selectedDay} ${monthName}`
                : 'SELECT A DAY'}
            </span>
            <span className="text-[10px]">{selectedDateEvents.length} events</span>
          </div>
          <div className="h-[450px] overflow-y-auto">
            {selectedDateEvents.length > 0 ? (
              <div className="divide-y divide-[var(--border)]/50">
                {selectedDateEvents.map(e => (
                  <div
                    key={e.id}
                    className={cn(
                      'px-3 py-2 hover:bg-[var(--bg-hover)]',
                      e.ticker && 'cursor-pointer'
                    )}
                    onClick={() => e.ticker && setSelectedTicker(e.ticker)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        'w-2 h-2 rounded-full',
                        e.type === 'dividend' ? 'bg-green' :
                        e.type === 'earnings' ? 'bg-[var(--blue)]' :
                        e.type === 'corporate_action' ? 'bg-[var(--amber)]' :
                        e.type === 'economic' ? 'bg-[var(--accent)]' : 'bg-red'
                      )} />
                      <span className="text-[10px] font-mono font-semibold text-[var(--text-primary)]">
                        {e.title}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-[var(--text-dim)] ml-4">
                      {e.description}
                    </p>
                    <div className="flex items-center gap-2 ml-4 mt-1">
                      {e.ticker && (
                        <span className="text-[9px] font-mono font-bold text-[var(--accent)]">{e.ticker}</span>
                      )}
                      <span className={cn(
                        'text-[8px] font-mono px-1 py-[1px] rounded',
                        EVENT_COLORS[e.type] || 'bg-[var(--bg-hover)]'
                      )}>
                        {EVENT_LABELS[e.type] || e.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-2xl mb-2">📅</div>
                  <p className="text-xs text-[var(--text-dim)]">
                    {selectedDay
                      ? 'No events this day'
                      : 'Click a day to view events'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="terminal-panel p-2">
        <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-[var(--text-dim)] flex-wrap">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green" /> Dividend</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--blue)]" /> Earnings</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--amber)]" /> Corp Action</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--accent)]" /> Economic</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red" /> IPO</span>
        </div>
      </div>
    </div>
  )
}
