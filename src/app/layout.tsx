import type { Metadata, Viewport } from 'next'
import './globals.css'
import { MainShell } from '@/components/Layout/MainShell'

export const metadata: Metadata = {
  title: 'NERV SIGNAL FOR JCI — Bloomberg Terminal untuk IHSG',
  description: 'Bloomberg-style terminal untuk IHSG & saham IDX oleh Ikhwanul Hakim',
  authors: { name: 'Ikhwanul Hakim' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <body>
        <MainShell />
        {children}
      </body>
    </html>
  )
}
