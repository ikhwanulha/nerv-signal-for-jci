// ─── Market Data ───
export interface IHSGQuote {
  price: number; change: number; changePercent: number
  open: number; high: number; low: number
  volume: number; value: number; frequency: number
  previousClose: number
}

export interface StockQuote {
  ticker: string; name: string
  price: number; change: number; changePercent: number
  volume: number; value: number; frequency: number
  open: number; high: number; low: number
  previousClose: number
  marketCap?: number; peRatio?: number; pbRatio?: number
  dividendYield?: number; sector?: string
}

export interface SectorPerformance {
  sector: string; change: number; changePercent: number
  marketCap?: number; volume: number
}

export interface CandleData {
  time: string; open: number; high: number; low: number; close: number; volume: number
}

export type SignalDirection = 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL'

export interface TradingSignal {
  id: string; ticker: string; name: string
  direction: SignalDirection
  entryPrice: number; stopLoss: number
  takeProfit1: number; takeProfit2: number
  riskReward: number; confidence: number
  reason: string
  indicators: { rsi: number; macd: string; ma: string; bollinger: string }
  timestamp: number; timeframe: string
}

export interface NewsItem {
  id: string; title: string; source: string; url: string
  timestamp: number
  sentiment?: 'positive' | 'negative' | 'neutral'
  tickers?: string[]; summary?: string
}

export interface PortfolioPosition {
  id: string; ticker: string; name: string
  entryPrice: number; quantity: number; lots: number
  currentPrice: number
  stopLoss?: number; takeProfit1?: number; takeProfit2?: number
  entryDate: string; sector?: string
}

export interface WatchlistItem {
  ticker: string; name: string; addedAt: number
  alertPrice?: number; alertType?: 'above' | 'below'
}

export type PanelType = 'dashboard' | 'stocks' | 'portfolio' | 'signals' | 'settings' | 'screener'

export interface IDXStock {
  ticker: string; name: string; sector: string
  marketCap?: number; price: number
}
