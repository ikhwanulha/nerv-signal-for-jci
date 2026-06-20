'use client'
import { useStore } from '@/store/useStore'
import { CommandBar } from './CommandBar'
import { Sidebar } from './Sidebar'
import { StatusBar } from './StatusBar'
import { ActivePanel } from './ActivePanel'
import { NewsModal } from '@/components/News/NewsModal'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'

export function MainShell() {
  const { theme, commandBarOpen, activePanel } = useStore()

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        useStore.getState().toggleCommandBar()
      }
      const panelMap: Record<string, string> = {
        '1': 'dashboard', '2': 'screener', '3': 'signals',
        '4': 'insight', '5': 'watchlist', '6': 'portfolio',
        '7': 'heatmap', '8': 'unusual_volume', '9': 'net_asing',
      }
      if ((e.metaKey || e.ctrlKey) && panelMap[e.key]) {
        e.preventDefault()
        useStore.getState().togglePanel(panelMap[e.key] as any)
      }
      if (e.key === 'Escape' && commandBarOpen) {
        useStore.getState().toggleCommandBar()
      }
      if (e.key === 'F5') {
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [commandBarOpen])

  return (
    <div className={`h-screen flex flex-col theme-${theme}`}>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#e0e0e0',
            border: '1px solid #2a2a2a',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '12px',
          },
          duration: 3000,
        }}
      />
      
      {commandBarOpen && <CommandBar />}
      <NewsModal />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-2 scan-line">
          <ActivePanel panelId={activePanel} />
        </main>
      </div>
      
      <StatusBar />
    </div>
  )
}
