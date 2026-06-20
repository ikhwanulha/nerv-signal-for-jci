/* eslint-disable @typescript-eslint/no-explicit-any */
// Yahoo Finance API proxy for IDX stocks
// Uses v8/chart endpoint (still free) + v1/search (still free)

function yh(ticker: string) {
  // Skip .JK suffix for index symbols (^JKSE) or when already has .JK
  if (ticker.startsWith('^') || ticker.endsWith('.JK')) return ticker
  return `${ticker}.JK`
}

async function fetchFromYahoo(url: string) {
  const res = await fetch(url, {
    headers: { 
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Accept': 'application/json'
    },
    next: { revalidate: 60 }
  })
  if (!res.ok) return null
  return res.json()
}

export async function fetchQuote(ticker: string) {
  try {
    // Use chart endpoint since v7/quote is blocked
    const data = await fetchFromYahoo(
      `https://query1.finance.yahoo.com/v8/finance/chart/${yh(ticker)}?range=5d&interval=1d`
    )
    const result = data?.chart?.result?.[0]
    if (!result) return null
    
    const meta = result.meta || {}
    const quotes = result.indicators?.quote?.[0] || {}
    const timestamps = result.timestamp || []
    const lastIdx = timestamps.length - 1
    
    return {
      ticker: ticker.toUpperCase(),
      name: meta.shortName || meta.longName || ticker,
      price: meta.regularMarketPrice || (quotes.close?.[lastIdx] || 0),
      change: meta.regularMarketPrice ? (meta.regularMarketPrice - meta.previousClose || meta.chartPreviousClose) : 0,
      changePercent: meta.regularMarketPrice ? ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100) : 0,
      open: quotes.open?.[lastIdx] || 0,
      high: meta.regularMarketDayHigh || Math.max(...(quotes.high?.filter(Boolean) || [0])),
      low: meta.regularMarketDayLow || Math.min(...(quotes.low?.filter(Boolean) || [Infinity])),
      volume: meta.regularMarketVolume || quotes.volume?.[lastIdx] || 0,
      marketCap: null,
      peRatio: null,
      pbRatio: null,
      dividendYield: null,
      previousClose: meta.chartPreviousClose || meta.previousClose || 0,
      fiftyTwoWeekHigh: null,
      fiftyTwoWeekLow: null,
      avgVolume: null,
      sector: null,
      industry: null,
    }
  } catch {
    return null
  }
}

export async function fetchChart(ticker: string, range = '6mo', interval = '1d') {
  try {
    const data = await fetchFromYahoo(
      `https://query1.finance.yahoo.com/v8/finance/chart/${yh(ticker)}?range=${range}&interval=${interval}`
    )
    const result = data?.chart?.result?.[0]
    if (!result) return []
    const timestamps: number[] = result.timestamp || []
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
    const data = await fetchFromYahoo(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&lang=en-US&region=ID&quotesCount=10`
    )
    const results: Array<{ ticker: string; name: string; exchange: string; sector: string }> = []
    for (const q of (data?.quotes || [])) {
      if (q.exchange === 'JKT' || (q.symbol || '').endsWith('.JK')) {
        results.push({
          ticker: (q.symbol || '').replace('.JK', ''),
          name: q.longname || q.shortname || '',
          exchange: q.exchange,
          sector: q.sector || '',
        })
      }
    }
    return results
  } catch {
    return []
  }
}

export async function fetchIHSG() {
  return fetchQuote('^JKSE')
}

export async function fetchMultipleQuotes(tickers: string[]) {
  const results = await Promise.allSettled(tickers.map(t => fetchQuote(t)))
  return results
    .filter(r => r.status === 'fulfilled' && r.value)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map(r => (r as PromiseFulfilledResult<any>).value)
}
