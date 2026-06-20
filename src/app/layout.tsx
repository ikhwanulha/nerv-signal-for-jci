import type { Metadata, Viewport } from 'next'
import './globals.scss'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'NERV SIGNAL FOR JCI',
  description: 'Bloomberg Terminal untuk IHSG & Saham IDX oleh Ikhwanul Hakim',
  authors: { name: 'Ikhwanul Hakim' },
}

export const viewport: Viewport = {
  width: 'device-width', initialScale: 1,
  themeColor: '#0a0a0f',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
