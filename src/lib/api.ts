import { StockQuote, CandleData, ScreenerFilter, TopGainer, TopLoser } from '@/types'
import { useStore } from '@/store/useStore'

const BASE_URL = 'https://api.example.com' // Placeholder - use actual API

// ─── @baguskto/saham API ───
// If @baguskto/saham is installed, use it. Otherwise, use fallback.
let sahamClient: any = null

try {
  // Dynamic import for when package is available
  // const Saham = require('@baguskto/saham')
  // sahamClient = new Saham()
} catch {
  console.log('@baguskto/saham not available, using mock data')
}

export async function fetchIHSG() {
  const store = useStore.getState()
  store.setLoading('ihsg', true)
  try {
    // Try @baguskto/saham first
    if (sahamClient) {
      // const data = await sahamClient.getIndex('IHSG')
      // return data
    }
    // Fallback to mock
    const mock = getMockIHSG()
    store.updateIHSG(mock)
    return mock
  } catch (err) {
    store.setError('ihsg', 'Failed to fetch IHSG data')
    return null
  } finally {
    store.setLoading('ihsg', false)
  }
}

export async function fetchTopGainers(): Promise<TopGainer[]> {
  return getMockGainers(8)
}

export async function fetchTopLosers(): Promise<TopLoser[]> {
  return getMockLosers(5)
}

export async function searchStocks(query: string): Promise<StockQuote[]> {
  const mockStocks: StockQuote[] = [
    { ticker: 'BBCA', name: 'Bank Central Asia', price: 10250, change: 75, changePercent: 0.74, volume: 25000000, value: 256250000000, frequency: 15000, open: 10175, high: 10300, low: 10150, previousClose: 10175, sector: 'Financials' },
    { ticker: 'BBRI', name: 'Bank Rakyat Indonesia', price: 5800, change: 50, changePercent: 0.87, volume: 45000000, value: 261000000000, frequency: 22000, open: 5750, high: 5825, low: 5725, previousClose: 5750, sector: 'Financials' },
    { ticker: 'TLKM', name: 'Telkom Indonesia', price: 3950, change: -25, changePercent: -0.63, volume: 35000000, value: 138250000000, frequency: 18000, open: 3975, high: 4000, low: 3925, previousClose: 3975, sector: 'Telecommunications' },
    { ticker: 'ASII', name: 'Astra International', price: 6225, change: 100, changePercent: 1.63, volume: 15000000, value: 93375000000, frequency: 8500, open: 6125, high: 6250, low: 6125, previousClose: 6125, sector: 'Automotive' },
    { ticker: 'UNVR', name: 'Unilever Indonesia', price: 2850, change: -50, changePercent: -1.72, volume: 20000000, value: 57000000000, frequency: 12000, open: 2900, high: 2925, low: 2825, previousClose: 2900, sector: 'Consumer' },
    { ticker: 'GGRM', name: 'Gudang Garam', price: 24250, change: 500, changePercent: 2.11, volume: 5000000, value: 121250000000, frequency: 3500, open: 23750, high: 24500, low: 23650, previousClose: 23750, sector: 'Consumer' },
    { ticker: 'ADRO', name: 'Adaro Energy', price: 3125, change: -75, changePercent: -2.34, volume: 40000000, value: 125000000000, frequency: 20000, open: 3200, high: 3225, low: 3100, previousClose: 3200, sector: 'Energy' },
    { ticker: 'BYAN', name: 'Bayan Resources', price: 18750, change: -250, changePercent: -1.32, volume: 8000000, value: 150000000000, frequency: 4500, open: 19000, high: 19100, low: 18600, previousClose: 19000, sector: 'Energy' },
    { ticker: 'KLBF', name: 'Kalbe Farma', price: 1625, change: 25, changePercent: 1.56, volume: 30000000, value: 48750000000, frequency: 14000, open: 1600, high: 1650, low: 1595, previousClose: 1600, sector: 'Healthcare' },
    { ticker: 'HMSP', name: 'HM Sampoerna', price: 825, change: -15, changePercent: -1.79, volume: 55000000, value: 45375000000, frequency: 25000, open: 840, high: 845, low: 820, previousClose: 840, sector: 'Consumer' },
    { ticker: 'ICBP', name: 'Indofood CBP', price: 10975, change: 125, changePercent: 1.15, volume: 8000000, value: 87800000000, frequency: 5200, open: 10850, high: 11050, low: 10825, previousClose: 10850, sector: 'Consumer' },
    { ticker: 'INDF', name: 'Indofood Sukses Makmur', price: 6725, change: -50, changePercent: -0.74, volume: 12000000, value: 80700000000, frequency: 7500, open: 6775, high: 6800, low: 6700, previousClose: 6775, sector: 'Consumer' },
    { ticker: 'CPIN', name: 'Charoen Pokphand', price: 4825, change: 75, changePercent: 1.58, volume: 10000000, value: 48250000000, frequency: 6000, open: 4750, high: 4850, low: 4725, previousClose: 4750, sector: 'Consumer' },
    { ticker: 'EXCL', name: 'XL Axiata', price: 2175, change: 50, changePercent: 2.35, volume: 15000000, value: 32625000000, frequency: 8000, open: 2125, high: 2200, low: 2115, previousClose: 2125, sector: 'Telecommunications' },
    { ticker: 'ISAT', name: 'Indosat Ooredoo', price: 7350, change: 125, changePercent: 1.73, volume: 5000000, value: 36750000000, frequency: 3200, open: 7225, high: 7400, low: 7200, previousClose: 7225, sector: 'Telecommunications' },
  ]
  
  if (!query) return mockStocks
  const q = query.toUpperCase()
  return mockStocks.filter(s => s.ticker.includes(q) || s.name.toUpperCase().includes(q))
}

export async function fetchCandles(ticker: string, interval: string = '1M'): Promise<CandleData[]> {
  const count = 
    interval === '1D' ? 93 :
    interval === '1W' ? 5 * 24 :
    interval === '1M' ? 22 :
    interval === '3M' ? 66 :
    interval === '6M' ? 132 :
    interval === '1Y' ? 264 : 528
  
  const candles: CandleData[] = []
  const now = new Date()
  let basePrice = 5000 + Math.random() * 45000
  
  for (let i = count; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const volatility = basePrice * 0.03
    const open = basePrice + (Math.random() - 0.5) * volatility
    const close = open + (Math.random() - 0.45) * volatility
    const high = Math.max(open, close) + Math.random() * volatility * 0.5
    const low = Math.min(open, close) - Math.random() * volatility * 0.5
    
    candles.push({
      time: date.toISOString().split('T')[0],
      open: Math.round(open),
      high: Math.round(high),
      low: Math.round(low),
      close: Math.round(close),
      volume: Math.round(Math.random() * 50000000),
    })
    basePrice = close
  }
  return candles
}

export async function fetchNews(): Promise<any[]> {
  return useStore.getState().news
}

// Mocks
function getMockIHSG() {
  return {
    price: 7234.567,
    change: 45.23,
    changePercent: 0.63,
    open: 7189.34,
    high: 7245.12,
    low: 7185.67,
    volume: 18.5e9,
    value: 14.2e12,
    frequency: 1_200_000,
    previousClose: 7189.337,
  }
}

function getMockGainers(count: number): TopGainer[] {
  return Array.from({length: count}, (_, i) => ({
    ticker: ['GGRM', 'UNVR', 'TLKM', 'ASII', 'BBCA', 'EXCL', 'ADRO', 'BYAN'][i % 8] || `STK${i}`,
    name: ['Gudang Garam', 'Unilever', 'Telkom', 'Astra', 'BCA', 'XL Axiata', 'Adaro', 'Bayan'][i % 8] || `Stock ${i}`,
    price: [24250, 2850, 3950, 6225, 10250, 2175, 3125, 18750][i % 8],
    change: [500, 75, -25, 100, 75, 50, -75, -250][i % 8],
    changePercent: [2.11, 1.56, 0.74, 1.63, 0.74, 2.35, -2.34, -1.32][i % 8],
    volume: Math.random() * 50_000_000,
    value: Math.random() * 1e12,
    frequency: Math.random() * 50000,
    open: 24000,
    high: 24500,
    low: 23650,
    previousClose: 23750,
    sector: ['Consumer', 'Consumer', 'Telecom', 'Automotive', 'Finance', 'Telecom', 'Energy', 'Energy'][i % 8],
  }))
}

function getMockLosers(count: number): TopLoser[] {
  return Array.from({length: count}, (_, i) => ({
    ticker: ['HMSP', 'ADRO', 'BYAN', 'INDF', 'UNVR'][i % 5],
    name: ['HM Sampoerna', 'Adaro Energy', 'Bayan Resources', 'Indofood', 'Unilever Indonesia'][i % 5],
    price: [825, 3125, 18750, 6725, 2850][i % 5],
    change: [-15, -75, -250, -50, -50][i % 5],
    changePercent: [-1.79, -2.34, -1.32, -0.74, -1.72][i % 5],
    volume: Math.random() * 30_000_000,
    value: Math.random() * 0.5e12,
    frequency: Math.random() * 30000,
    open: 840,
    high: 845,
    low: 820,
    previousClose: 840,
    sector: ['Consumer', 'Energy', 'Energy', 'Consumer', 'Consumer'][i % 5],
  }))
}
