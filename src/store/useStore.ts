import { create } from 'zustand'
import { 
  PanelWindow, PanelId, ThemeMode, ScreenerFilter, PortfolioPosition,
  WatchlistItem, PriceAlert, TradingSignal
} from '@/types'

const defaultPanels: PanelWindow[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', visible: true, x: 0, y: 0, width: 100, height: 100, minimized: false },
  { id: 'screener', label: 'Screener', icon: '🔍', visible: false, x: 0, y: 0, width: 100, height: 100, minimized: false },
  { id: 'signals', label: 'Signals', icon: '🔄', visible: false, x: 0, y: 0, width: 100, height: 100, minimized: false },
  { id: 'insight', label: 'Insight', icon: '💡', visible: false, x: 0, y: 0, width: 100, height: 100, minimized: false },
  { id: 'aksi_korporasi', label: 'Aksi Korporasi', icon: '📋', visible: false, x: 0, y: 0, width: 100, height: 100, minimized: false },
  { id: 'watchlist', label: 'Watchlist', icon: '👁', visible: false, x: 0, y: 0, width: 100, height: 100, minimized: false },
  { id: 'portfolio', label: 'Portfolio', icon: '💼', visible: false, x: 0, y: 0, width: 100, height: 100, minimized: false },
  { id: 'heatmap', label: 'Sector Heatmap', icon: '🗺', visible: false, x: 0, y: 0, width: 100, height: 100, minimized: false },
  { id: 'unusual_volume', label: 'Unusual Volume', icon: '🔥', visible: false, x: 0, y: 0, width: 100, height: 100, minimized: false },
  { id: 'pattern_scanner', label: 'Pattern Scanner', icon: '📐', visible: false, x: 0, y: 0, width: 100, height: 100, minimized: false },
  { id: 'net_asing', label: 'Net Asing', icon: '🌐', visible: false, x: 0, y: 0, width: 100, height: 100, minimized: false },
  { id: 'ipo_tracker', label: 'IPO Tracker', icon: '🚀', visible: false, x: 0, y: 0, width: 100, height: 100, minimized: false },
  { id: 'kalkulator_lot', label: 'Kalkulator Lot', icon: '🔢', visible: false, x: 0, y: 0, width: 100, height: 100, minimized: false },
  { id: 'calendar', label: 'Kalender', icon: '📅', visible: false, x: 0, y: 0, width: 100, height: 100, minimized: false },
]

interface StoreState {
  // UI State (persists across React Query refetches)
  theme: ThemeMode
  activePanel: PanelId
  searchQuery: string
  selectedTicker: string | null
  panels: PanelWindow[]
  commandBarOpen: boolean
  screenerFilters: ScreenerFilter
  newsModalOpen: boolean
  selectedNewsId: string | null
  
  // Portfolio & Watchlist (persistent)
  portfolio: PortfolioPosition[]
  watchlist: WatchlistItem[]
  alerts: PriceAlert[]

  // Actions
  setTheme: (theme: ThemeMode) => void
  setActivePanel: (panel: PanelId) => void
  setSearchQuery: (q: string) => void
  setSelectedTicker: (ticker: string | null) => void
  toggleCommandBar: () => void
  togglePanel: (panel: PanelId) => void
  setScreenerFilters: (f: ScreenerFilter) => void
  openNewsModal: (newsId: string) => void
  closeNewsModal: () => void
  
  // Portfolio actions
  addPosition: (p: PortfolioPosition) => void
  removePosition: (ticker: string) => void
  updatePosition: (ticker: string, p: Partial<PortfolioPosition>) => void
  
  // Watchlist actions
  addToWatchlist: (item: WatchlistItem) => void
  removeFromWatchlist: (ticker: string) => void
  addAlert: (a: PriceAlert) => void
  removeAlert: (id: string) => void
}

export const useStore = create<StoreState>((set) => ({
  // UI
  theme: 'dark',
  activePanel: 'dashboard',
  searchQuery: '',
  selectedTicker: null,
  panels: defaultPanels,
  commandBarOpen: false,
  screenerFilters: {},
  newsModalOpen: false,
  selectedNewsId: null,

  // Persistent data
  portfolio: [],
  watchlist: [],
  alerts: [],

  // Actions
  setTheme: (theme) => set({ theme }),
  setActivePanel: (activePanel) => set({ activePanel }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedTicker: (selectedTicker) => set({ selectedTicker }),
  toggleCommandBar: () => set(s => ({ commandBarOpen: !s.commandBarOpen })),
  togglePanel: (id) => set(s => ({
    panels: s.panels.map(p => p.id === id ? { ...p, visible: !p.visible } : p),
    activePanel: id,
  })),
  setScreenerFilters: (f) => set(s => ({ screenerFilters: { ...s.screenerFilters, ...f } })),
  openNewsModal: (newsId) => set({ newsModalOpen: true, selectedNewsId: newsId }),
  closeNewsModal: () => set({ newsModalOpen: false, selectedNewsId: null }),

  addPosition: (p) => set(s => ({ portfolio: [...s.portfolio, p] })),
  removePosition: (ticker) => set(s => ({ portfolio: s.portfolio.filter(p => p.ticker !== ticker) })),
  updatePosition: (ticker, partial) => set(s => ({
    portfolio: s.portfolio.map(p => p.ticker === ticker ? { ...p, ...partial } : p)
  })),

  addToWatchlist: (item) => set(s => ({ watchlist: [...s.watchlist, item] })),
  removeFromWatchlist: (ticker) => set(s => ({ watchlist: s.watchlist.filter(w => w.ticker !== ticker) })),
  addAlert: (a) => set(s => ({ alerts: [...s.alerts, a] })),
  removeAlert: (id) => set(s => ({ alerts: s.alerts.filter(a => a.id !== id) })),
}))
