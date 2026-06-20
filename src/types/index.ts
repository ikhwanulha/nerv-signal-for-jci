// ─── Market Data Types ───

export interface IHSGQuote {
  price: number
  change: number
  changePercent: number
  open: number
  high: number
  low: number
  volume: number
  value: number
  frequency: number
  previousClose: number
}

export interface StockQuote {
  ticker: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  value: number
  frequency: number
  open: number
  high: number
  low: number
  previousClose: number
  marketCap?: number
  peRatio?: number
  pbRatio?: number
  dividendYield?: number
  sector?: string
}

export interface SectorPerformance {
  sector: string
  change: number
  changePercent: number
  marketCap?: number
  volume: number
}

export interface TopGainer extends StockQuote {
  changePercent: number
}

export interface TopLoser extends StockQuote {
  changePercent: number
}

// ─── Signal Types ───

export type SignalDirection = 'BUY' | 'SELL' | 'STRONG_BUY' | 'STRONG_SELL' | 'NEUTRAL'

export interface TradingSignal {
  id: string
  ticker: string
  name: string
  direction: SignalDirection
  entryPrice: number
  stopLoss: number
  takeProfit1: number
  takeProfit2: number
  riskReward: number
  confidence: number
  reason: string
  indicators: {
    rsi: number
    macd: string
    ma: string
    bollinger: string
  }
  timestamp: number
  timeframe: string
}

export interface SignalConfig {
  rsiPeriod: number
  rsiOverbought: number
  rsiOversold: number
  macdFast: number
  macdSlow: number
  macdSignal: number
  maPeriod: number
  bollingerPeriod: number
  bollingerStd: number
}

// ─── Portfolio Types ───

export interface PortfolioPosition {
  ticker: string
  name: string
  entryPrice: number
  quantity: number
  lots: number
  currentPrice: number
  stopLoss?: number
  takeProfit1?: number
  takeProfit2?: number
  trailingStop?: number
  trailingActivated: boolean
  entryDate: string
  sector?: string
  notes?: string
}

export interface Portfolio {
  positions: PortfolioPosition[]
  cash: number
  totalValue: number
  totalPnL: number
  totalPnLPercent: number
}

// ─── Watchlist Types ───

export interface WatchlistItem {
  ticker: string
  name: string
  addedAt: number
  notes?: string
  alerts?: PriceAlert[]
}

export interface PriceAlert {
  id: string
  ticker: string
  type: 'above' | 'below'
  price: number
  triggered: boolean
  createdAt: number
}

// ─── News Types ───

export interface NewsItem {
  id: string
  title: string
  source: string
  url: string
  timestamp: number
  sentiment?: 'positive' | 'negative' | 'neutral'
  tickers?: string[]
  summary?: string
}

// ─── Chart Types ───

export interface CandleData {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export type ChartInterval = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'

export type TechnicalIndicator = 'MACD' | 'RSI' | 'MA' | 'BB' | 'Stochastic' | 'none'

// ─── Screening Types ───

export interface ScreenerFilter {
  priceMin?: number
  priceMax?: number
  changeMin?: number
  changeMax?: number
  volumeMin?: number
  sector?: string
  marketCapMin?: number
  marketCapMax?: number
  peRatioMin?: number
  peRatioMax?: number
  dividendYieldMin?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// ─── Sector Heatmap ───

export interface HeatmapCell {
  ticker: string
  name: string
  sector: string
  changePercent: number
  marketCap: number
  price: number
}

// ─── Unusual Volume ───

export interface UnusualVolumeStock {
  ticker: string
  name: string
  currentVolume: number
  avgVolume: number
  volumeRatio: number
  price: number
  change: number
  changePercent: number
}

// ─── Pattern Types ───

export type ChartPattern = 
  | 'Double Top' | 'Double Bottom'
  | 'Head & Shoulders' | 'Inverse H&S'
  | 'Ascending Triangle' | 'Descending Triangle'
  | 'Bull Flag' | 'Bear Flag'
  | 'Cup & Handle'
  | 'Wedding' | 'Rising Wedge' | 'Falling Wedge'

export interface PatternResult {
  ticker: string
  pattern: ChartPattern
  direction: 'bullish' | 'bearish'
  confidence: number
  targetPrice: number
  timestamp: number
}

// ─── Net Asing ───

export interface NetAsingData {
  date: string
  netBuy: number
  netSell: number
  total: number
  topBuy: { ticker: string; value: number }[]
  topSell: { ticker: string; value: number }[]
}

// ─── IPO Types ───

export interface IPOData {
  ticker: string
  name: string
  sector: string
  offeringPrice: number
  currentPrice?: number
  sharesOffered: number
  proceeds: number
  listingDate: string
  status: 'upcoming' | 'current' | 'completed'
  subscriptionRate?: number
  returnPercent?: number
}

// ─── Corporate Action Types ───

export interface CorporateAction {
  id: string
  ticker: string
  name: string
  type: 'dividend' | 'stock_split' | 'rights' | 'buyback' | 'rups' | 'listing'
  date: string
  description: string
  value?: number
  ratio?: string
}

// ─── Calendar Types ───

export interface CalendarEvent {
  id: string
  date: string
  ticker: string
  title: string
  type: 'dividend' | 'earnings' | 'corporate_action' | 'economic' | 'ipo'
  description: string
}

// ─── Window / Layout Types ───

export type PanelId = 
  | 'dashboard' | 'screener' | 'signals' | 'insight' 
  | 'aksi_korporasi' | 'watchlist' | 'portfolio' | 'heatmap'
  | 'unusual_volume' | 'pattern_scanner' | 'net_asing' | 'ipo_tracker'
  | 'kalkulator_lot' | 'calendar'

export interface PanelWindow {
  id: PanelId
  label: string
  icon: string
  visible: boolean
  x: number
  y: number
  width: number
  height: number
  minimized: boolean
}

export type ThemeMode = 'dark' | 'amber' | 'green' | 'blue'
