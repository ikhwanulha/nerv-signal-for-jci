import { NextResponse } from 'next/server'
import { fetchQuote, fetchChart, fetchIHSG, searchStocks, fetchMultipleQuotes } from '@/lib/yahooFinance'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') || 'quote'
  const ticker = searchParams.get('ticker') || ''
  const range = searchParams.get('range') || '6mo'
  const interval = searchParams.get('interval') || '1d'
  const query = searchParams.get('query') || ''
  const tickers = searchParams.get('tickers') || ''

  try {
    switch (action) {
      case 'quote':
        if (!ticker) return NextResponse.json({ error: 'ticker required' }, { status: 400 })
        const quote = await fetchQuote(ticker)
        return NextResponse.json(quote || { error: 'not found' }, { status: quote ? 200 : 404 })

      case 'chart':
        if (!ticker) return NextResponse.json({ error: 'ticker required' }, { status: 400 })
        const chart = await fetchChart(ticker, range, interval)
        return NextResponse.json(chart)

      case 'ihsg':
        const ihsg = await fetchIHSG()
        return NextResponse.json(ihsg || { error: 'not found' }, { status: ihsg ? 200 : 404 })

      case 'search':
        if (!query) return NextResponse.json({ error: 'query required' }, { status: 400 })
        const results = await searchStocks(query)
        return NextResponse.json(results)

      case 'multi':
        const list = tickers.split(',').map(t => t.trim()).filter(Boolean)
        if (list.length === 0) return NextResponse.json({ error: 'tickers required' }, { status: 400 })
        const quotes = await fetchMultipleQuotes(list)
        return NextResponse.json(quotes)

      default:
        return NextResponse.json({ error: 'unknown action' }, { status: 400 })
    }
  } catch (err) {
    console.error('Data API error:', err)
    return NextResponse.json({ error: 'internal error' }, { status: 500 })
  }
}
