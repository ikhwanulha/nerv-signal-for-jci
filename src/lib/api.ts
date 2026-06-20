import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { StockQuote, IHSGQuote, CandleData, TradingSignal, TopGainer, TopLoser, SectorPerformance, NewsItem } from '@/types'
import { idxStocks } from '@/data/idx-stocks'

const BASE_PRICES: Record<string, number> = {}

function getBasePrice(ticker: string, marketCap?: number): number {
  if (!BASE_PRICES[ticker]) {
    if (marketCap && marketCap > 500) BASE_PRICES[ticker] = 5000 + Math.random() * 50000
    else if (marketCap && marketCap > 100) BASE_PRICES[ticker] = 1000 + Math.random() * 10000
    else BASE_PRICES[ticker] = 100 + Math.random() * 5000
    BASE_PRICES[ticker] = Math.round(BASE_PRICES[ticker] / 25) * 25
  }
  return BASE_PRICES[ticker]
}

function simulatePrice(ticker: string, marketCap?: number) {
  const base = getBasePrice(ticker, marketCap)
  const volatility = base * 0.02
  const time = Date.now()
  const drift = Math.sin(time / 30000 + ticker.charCodeAt(0)) * volatility * 0.3
  const noise = (Math.random() - 0.5) * volatility * 0.5
  const price = Math.round(base + drift + noise)
  const open = Math.round(base - volatility * 0.1 + Math.random() * volatility * 0.2)
  const high = Math.round(Math.max(price, open) + Math.random() * volatility * 0.3)
  const low = Math.round(Math.min(price, open) - Math.random() * volatility * 0.3)
  const prevClose = Math.round(base)
  const change = price - prevClose
  const changePercent = (change / prevClose) * 100
  const volume = Math.round(100000 + Math.random() * 10000000 + Math.sin(time / 60000 + ticker.charCodeAt(1)) * 5000000)
  const value = volume * price
  const frequency = Math.round(volume / 1000 + Math.random() * 5000)
  return { price, open, high, low, previousClose: prevClose, change, changePercent, volume, value, frequency }
}

function getCompanyName(ticker: string): string {
  const stock = idxStocks.find(s => s.ticker === ticker)
  return stock?.name || `${ticker} Tbk`
}

// ─── Properly typed hooks ───

export function useIHSG(): UseQueryResult<IHSGQuote, Error> {
  return useQuery<IHSGQuote, Error>({
    queryKey: ['ihsg'],
    queryFn: async () => {
      const time = Date.now()
      const baseIHSG = 7234.567
      const drift = Math.sin(time / 25000) * 50
      const noise = (Math.random() - 0.5) * 15
      const price = Math.round((baseIHSG + drift + noise) * 1000) / 1000
      const prevClose = 7189.337
      const change = Math.round((price - prevClose) * 1000) / 1000
      const changePercent = Math.round((change / prevClose) * 10000) / 100
      return {
        price, change, changePercent,
        open: Math.round((baseIHSG - 30 + Math.random() * 60) * 1000) / 1000,
        high: Math.round((price + Math.random() * 20) * 1000) / 1000,
        low: Math.round((price - Math.random() * 20) * 1000) / 1000,
        volume: 15000000000 + Math.round(Math.random() * 5000000000),
        value: 12e12 + Math.random() * 3e12,
        frequency: 1000000 + Math.round(Math.random() * 400000),
        previousClose: prevClose,
      }
    },
    refetchInterval: 5000,
  })
}

export function useMarketStats(): UseQueryResult<{ advancing: number; declining: number; unchanged: number; total: number }, Error> {
  return useQuery({
    queryKey: ['marketStats'],
    queryFn: async () => {
      const advancing = 180 + Math.floor(Math.random() * 60)
      const declining = 120 + Math.floor(Math.random() * 40)
      const unchanged = 80 + Math.floor(Math.random() * 30)
      return { advancing, declining, unchanged, total: advancing + declining + unchanged }
    },
    refetchInterval: 15000,
  })
}

export function useTopGainers(): UseQueryResult<TopGainer[], Error> {
  return useQuery<TopGainer[], Error>({
    queryKey: ['topGainers'],
    queryFn: async () => {
      return idxStocks
        .map(s => {
          const p = simulatePrice(s.ticker, s.marketCap)
          return { ticker: s.ticker, name: s.name, ...p, sector: s.sector }
        })
        .sort((a, b) => b.changePercent - a.changePercent)
        .slice(0, 15) as TopGainer[]
    },
    refetchInterval: 5000,
  })
}

export function useTopLosers(): UseQueryResult<TopLoser[], Error> {
  return useQuery<TopLoser[], Error>({
    queryKey: ['topLosers'],
    queryFn: async () => {
      return idxStocks
        .map(s => {
          const p = simulatePrice(s.ticker, s.marketCap)
          return { ticker: s.ticker, name: s.name, ...p, sector: s.sector }
        })
        .sort((a, b) => a.changePercent - b.changePercent)
        .slice(0, 15) as TopLoser[]
    },
    refetchInterval: 5000,
  })
}

export function useSectors(): UseQueryResult<SectorPerformance[], Error> {
  return useQuery<SectorPerformance[], Error>({
    queryKey: ['sectors'],
    queryFn: async () => {
      const sectors = [...new Set(idxStocks.map(s => s.sector))]
      return sectors.map(sector => {
        const sectorStocks = idxStocks.filter(s => s.sector === sector)
        const totalChange = sectorStocks.reduce((sum, s) => {
          const p = simulatePrice(s.ticker, s.marketCap)
          return sum + p.changePercent
        }, 0)
        const totalVolume = sectorStocks.reduce((sum, s) => {
          const p = simulatePrice(s.ticker, s.marketCap)
          return sum + p.volume
        }, 0)
        return {
          sector,
          change: totalChange / sectorStocks.length,
          changePercent: totalChange / sectorStocks.length,
          volume: totalVolume,
          marketCap: sectorStocks.reduce((sum, s) => sum + (s.marketCap || 0), 0) * 1e9,
        }
      })
    },
    refetchInterval: 10000,
  })
}

export function useAllStocks(): UseQueryResult<StockQuote[], Error> {
  return useQuery<StockQuote[], Error>({
    queryKey: ['allStocks'],
    queryFn: async () => {
      return idxStocks.map(s => {
        const p = simulatePrice(s.ticker, s.marketCap)
        return {
          ticker: s.ticker,
          name: s.name,
          ...p,
          marketCap: s.marketCap ? s.marketCap * 1e9 : undefined,
          sector: s.sector,
        }
      })
    },
    refetchInterval: 5000,
  })
}

export function useStockDetail(ticker: string | null): UseQueryResult<StockQuote | null, Error> {
  return useQuery<StockQuote | null, Error>({
    queryKey: ['stockDetail', ticker],
    queryFn: async () => {
      if (!ticker) return null
      const stock = idxStocks.find(s => s.ticker === ticker)
      if (!stock) return null
      const p = simulatePrice(ticker, stock.marketCap)
      return {
        ticker: stock.ticker,
        name: stock.name,
        ...p,
        marketCap: stock.marketCap ? stock.marketCap * 1e9 : undefined,
        sector: stock.sector,
        peRatio: 10 + Math.random() * 30,
        pbRatio: 1 + Math.random() * 5,
        dividendYield: Math.random() * 5,
      } as StockQuote
    },
    refetchInterval: 5000,
    enabled: !!ticker,
  })
}

export function useStockCandles(ticker: string | null, interval: string = '1M'): UseQueryResult<CandleData[], Error> {
  return useQuery<CandleData[], Error>({
    queryKey: ['candles', ticker, interval],
    queryFn: async () => {
      if (!ticker) return []
      const stock = idxStocks.find(s => s.ticker === ticker)
      const basePrice = stock?.marketCap ? getBasePrice(ticker, stock.marketCap) : 5000
      const count = interval === '1D' ? 93 : interval === '1W' ? 5 * 24 : interval === '1M' ? 22 :
        interval === '3M' ? 66 : interval === '6M' ? 132 : interval === '1Y' ? 264 : 528
      const candles: CandleData[] = []
      const now = new Date()
      let price = basePrice
      for (let i = count; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        const vol = price * 0.025
        const open = price + (Math.random() - 0.5) * vol
        const close = open + (Math.random() - 0.47) * vol
        const high = Math.max(open, close) + Math.random() * vol * 0.4
        const low = Math.min(open, close) - Math.random() * vol * 0.4
        candles.push({
          time: date.toISOString().split('T')[0],
          open: Math.round(open),
          high: Math.round(high),
          low: Math.round(low),
          close: Math.round(close),
          volume: Math.round(Math.random() * 50000000),
        })
        price = close
      }
      return candles
    },
    enabled: !!ticker,
    refetchInterval: 30000,
  })
}

export function useSignals(): UseQueryResult<TradingSignal[], Error> {
  return useQuery<TradingSignal[], Error>({
    queryKey: ['signals'],
    queryFn: async () => {
      return (idxStocks
        .filter(() => Math.random() > 0.85)
        .slice(0, 10)
        .map((s, i) => {
          const p = simulatePrice(s.ticker, s.marketCap)
          const rsi = 30 + Math.random() * 40
          const isBullish = rsi < 40 || rsi > 60 ? rsi < 40 : Math.random() > 0.5
          const direction = rsi < 35 ? 'STRONG_BUY' : rsi > 65 ? 'STRONG_SELL' : isBullish ? 'BUY' : 'SELL'
          const price = p.price
          const sl = direction.includes('BUY') ? price * (0.92 + Math.random() * 0.04) : price * (1.04 + Math.random() * 0.04)
          const tp1 = direction.includes('BUY') ? price * (1.05 + Math.random() * 0.05) : price * (0.90 + Math.random() * 0.05)
          const tp2 = direction.includes('BUY') ? price * (1.10 + Math.random() * 0.08) : price * (0.80 + Math.random() * 0.08)
          const rr = Math.abs(price - tp1) / Math.abs(price - sl)
          return {
            id: `sig-${s.ticker}-${Date.now()}`,
            ticker: s.ticker,
            name: s.name,
            direction: direction as TradingSignal['direction'],
            entryPrice: Math.round(price),
            stopLoss: Math.round(sl),
            takeProfit1: Math.round(tp1),
            takeProfit2: Math.round(tp2),
            riskReward: Math.round(rr * 10) / 10,
            confidence: 55 + Math.floor(Math.random() * 40),
            reason: direction.includes('BUY')
              ? `RSI at ${Math.round(rsi)} (oversold). MACD bullish crossover detected.`
              : `RSI at ${Math.round(rsi)} (overbought). MACD bearish crossover.`,
            indicators: {
              rsi: Math.round(rsi),
              macd: direction.includes('BUY') ? 'Bullish Cross' : 'Bearish Cross',
              ma: direction.includes('BUY') ? 'Price above MA50' : 'Price below MA50',
              bollinger: direction.includes('BUY') ? 'Lower band touch' : 'Upper band touch',
            },
            timestamp: Date.now(),
            timeframe: '1D',
          }
        })) as TradingSignal[]
    },
    refetchInterval: 15000,
  })
}

const FULL_NEWS: NewsItem[] = [
  { id: 'n1', title: 'IHSG Ditutup Menguat, Investor Asing Catatkan Net Buy Terbesar Tahun Ini', source: 'Kontan', url: 'https://investasi.kontan.co.id/', timestamp: Date.now() - 1800000, sentiment: 'positive', tickers: ['BBCA', 'BBRI'], summary: 'Indeks Harga Saham Gabungan (IHSG) ditutup menguat pada perdagangan hari ini. Penguatan didorong oleh aksi beli investor asing yang mencatatkan net buy terbesar sepanjang tahun ini.' },
  { id: 'n2', title: 'Bank Indonesia Pertahankan Suku Bunga di 6%', source: 'Bisnis.com', url: 'https://ekonomi.bisnis.com/', timestamp: Date.now() - 3600000, sentiment: 'neutral', tickers: ['BBCA', 'BBRI', 'BMRI'], summary: 'Bank Indonesia memutuskan untuk mempertahankan suku bunga acuan (BI-Rate) di level 6%.' },
  { id: 'n3', title: 'BBRI Cetak Laba Bersih Rp 15 Triliun di Q1-2025, Tumbuh 12% YoY', source: 'CNBC Indonesia', url: 'https://www.cnbcindonesia.com/', timestamp: Date.now() - 5400000, sentiment: 'positive', tickers: ['BBRI'], summary: 'PT Bank Rakyat Indonesia membukukan laba bersih Rp 15 triliun pada Q1 2025.' },
  { id: 'n4', title: 'TLKM Ekspansi Data Center Rp 5 Triliun', source: 'Kontan', url: 'https://investasi.kontan.co.id/', timestamp: Date.now() - 7200000, sentiment: 'positive', tickers: ['TLKM'], summary: 'Telkom investasi Rp 5 triliun untuk ekspansi data center di tiga kota.' },
  { id: 'n5', title: 'Harga Batubara Anjlok, Saham ADRO dan BYAN Tertekan', source: 'Bloomberg Technoz', url: 'https://www.bloombergtechnoz.com/', timestamp: Date.now() - 9000000, sentiment: 'negative', tickers: ['ADRO', 'BYAN'], summary: 'Harga batubara turun ke level terendah 6 bulan, saham emiten terkoreksi.' },
  { id: 'n6', title: 'RUPST GGRM Setujui Dividen Rp 2.000 per Saham', source: 'Investor Daily', url: 'https://investor.id/', timestamp: Date.now() - 10800000, sentiment: 'positive', tickers: ['GGRM'], summary: 'Dividen yield mencapai 8,2%, salah satu tertinggi di IDX.' },
  { id: 'n7', title: 'Pemerintah Umumkan Insentif Fiskal Rp 100 Triliun untuk Manufaktur', source: 'Kemenkeu', url: 'https://www.kemenkeu.go.id/', timestamp: Date.now() - 12600000, sentiment: 'positive', tickers: ['ASII', 'INDF', 'SMGR'], summary: 'Paket insentif fiskal untuk mendorong sektor manufaktur nasional.' },
  { id: 'n8', title: 'ASII Catat Penjualan 150.000 Unit Mobil di Q1', source: 'Bisnis.com', url: 'https://otomotif.bisnis.com/', timestamp: Date.now() - 14400000, sentiment: 'positive', tickers: ['ASII'], summary: 'Astra kuasai 55% pangsa pasar otomotif nasional.' },
]

export function useNews(): UseQueryResult<NewsItem[], Error> {
  return useQuery<NewsItem[], Error>({
    queryKey: ['news'],
    queryFn: async () => FULL_NEWS,
    refetchInterval: 60000,
  })
}

export function useFilteredStocks(filters: { sector?: string; priceMin?: number; priceMax?: number; search?: string }): UseQueryResult<StockQuote[], Error> {
  return useQuery<StockQuote[], Error>({
    queryKey: ['filteredStocks', filters],
    queryFn: async () => {
      return idxStocks.map(s => {
        const p = simulatePrice(s.ticker, s.marketCap)
        return { ticker: s.ticker, name: s.name, ...p, marketCap: s.marketCap ? s.marketCap * 1e9 : undefined, sector: s.sector }
      }).filter(s => {
        if (filters.sector && s.sector !== filters.sector) return false
        if (filters.priceMin && s.price < filters.priceMin) return false
        if (filters.priceMax && s.price > filters.priceMax) return false
        if (filters.search) {
          const q = filters.search.toUpperCase()
          if (!s.ticker.includes(q) && !s.name.toUpperCase().includes(q)) return false
        }
        return true
      })
    },
    refetchInterval: 5000,
  })
}

export function useUnusualVolume(): UseQueryResult<any[], Error> {
  return useQuery<any[], Error>({
    queryKey: ['unusualVolume'],
    queryFn: async () => {
      return idxStocks.map(s => {
        const p = simulatePrice(s.ticker, s.marketCap)
        const avgVol = 1000000 + Math.random() * 5000000
        const ratio = p.volume / avgVol
        return { ...s, ...p, avgVolume: avgVol, volumeRatio: ratio }
      }).filter(s => s.volumeRatio > 1.5).sort((a, b) => b.volumeRatio - a.volumeRatio).slice(0, 20)
    },
    refetchInterval: 10000,
  })
}

export function useSearchStocks(query: string): UseQueryResult<StockQuote[], Error> {
  return useQuery<StockQuote[], Error>({
    queryKey: ['searchStocks', query],
    queryFn: async () => {
      if (!query || query.length < 1) return []
      const q = query.toUpperCase()
      return idxStocks.filter(s => s.ticker.includes(q) || s.name.toUpperCase().includes(q)).slice(0, 20).map(s => {
        const p = simulatePrice(s.ticker, s.marketCap)
        return { ticker: s.ticker, name: s.name, ...p, sector: s.sector }
      })
    },
    enabled: query.length >= 1,
  })
}
