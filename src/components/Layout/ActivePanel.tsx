'use client'
import { PanelId } from '@/types'
import { Dashboard } from '@/components/Dashboard/Dashboard'
import { Screener } from '@/components/Screener/Screener'
import { Signals } from '@/components/Signals/Signals'
import { Insight } from '@/components/Insight/Insight'
import { AksiKorporasi } from '@/components/AksiKorporasi/AksiKorporasi'
import { Watchlist } from '@/components/Watchlist/Watchlist'
import { Portfolio } from '@/components/Portfolio/Portfolio'
import { Heatmap } from '@/components/Heatmap/Heatmap'
import { UnusualVolume } from '@/components/UnusualVolume/UnusualVolume'
import { PatternScanner } from '@/components/PatternScanner/PatternScanner'
import { NetAsing } from '@/components/NetAsing/NetAsing'
import { IPOTracker } from '@/components/IPOTracker/IPOTracker'
import { KalkulatorLot } from '@/components/KalkulatorLot/KalkulatorLot'
import { Calendar } from '@/components/Calendar/Calendar'
import { StockDetail } from '@/components/Charts/StockDetail'

interface Props {
  panelId: PanelId
}

export function ActivePanel({ panelId }: Props) {
  const renderPanel = () => {
    switch(panelId) {
      case 'dashboard': return <Dashboard />
      case 'screener': return <Screener />
      case 'signals': return <Signals />
      case 'insight': return <Insight />
      case 'aksi_korporasi': return <AksiKorporasi />
      case 'watchlist': return <Watchlist />
      case 'portfolio': return <Portfolio />
      case 'heatmap': return <Heatmap />
      case 'unusual_volume': return <UnusualVolume />
      case 'pattern_scanner': return <PatternScanner />
      case 'net_asing': return <NetAsing />
      case 'ipo_tracker': return <IPOTracker />
      case 'kalkulator_lot': return <KalkulatorLot />
      case 'calendar': return <Calendar />
      default: return <Dashboard />
    }
  }

  return (
    <div className="panel-enter h-full">
      <StockDetail />
      {renderPanel()}
    </div>
  )
}
