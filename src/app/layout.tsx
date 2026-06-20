import type { Metadata, Viewport } from 'next'
import './globals.css'
import { MainShell } from '@/components/Layout/MainShell'

export const metadata: Metadata = {
  title: 'IDX Terminal — IHSG Market Dashboard',
  description: 'Bloomberg-style terminal for Indonesian stock market (IDX/IHSG)',
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
