// Yahoo Finance API proxy for IDX stocks (free, no API key required)

const BASE = 'https://query1.finance.yahoo.com/v8/finance/chart'
const QUOTE = 'https://query1.finance.yahoo.com/v7/finance/quote'
const SEARCH_URL = 'https://query1.finance.yahoo.com/v1/finance/search'

function yh(ticker: string) {
  return ticker.endsWith('.JK') ? ticker : `${ticker}.JK`
}

export async function fetchQuote(ticker: string) {
  try {
    const url = `${QUOTE}?symbols=${yh(ticker)}`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 60 }
    })
    if (!res.ok) return null
    const data = await res.json()
    const q = data?.quoteResponse?.result?.[0]
    if (!q) return null
    return {
      ticker: ticker.toUpperCase(),
      name: q.longName || q.shortName || ticker,
      price: q.regularMarketPrice || q.marketPrice,
      change: q.regularMarketChange,
      changePercent: q.regularMarketChangePercent,
      open: q.regularMarketOpen,
      high: q.regularMarketDayHigh,
      low: q.regularMarketDayLow,
      volume: q.regularMarketVolume,
      marketCap: q.marketCap,
      peRatio: q.trailingPE,
      pbRatio: q.priceToBook,
      dividendYield: q.dividendYield,
      previousClose: q.regularMarketPreviousClose,
      fiftyTwoWeekHigh: q.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: q.fiftyTwoWeekLow,
      avgVolume: q.averageDailyVolume3Month,
      sector: q.sector,
      industry: q.industry,
    }
  } catch {
    return null
  }
}

export async function fetchChart(ticker: string, range = '6mo', interval = '1d') {
  try {
    const url = `${BASE}/${yh(ticker)}?range=${range}&interval=${interval}`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 300 }
    })
    if (!res.ok) return []
    const data = await res.json()
    const result = data?.chart?.result?.[0]
    if (!result) return []
    const timestamps = result.timestamp || []
    const quotes = result.indicators?.quote?.[0] || {}
    
    const candles: Array<{ time: string; open: number; high: number; low: number; close: number; volume: number }> = []
    for (let i = 0; i < timestamps.length; i++) {
      const o = quotes.open?.[i]
      if (o && o > 0) {
        candles.push({
          time: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
          open: o,
          high: quotes.high?.[i] || o,
          low: quotes.low?.[i] || o,
          close: quotes.close?.[i] || o,
          volume: quotes.volume?.[i] || 0,
        })
      }
    }
    return candles
  } catch {
    return []
  }
}

export async function searchStocks(query: string) {
  try {
    const url = `${SEARCH_URL}?q=${encodeURIComponent(query)}&lang=en-US&region=ID&quotesCount=10`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 60 }
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.quotes || [])
      .filter((q: { exchange: string; symbol: string }) => q.exchange === 'JKT' || (q.symbol || '').endsWith('.JK'))
      .map((q: { symbol: string; longname: string; shortname: string; exchange: string; sector: string }) => ({
        ticker: (q.symbol || '').replace('.JK', ''),
        name: q.longname || q.shortname || '',
        exchange: q.exchange,
        sector: q.sector || '',
      }))
  } catch {
    return []
  }
}

export async function fetchIHSG() {
  return fetchQuote('^JKSE')
}

export async function fetchMultipleQuotes(tickers: string[]) {
  try {
    const symbols = tickers.map(t => yh(t)).join(',')
    const url = `${QUOTE}?symbols=${symbols}`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 60 }
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data?.quoteResponse?.result || []).map((q: { symbol: string; longName: string; shortName: string; regularMarketPrice: number; regularMarketChange: number; regularMarketChangePercent: number; regularMarketVolume: number; marketCap: number; sector: string }) => ({
      ticker: (q.symbol || '').replace('.JK', ''),
      name: q.longName || q.shortName || '',
      price: q.regularMarketPrice,
      change: q.regularMarketChange,
      changePercent: q.regularMarketChangePercent,
      volume: q.regularMarketVolume,
      marketCap: q.marketCap,
      sector: q.sector,
    }))
  } catch {
    return []
  }
}
