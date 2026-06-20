import { create } from 'zustand'
import { 
  IHSGQuote, StockQuote, SectorPerformance, TopGainer, TopLoser,
  TradingSignal, PortfolioPosition, WatchlistItem, NewsItem,
  PanelWindow, PanelId, ThemeMode, CandleData, ScreenerFilter,
  HeatmapCell, UnusualVolumeStock, PatternResult, NetAsingData,
  IPOData, CorporateAction, CalendarEvent, PriceAlert
} from '@/types'

// ─── Mock Data (Fallback when API unavailable) ───
const generateMockIHSG = (): IHSGQuote => ({
  price: 7234.567,
  change: 45.23,
  changePercent: 0.63,
  open: 7189.34,
  high: 7245.12,
  low: 7185.67,
  volume: 18_500_000_000,
  value: 14.2e12,
  frequency: 1_200_000,
  previousClose: 7189.337,
})

const generateMockGainers = (count: number): TopGainer[] => 
  Array.from({length: count}, (_, i) => ({
    ticker: ['GGRM', 'UNVR', 'TLKM', 'ASII', 'BBCA', 'BBRI', 'ADRO', 'BYAN'][i] || `STK${i}`,
    name: ['Gudang Garam', 'Unilever', 'Telkom', 'Astra', 'BCA', 'BRI', 'Adaro', 'Bayan'][i] || `Stock ${i}`,
    price: 25000 + Math.random() * 50000,
    change: 500 + Math.random() * 2000,
    changePercent: 1.5 + Math.random() * 8,
    volume: Math.random() * 50_000_000,
    value: Math.random() * 1e12,
    frequency: Math.random() * 50000,
    open: 24000,
    high: 26000,
    low: 23500,
    previousClose: 24000,
    sector: ['Consumer', 'Telecom', 'Automotive', 'Finance', 'Energy'][i % 5],
  }))

const generateMockLosers = (count: number): TopLoser[] =>
  Array.from({length: count}, (_, i) => ({
    ticker: ['INDF', 'HMSP', 'KLBF', 'ICBP', 'CPIN'][i % 5],
    name: ['Indofood', 'HM Sampoerna', 'Kalbe Farma', 'Indofood CBP', 'Charoen Pokphand'][i % 5],
    price: 5000 + Math.random() * 10000,
    change: -(100 + Math.random() * 500),
    changePercent: -(1.0 + Math.random() * 5),
    volume: Math.random() * 30_000_000,
    value: Math.random() * 0.5e12,
    frequency: Math.random() * 30000,
    open: 6000,
    high: 6100,
    low: 4900,
    previousClose: 5500,
    sector: ['Consumer', 'Pharma', 'Food'][i % 3],
  }))

// ─── Store Types ───

interface StoreState {
  // Data
  ihsg: IHSGQuote
  gainers: TopGainer[]
  losers: TopLoser[]
  sectors: SectorPerformance[]
  stocks: StockQuote[]
  signals: TradingSignal[]
  portfolio: PortfolioPosition[]
  watchlist: WatchlistItem[]
  news: NewsItem[]
  candles: Record<string, CandleData[]>
  heatmap: HeatmapCell[]
  unusualVolume: UnusualVolumeStock[]
  patterns: PatternResult[]
  netAsing: NetAsingData | null
  ipos: IPOData[]
  corporateActions: CorporateAction[]
  calendarEvents: CalendarEvent[]

  // UI
  theme: ThemeMode
  activePanel: PanelId
  searchQuery: string
  selectedTicker: string | null
  panels: PanelWindow[]
  commandBarOpen: boolean
  screenerFilters: ScreenerFilter
  alerts: PriceAlert[]

  // Loading
  loading: Record<string, boolean>
  error: Record<string, string | null>
  lastUpdate: Record<string, number>

  // Actions
  setTheme: (theme: ThemeMode) => void
  setActivePanel: (panel: PanelId) => void
  setSearchQuery: (q: string) => void
  setSelectedTicker: (ticker: string | null) => void
  toggleCommandBar: () => void
  togglePanel: (panel: PanelId) => void
  setScreenerFilters: (f: ScreenerFilter) => void
  updateIHSG: (data: IHSGQuote) => void
  addPosition: (p: PortfolioPosition) => void
  removePosition: (ticker: string) => void
  updatePosition: (ticker: string, p: Partial<PortfolioPosition>) => void
  addToWatchlist: (item: WatchlistItem) => void
  removeFromWatchlist: (ticker: string) => void
  addAlert: (a: PriceAlert) => void
  removeAlert: (id: string) => void
  addSignal: (s: TradingSignal) => void
  generateSignals: () => void
  setLoading: (key: string, val: boolean) => void
  setError: (key: string, val: string | null) => void
  refreshData: () => void
}

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

const generateMockSignals = (): TradingSignal[] => {
  const stocks = [
    { ticker: 'BBCA', name: 'Bank BCA', dir: 'BUY' as const },
    { ticker: 'BBRI', name: 'Bank BRI', dir: 'BUY' as const },
    { ticker: 'TLKM', name: 'Telkom Indonesia', dir: 'SELL' as const },
    { ticker: 'GGRM', name: 'Gudang Garam', dir: 'BUY' as const },
    { ticker: 'ASII', name: 'Astra International', dir: 'SELL' as const },
    { ticker: 'UNVR', name: 'Unilever Indonesia', dir: 'BUY' as const },
    { ticker: 'ADRO', name: 'Adaro Energy', dir: 'NEUTRAL' as const },
  ]
  return stocks.map((s, i) => {
    const price = 5000 + Math.random() * 50000
    const sl = price * (s.dir === 'BUY' ? 0.95 : 1.05)
    const tp1 = price * (s.dir === 'BUY' ? 1.08 : 0.92)
    const tp2 = price * (s.dir === 'BUY' ? 1.15 : 0.85)
    const rr = Math.abs(price - tp1) / Math.abs(price - sl)
    return {
      id: `sig-${i}`,
      ticker: s.ticker,
      name: s.name,
      direction: s.dir === 'NEUTRAL' ? 'NEUTRAL' : (s.dir === 'BUY' ? 'BUY' : 'SELL'),
      entryPrice: Math.round(price),
      stopLoss: Math.round(sl),
      takeProfit1: Math.round(tp1),
      takeProfit2: Math.round(tp2),
      riskReward: Math.round(rr * 10) / 10,
      confidence: 60 + Math.floor(Math.random() * 35),
      reason: s.dir === 'BUY' ? 'Oversold conditions + bullish divergence on RSI. MACD cross above signal line. Support level confirmed.'
        : s.dir === 'SELL' ? 'Overbought conditions + bearish divergence. Resistance level tested twice. MACD bearish cross.'
        : 'Sideways consolidation. Waiting for breakout.',
      indicators: {
        rsi: s.dir === 'BUY' ? 28 + Math.random() * 8 : s.dir === 'SELL' ? 72 + Math.random() * 8 : 50 + Math.random() * 10,
        macd: s.dir === 'BUY' ? 'Bullish Cross' : s.dir === 'SELL' ? 'Bearish Cross' : 'Neutral',
        ma: s.dir === 'BUY' ? 'Price above MA50' : s.dir === 'SELL' ? 'Price below MA50' : 'Price near MA50',
        bollinger: s.dir === 'BUY' ? 'Lower band touch' : s.dir === 'SELL' ? 'Upper band touch' : 'Middle band',
      },
      timestamp: Date.now() - i * 7200000,
      timeframe: '1D',
    }
  })
}

const mockNews: NewsItem[] = [
  { id: 'n1', title: 'IHSG Ditutup Menguat, Investor Asing Catatkan Net Buy', source: 'Kontan', url: '#', timestamp: Date.now() - 3600000, sentiment: 'positive', tickers: ['BBCA', 'BBRI'] },
  { id: 'n2', title: 'Bank Indonesia Pertahankan Suku Bunga di 6%', source: 'Bisnis.com', url: '#', timestamp: Date.now() - 7200000, sentiment: 'neutral' },
  { id: 'n3', title: 'BBRI Cetak Laba Bersih Rp 15 Triliun di Q1-2025', source: 'CNBC Indonesia', url: '#', timestamp: Date.now() - 10800000, sentiment: 'positive', tickers: ['BBRI'] },
  { id: 'n4', title: 'TLKM Ekspansi Data Center, Target Pendapatan Tumbuh 15%', source: 'Kontan', url: '#', timestamp: Date.now() - 14400000, sentiment: 'positive', tickers: ['TLKM'] },
  { id: 'n5', title: 'Harga Batubara Anjlok, Saham ADRO dan BYAN Tertekan', source: 'Bloomberg Technoz', url: '#', timestamp: Date.now() - 18000000, sentiment: 'negative', tickers: ['ADRO', 'BYAN'] },
  { id: 'n6', title: 'RUPST GGRM Setujui Dividen Rp 2.000 per Saham', source: 'Investor Daily', url: '#', timestamp: Date.now() - 21600000, sentiment: 'positive', tickers: ['GGRM'] },
  { id: 'n7', title: 'Pemerintah Umumkan Insentif Fiskal untuk Sektor Manufaktur', source: 'Kemenkeu', url: '#', timestamp: Date.now() - 25200000, sentiment: 'positive' },
]

export const useStore = create<StoreState>((set, get) => ({
  // Initial data
  ihsg: generateMockIHSG(),
  gainers: generateMockGainers(8),
  losers: generateMockLosers(5),
  sectors: [
    { sector: 'Financials', change: 125.5, changePercent: 1.2, volume: 3.2e9 },
    { sector: 'Energy', change: -85.3, changePercent: -0.8, volume: 2.1e9 },
    { sector: 'Consumer Cyclicals', change: 95.2, changePercent: 1.5, volume: 1.8e9 },
    { sector: 'Infrastructure', change: 45.6, changePercent: 0.5, volume: 1.5e9 },
    { sector: 'Healthcare', change: -25.4, changePercent: -0.3, volume: 0.9e9 },
    { sector: 'Technology', change: 75.3, changePercent: 2.1, volume: 1.2e9 },
    { sector: 'Basic Materials', change: -35.6, changePercent: -0.4, volume: 0.8e9 },
    { sector: 'Property & Real Estate', change: 55.2, changePercent: 1.8, volume: 0.6e9 },
  ],
  stocks: [],
  signals: generateMockSignals(),
  portfolio: [],
  watchlist: [],
  news: mockNews,
  candles: {},
  heatmap: [],
  unusualVolume: [],
  patterns: [],
  netAsing: null,
  ipos: [],
  corporateActions: [],
  calendarEvents: [],

  // UI
  theme: 'dark',
  activePanel: 'dashboard',
  searchQuery: '',
  selectedTicker: null,
  panels: defaultPanels,
  commandBarOpen: false,
  screenerFilters: {},
  alerts: [],

  // Loading
  loading: {},
  error: {},
  lastUpdate: {},

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
  updateIHSG: (ihsg) => set({ ihsg }),
  
  addPosition: (p) => set(s => ({ portfolio: [...s.portfolio, p] })),
  removePosition: (ticker) => set(s => ({ portfolio: s.portfolio.filter(p => p.ticker !== ticker) })),
  updatePosition: (ticker, partial) => set(s => ({
    portfolio: s.portfolio.map(p => p.ticker === ticker ? { ...p, ...partial } : p)
  })),
  
  addToWatchlist: (item) => set(s => ({ watchlist: [...s.watchlist, item] })),
  removeFromWatchlist: (ticker) => set(s => ({ watchlist: s.watchlist.filter(w => w.ticker !== ticker) })),
  addAlert: (a) => set(s => ({ alerts: [...s.alerts, a] })),
  removeAlert: (id) => set(s => ({ alerts: s.alerts.filter(a => a.id !== id) })),
  addSignal: (s) => set(state => ({ signals: [...state.signals, s] })),
  
  generateSignals: () => set({ signals: generateMockSignals() }),
  
  setLoading: (key, val) => set(s => ({ loading: { ...s.loading, [key]: val } })),
  setError: (key, val) => set(s => ({ error: { ...s.error, [key]: val } })),
  
  refreshData: () => set({
    ihsg: generateMockIHSG(),
    gainers: generateMockGainers(8),
    losers: generateMockLosers(5),
    signals: generateMockSignals(),
    lastUpdate: { ...get().lastUpdate, market: Date.now() },
  }),
}))
