'use client'
import { useStore } from '@/store/useStore'
import { useNews } from '@/lib/api'
import { cn, timeAgo } from '@/lib/utils'
import { useEffect, useRef } from 'react'

export function NewsModal() {
  const { newsModalOpen, selectedNewsId, closeNewsModal, setSelectedTicker } = useStore()
  const { data: news } = useNews()
  const ref = useRef<HTMLDivElement>(null)

  const selectedNews = news?.find(n => n.id === selectedNewsId)

  useEffect(() => {
    if (newsModalOpen && ref.current) {
      ref.current.focus()
    }
  }, [newsModalOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeNewsModal()
    }
    if (newsModalOpen) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [newsModalOpen])

  if (!newsModalOpen || !selectedNews) return null

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) closeNewsModal() }}
    >
      <div 
        ref={ref}
        tabIndex={0}
        className="w-[700px] max-h-[80vh] overflow-y-auto panel-enter"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-light)',
          borderRadius: '8px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className={cn(
              'w-2 h-2 rounded-full',
              selectedNews.sentiment === 'positive' ? 'bg-[var(--green)]' :
              selectedNews.sentiment === 'negative' ? 'bg-[var(--red)]' : 'bg-[var(--amber)]'
            )} />
            <span className="text-xs font-mono text-[var(--text-dim)]">
              {selectedNews.source} · {timeAgo(selectedNews.timestamp)}
            </span>
          </div>
          <button 
            onClick={closeNewsModal}
            className="text-[var(--text-dim)] hover:text-[var(--text-primary)] text-lg leading-none transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-4 space-y-4">
          {/* Title */}
          <h2 className="text-lg font-bold font-mono leading-snug text-[var(--text-primary)]">
            {selectedNews.title}
          </h2>

          {/* Image placeholder */}
          <div 
            className="w-full h-48 rounded flex items-center justify-center overflow-hidden"
            style={{ background: 'var(--bg-primary)' }}
          >
            <div className="text-center">
              <div className="text-4xl mb-2">
                {selectedNews.sentiment === 'positive' ? '📈' : selectedNews.sentiment === 'negative' ? '📉' : '📊'}
              </div>
              <div className="text-xs font-mono text-[var(--text-dim)]">
                {selectedNews.source} — Market News
              </div>
            </div>
          </div>

          {/* Summary / Full content */}
          <div 
            className="text-sm font-mono leading-relaxed text-[var(--text-primary)]"
            style={{ lineHeight: '1.7' }}
          >
            {selectedNews.summary || selectedNews.title}
            
            <div className="mt-4 p-3 rounded" style={{ background: 'var(--bg-primary)' }}>
              <p className="text-xs text-[var(--text-dim)] mb-1">💡 Analisis:</p>
              <p className="text-xs text-[var(--text-secondary)]">
                {selectedNews.sentiment === 'positive' 
                  ? 'Berita ini berdampak positif terhadap sentimen pasar. Investor disarankan untuk mencermati pergerakan harga dalam waktu dekat.'
                  : selectedNews.sentiment === 'negative'
                  ? 'Berita ini berpotensi memberikan tekanan pada harga. Pertimbangkan untuk melakukan evaluasi posisi yang ada.'
                  : 'Berita ini bersifat netral. Pantau perkembangan lebih lanjut untuk menentukan dampak terhadap pasar.'}
              </p>
            </div>
          </div>

          {/* Related tickers */}
          {selectedNews.tickers && selectedNews.tickers.length > 0 && (
            <div>
              <div className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-wider mb-1.5">
                Saham Terkait
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {selectedNews.tickers.map(t => (
                  <button
                    key={t}
                    onClick={() => { setSelectedTicker(t); closeNewsModal() }}
                    className="badge-blue cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
            <span className="text-[10px] font-mono text-[var(--text-dim)]">
              Sumber: {selectedNews.source}
            </span>
            <a
              href={selectedNews.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-terminal-active text-xs"
            >
              Baca Selengkapnya ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
