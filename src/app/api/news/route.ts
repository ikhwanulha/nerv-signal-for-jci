import { NextResponse } from 'next/server'

// RSS feed sources for Indonesian stock/corporate news
const RSS_FEEDS = [
  { name: 'Kontan - Market', url: 'https://www.kontan.co.id/rss/market' },
  { name: 'Kontan - Ekonomi', url: 'https://www.kontan.co.id/rss/ekonomi' },
  { name: 'Bisnis - Market', url: 'https://kawasan.bisnis.com/rss/market' },
  { name: 'CNBC Indonesia', url: 'https://www.cnbcindonesia.com/rss' },
  { name: 'Investor Daily', url: 'https://investor.id/rss.xml' },
]

async function parseRSS(url: string, source: string) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 300 }
    })
    if (!res.ok) return []
    const xml = await res.text()
    
    // Simple XML parsing for RSS items
    const items: Array<{
      title: string; link: string; pubDate: string; description: string; tickers: string[]
    }> = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match
    
    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1]
      const title = itemXml.match(/<title>([^<]*)<\/title>/)?.[1] || ''
      const link = itemXml.match(/<link>([^<]*)<\/link>/)?.[1] || ''
      const pubDate = itemXml.match(/<pubDate>([^<]*)<\/pubDate>/)?.[1] || ''
      const description = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] || 
                          itemXml.match(/<description>([^<]*)<\/description>/)?.[1] || ''
      
      // Extract tickers from title and description (look for common IDX tickers)
      const tickerPattern = /\b(BBCA|BBRI|BMRI|TLKM|ASII|UNVR|GGRM|ADRO|BYAN|KLBF|ICBP|INDF|HMSP|CPIN|EXCL|ISAT|SMGR|WSKT|WIKA|PGAS|PTBA|MEDC|AKRA|MYRX|LPKR|BSDE|PWON|CTRA|ADHI|PTPP|ANTM|INCO|BRPT|JSMR|JKSE)\b/g
      const tickers = [...new Set((title + ' ' + description).match(tickerPattern) || [])]
      
      if (title && link) {
        items.push({ title, link, pubDate, description, tickers })
      }
    }
    
    return items.slice(0, 10).map(item => ({
      id: `news-${Buffer.from(item.link).toString('base64').slice(0, 16)}`,
      title: item.title.replace(/<!\[CDATA\[|\]\]>/g, '').trim(),
      source,
      url: item.link,
      timestamp: new Date(item.pubDate).getTime() || Date.now(),
      summary: item.description.replace(/<[^>]*>/g, '').slice(0, 300).trim(),
      tickers: (item as unknown as { tickers: string[] }).tickers || [],
    }))
  } catch {
    return []
  }
}

export async function GET() {
  try {
    const results = await Promise.allSettled(
      RSS_FEEDS.map(feed => parseRSS(feed.url, feed.name))
    )
    
    const news = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => (r as PromiseFulfilledResult<unknown[]>).value as Array<{ id: string; title: string; source: string; url: string; timestamp: number; summary: string; tickers: string[] }>)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 50)

    return NextResponse.json(news)
  } catch (err) {
    console.error('News API error:', err)
    return NextResponse.json([])
  }
}
