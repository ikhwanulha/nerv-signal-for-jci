# 🟢 NERV SIGNAL FOR JCI

Bloomberg-style terminal untuk IHSG & saham IDX.
Dibuat oleh **Ikhwanul Hakim** — ikhwanulha@gmail.com

Terminal keuangan profesional untuk Bursa Efek Indonesia (IDX/IHSG). Tampilan information-dense bergaya Bloomberg Terminal dengan dark theme.

## ✨ Fitur

| Menu | Status | Deskripsi |
|------|--------|-----------|
| 📊 Dashboard | ✅ | IHSG real-time, top gainers/losers, berita |
| 🔍 Screener | ✅ | Filter saham berdasarkan harga, volume, sektor |
| 🔄 Signals | ✅ | Sinyal trading dengan SL/TP, confidence score |
| 💡 Insight | ✅ | Analisis pasar dan berita terkini |
| 📋 Aksi Korporasi | ✅ | Dividen, stock split, rights issue, RUPS |
| 👁 Watchlist | ✅ | Pantau saham favorit + price alert |
| 💼 Portfolio | ✅ | Tracking portfolio dengan P&L real-time |
| 🗺 Sector Heatmap | ✅ | Performa sektor dalam grid visual |
| 🔥 Unusual Volume | ✅ | Deteksi volume perdagangan tidak biasa |
| 📐 Pattern Scanner | ✅ | Deteksi pola chart otomatis |
| 🌐 Net Asing | ✅ | Data pembelian/penjualan investor asing |
| 🚀 IPO Tracker | ✅ | Monitoring IPO terbaru |
| 🔢 Kalkulator Lot | ✅ | Kalkulasi lot saham + biaya transaksi |
| 📅 Kalender | ✅ | Kalender aksi korporasi & ekonomi |

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **State:** Zustand
- **Charts:** Lightweight Charts (TradingView)
- **Styling:** Tailwind CSS + CSS Variables
- **Deploy:** Vercel

## ⌨️ Keyboard Shortcuts

| Shortcut | Aksi |
|----------|------|
| `⌘K` | Command bar / cari saham |
| `⌘1-9` | Buka panel cepat |
| `F5` | Refresh semua data |
| `Esc` | Tutup command bar |

## 🎨 Tema

Tersedia 4 tema: Dark, Amber, Green, Blue — bisa diganti dari sidebar.

## 🚀 Deploy ke Vercel

```bash
npm install
npm run dev    # Development
npm run build  # Production build
```

## 📦 Data Source

- **Mock data** — built-in untuk development/demo
- **@baguskto/saham** — NPM package untuk data real-time IDX
- **idx-mcp-server** — MCP Server untuk data historis + analisis teknikal
- **IDX Data License** — Untuk akses data resmi (berbayar)

## 📝 TODO

- [ ] Integrasi @baguskto/saham untuk data real-time
- [ ] Integrasi idx-mcp-server untuk data historis
- [ ] AI-powered analysis (Gemini/Claude)
- [ ] Paper trading engine
- [ ] Notifikasi real-time (push/email)
- [ ] Export CSV/Excel/PDF
- [ ] Multi-bahasa (ID/EN)
