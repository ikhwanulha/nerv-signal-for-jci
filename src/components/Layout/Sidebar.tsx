'use client'
import { useStore } from '@/store/useStore'
import { PanelId } from '@/types'
import { cn } from '@/lib/utils'

const menuItems: { id: PanelId; label: string; icon: string; shortcut?: string; badge?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', shortcut: '⌘1' },
  { id: 'screener', label: 'Screener', icon: '🔍', shortcut: '⌘2' },
  { id: 'signals', label: 'Signals', icon: '🔄', shortcut: '⌘3', badge: 'HOT' },
  { id: 'insight', label: 'Insight', icon: '💡', shortcut: '⌘4' },
  { id: 'aksi_korporasi', label: 'Aksi Korporasi', icon: '📋' },
  { id: 'watchlist', label: 'Watchlist', icon: '👁', shortcut: '⌘5' },
  { id: 'portfolio', label: 'Portfolio', icon: '💼', shortcut: '⌘6' },
  { id: 'heatmap', label: 'Sector Heatmap', icon: '🗺', shortcut: '⌘7', badge: 'NEW' },
  { id: 'unusual_volume', label: 'Unusual Volume', icon: '🔥', shortcut: '⌘8' },
  { id: 'pattern_scanner', label: 'Pattern Scanner', icon: '📐' },
  { id: 'net_asing', label: 'Net Asing', icon: '🌐', shortcut: '⌘9', badge: 'NEW' },
  { id: 'ipo_tracker', label: 'IPO Tracker', icon: '🚀', badge: 'NEW' },
  { id: 'kalkulator_lot', label: 'Kalkulator Lot', icon: '🔢' },
  { id: 'calendar', label: 'Kalender', icon: '📅' },
]

export function Sidebar() {
  const { activePanel, setActivePanel, togglePanel, theme, setTheme } = useStore()

  return (
    <aside className="w-52 bg-[var(--bg-surface)] border-r border-[var(--border)] flex flex-col overflow-hidden select-none">
      {/* Logo / Brand */}
      <div className="px-3 py-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="text-lg">🟢</span>
          <div>
            <div className="text-sm font-bold font-mono text-[var(--text-primary)]">NERV SIGNAL</div>
            <div className="text-[10px] font-mono text-[var(--text-dim)]">FOR JCI · Ikhwanul Hakim</div>
          </div>
        </div>
      </div>

      {/* Search box */}
      <div className="px-2 py-2 border-b border-[var(--border)]">
        <button
          onClick={() => useStore.getState().toggleCommandBar()}
          className="w-full px-2 py-1.5 text-xs font-mono bg-[var(--bg-primary)] border border-[var(--border-light)] 
                     rounded text-[var(--text-dim)] text-left hover:border-[var(--accent)] transition-colors"
        >
          <span className="text-[var(--text-dim)]">🔍 </span>
          Cari saham... <span className="float-right text-[10px] text-[var(--text-dim)]">⌘K</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-1">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => {
              togglePanel(item.id)
            }}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-left transition-colors border-l-2',
              activePanel === item.id
                ? 'bg-[var(--accent)]/10 text-[var(--accent)] border-l-[var(--accent)]'
                : 'text-[var(--text-secondary)] border-l-transparent hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
            )}
          >
            <span className="text-sm">{item.icon}</span>
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge && (
              <span className={cn(
                'px-1 py-0.5 text-[9px] font-bold rounded',
                item.badge === 'HOT' ? 'bg-[var(--red)] text-white' : 'bg-[var(--blue)] text-white'
              )}>
                {item.badge}
              </span>
            )}
            {item.shortcut && (
              <span className="text-[9px] text-[var(--text-dim)] hidden 2xl:inline">{item.shortcut}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Theme selector */}
      <div className="px-3 py-2 border-t border-[var(--border)]">
        <div className="text-[10px] font-mono text-[var(--text-dim)] mb-1 uppercase tracking-wider">Theme</div>
        <div className="flex gap-1">
          {(['dark', 'amber', 'green', 'blue'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={cn(
                'w-6 h-6 rounded-full border-2 transition-all',
                theme === t ? 'border-[var(--accent)] scale-110' : 'border-transparent opacity-50 hover:opacity-80',
                t === 'dark' ? 'bg-[#333]' : t === 'amber' ? 'bg-[#ffab00]' : t === 'green' ? 'bg-[#00c853]' : 'bg-[#2979ff]'
              )}
            />
          ))}
        </div>
      </div>

      {/* Quick info */}
      <div className="px-3 py-2 border-t border-[var(--border)] text-[10px] font-mono text-[var(--text-dim)]">
        <div>⌘K → Cari</div>
        <div>F5 → Refresh</div>
        <div>v1.0.0</div>
      </div>
    </aside>
  )
}
