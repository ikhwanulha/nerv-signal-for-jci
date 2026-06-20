'use client'
import { useStore } from '@/store/useStore'
import { useState, useMemo } from 'react'
import { cn, formatPrice } from '@/lib/utils'

const LOTS = 100 // 1 lot = 100 shares
const BROKER_FEE_BUY = 0.001 // 0.1%
const BROKER_FEE_SELL = 0.002 // 0.2%
const VAT_ON_BROKER = 0.1 // 10% of broker fee
const CLEARING_FEE = 0.00025 // 0.025%

interface FeeBreakdown {
  label: string
  rate: string
  amount: number
}

export function KalkulatorLot() {
  const [price, setPrice] = useState('5000')
  const [lots, setLots] = useState('1')

  const result = useMemo(() => {
    const p = parseFloat(price)
    const l = parseInt(lots)
    if (isNaN(p) || isNaN(l) || p <= 0 || l <= 0) return null

    const totalShares = l * LOTS
    const totalValue = p * totalShares

    // Buy fees
    const brokerFeeBuy = totalValue * BROKER_FEE_BUY
    const vatBuy = brokerFeeBuy * VAT_ON_BROKER
    const clearingBuy = totalValue * CLEARING_FEE
    const totalBuyFees = brokerFeeBuy + vatBuy + clearingBuy
    const totalBuyCost = totalValue + totalBuyFees

    // Sell fees
    const brokerFeeSell = totalValue * BROKER_FEE_SELL
    const vatSell = brokerFeeSell * VAT_ON_BROKER
    const clearingSell = totalValue * CLEARING_FEE
    const totalSellFees = brokerFeeSell + vatSell + clearingSell
    const totalSellProceeds = totalValue - totalSellFees

    const breakEvenPrice = (totalBuyCost + totalSellFees) / totalShares

    const buyFees: FeeBreakdown[] = [
      { label: 'Broker Fee (Buy)', rate: `${(BROKER_FEE_BUY * 100).toFixed(1)}%`, amount: brokerFeeBuy },
      { label: 'VAT (10% of Broker)', rate: `${(VAT_ON_BROKER * 100).toFixed(0)}%`, amount: vatBuy },
      { label: 'Clearing Fee', rate: `${(CLEARING_FEE * 100).toFixed(2)}%`, amount: clearingBuy },
    ]

    const sellFees: FeeBreakdown[] = [
      { label: 'Broker Fee (Sell)', rate: `${(BROKER_FEE_SELL * 100).toFixed(1)}%`, amount: brokerFeeSell },
      { label: 'VAT (10% of Broker)', rate: `${(VAT_ON_BROKER * 100).toFixed(0)}%`, amount: vatSell },
      { label: 'Clearing Fee', rate: `${(CLEARING_FEE * 100).toFixed(2)}%`, amount: clearingSell },
    ]

    return {
      totalShares,
      totalValue,
      buyFees,
      totalBuyFees,
      totalBuyCost,
      sellFees,
      totalSellFees,
      totalSellProceeds,
      breakEvenPrice,
      roundLot: l,
    }
  }, [price, lots])

  return (
    <div className="p-2 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold font-mono text-[var(--text-primary)]">
            🔢 KALKULATOR LOT
          </h1>
          <p className="text-[10px] text-[var(--text-dim)] font-mono">
            IDX lot calculator with fee breakdown (1 lot = {LOTS} shares)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-2">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-2">
          <div className="terminal-panel p-3">
            <div className="terminal-header mb-3">
              <span>INPUT</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="stat-label block mb-1">Stock Price (Rp)</label>
                <input
                  className="input-terminal text-sm"
                  type="number"
                  placeholder="5000"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  min="1"
                />
              </div>
              <div>
                <label className="stat-label block mb-1">Lots ({LOTS} shares each)</label>
                <input
                  className="input-terminal text-sm"
                  type="number"
                  placeholder="1"
                  value={lots}
                  onChange={e => setLots(e.target.value)}
                  min="1"
                />
              </div>
              {result && (
                <div className="bg-[var(--bg-primary)] p-3 rounded space-y-1 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-dim)]">Total Shares</span>
                    <span className="font-bold text-[var(--text-primary)]">{result.totalShares.toLocaleString()} shares</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-dim)]">Round Lots</span>
                    <span className="font-bold text-[var(--text-primary)]">{result.roundLot} lot{result.roundLot > 1 ? 's' : ''}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick presets */}
          <div className="terminal-panel p-2">
            <div className="text-[10px] font-mono text-[var(--text-dim)] mb-1">Quick Input</div>
            <div className="flex flex-wrap gap-1">
              {[
                { label: 'BBCA ~9500', p: '9500', l: '1' },
                { label: 'BBRI ~4500', p: '4500', l: '1' },
                { label: 'TLKM ~2800', p: '2800', l: '2' },
                { label: 'GGRM ~18000', p: '18000', l: '1' },
                { label: 'ASII ~5000', p: '5000', l: '2' },
              ].map(preset => (
                <button
                  key={preset.label}
                  onClick={() => { setPrice(preset.p); setLots(preset.l) }}
                  className="btn-terminal text-[9px]"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-3 space-y-2">
          {result ? (
            <>
              {/* Main Result Card */}
              <div className="terminal-panel p-4 border-l-2 border-[var(--accent)]">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="stat-label">Total Investment Value</div>
                    <div className="text-lg font-bold font-mono mt-1">{formatPrice(result.totalValue)}</div>
                  </div>
                  <div>
                    <div className="stat-label">Total Buy Cost (incl. fees)</div>
                    <div className="text-lg font-bold font-mono mt-1">{formatPrice(result.totalBuyCost)}</div>
                  </div>
                  <div>
                    <div className="stat-label">Total Sell Proceeds (after fees)</div>
                    <div className="text-lg font-bold font-mono mt-1 text-green">{formatPrice(result.totalSellProceeds)}</div>
                  </div>
                  <div>
                    <div className="stat-label">Break-Even Price</div>
                    <div className="text-lg font-bold font-mono mt-1 text-[var(--amber)]">{formatPrice(result.breakEvenPrice)}</div>
                  </div>
                </div>
              </div>

              {/* Fee Breakdown: Buy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="terminal-panel">
                  <div className="terminal-header">
                    <span>BUY FEES</span>
                    <span className="text-green">{formatPrice(result.totalBuyFees)}</span>
                  </div>
                  <div className="divide-y divide-[var(--border)]/50">
                    {result.buyFees.map(fee => (
                      <div key={fee.label} className="flex items-center justify-between px-3 py-1.5 text-xs font-mono">
                        <div>
                          <span className="text-[var(--text-dim)]">{fee.label}</span>
                          <span className="text-[10px] text-[var(--text-dim)] ml-1">({fee.rate})</span>
                        </div>
                        <span className="font-semibold">{formatPrice(fee.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="terminal-panel">
                  <div className="terminal-header">
                    <span>SELL FEES</span>
                    <span className="text-red">{formatPrice(result.totalSellFees)}</span>
                  </div>
                  <div className="divide-y divide-[var(--border)]/50">
                    {result.sellFees.map(fee => (
                      <div key={fee.label} className="flex items-center justify-between px-3 py-1.5 text-xs font-mono">
                        <div>
                          <span className="text-[var(--text-dim)]">{fee.label}</span>
                          <span className="text-[10px] text-[var(--text-dim)] ml-1">({fee.rate})</span>
                        </div>
                        <span className="font-semibold">{formatPrice(fee.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom line */}
              <div className="terminal-panel p-3">
                <div className="grid grid-cols-3 gap-4 text-center text-xs font-mono">
                  <div>
                    <div className="stat-label">Round-trip Cost</div>
                    <div className="font-bold text-[var(--text-primary)]">
                      {formatPrice(result.totalBuyFees + result.totalSellFees)}
                    </div>
                  </div>
                  <div>
                    <div className="stat-label">Cost as % of Value</div>
                    <div className="font-bold text-[var(--text-dim)]">
                      {(((result.totalBuyFees + result.totalSellFees) / result.totalValue) * 100).toFixed(3)}%
                    </div>
                  </div>
                  <div>
                    <div className="stat-label">Min Profit Target</div>
                    <div className="font-bold text-[var(--accent)]">
                      {formatPrice(result.totalBuyFees + result.totalSellFees)}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="terminal-panel p-8 text-center">
              <div className="text-3xl mb-3">🔢</div>
              <p className="text-sm text-[var(--text-dim)]">
                Enter price and lots to calculate
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Fee Structure Reference */}
      <div className="terminal-panel p-2">
        <div className="flex items-center justify-center gap-6 text-[10px] font-mono text-[var(--text-dim)] flex-wrap">
          <span>Buy Broker: 0.1%</span>
          <span>Sell Broker: 0.2%</span>
          <span>VAT: 10% of broker fee</span>
          <span>Clearing: 0.025%</span>
          <span>1 lot = {LOTS} shares</span>
        </div>
      </div>
    </div>
  )
}
