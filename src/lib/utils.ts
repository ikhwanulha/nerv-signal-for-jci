import { SignalDirection, PortfolioPosition } from '@/types'

export function formatPrice(price: number): string {
  if (!price && price !== 0) return '-'
  if (price >= 1_000_000_000) return `Rp${(price / 1_000_000_000).toFixed(2)}T`
  if (price >= 1_000_000) return `Rp${(price / 1_000_000).toFixed(2)}M`
  if (price >= 1_000) return `Rp${price.toLocaleString('id-ID', { minimumFractionDigits: 0 })}`
  return `Rp${price.toLocaleString('id-ID', { minimumFractionDigits: 2 })}`
}

export function formatNumber(n: number): string {
  if (!n && n !== 0) return '-'
  if (n >= 1_000_000_000_000) return `${(n / 1_000_000_000_000).toFixed(2)}T`
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toFixed(0)
}

export function formatPercent(p: number): string {
  if (p === undefined || p === null) return '-'
  return `${p >= 0 ? '+' : ''}${p.toFixed(2)}%`
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function signalColor(dir: SignalDirection): string {
  switch(dir) {
    case 'STRONG_BUY': return '#00c853'
    case 'BUY': return '#69f0ae'
    case 'SELL': return '#ff1744'
    case 'STRONG_SELL': return '#d50000'
    case 'NEUTRAL': return '#ffab00'
  }
}

export function signalLabel(dir: SignalDirection): string {
  switch(dir) {
    case 'STRONG_BUY': return 'STRONG BUY'
    case 'BUY': return 'BUY'
    case 'SELL': return 'SELL'
    case 'STRONG_SELL': return 'STRONG SELL'
    case 'NEUTRAL': return 'NEUTRAL'
  }
}

export function calculatePnL(position: PortfolioPosition): { pnl: number; pnlPercent: number } {
  const pnl = (position.currentPrice - position.entryPrice) * position.quantity
  const pnlPercent = ((position.currentPrice - position.entryPrice) / position.entryPrice) * 100
  return { pnl, pnlPercent }
}

export function calculateRiskReward(entry: number, stopLoss: number, takeProfit: number): number {
  const risk = Math.abs(entry - stopLoss)
  const reward = Math.abs(takeProfit - entry)
  return risk > 0 ? Math.round((reward / risk) * 10) / 10 : 0
}

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, ms: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

export function getSignalBadge(confidence: number): { label: string; color: string } {
  if (confidence >= 85) return { label: 'HIGH', color: '#00c853' }
  if (confidence >= 70) return { label: 'MEDIUM', color: '#ffab00' }
  return { label: 'LOW', color: '#ff6d00' }
}
