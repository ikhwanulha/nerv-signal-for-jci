import { create } from 'zustand';
import type {
  StockQuote,
  IHSGQuote,
  SectorPerformance,
  TradingSignal,
  NewsItem,
  PortfolioPosition,
  WatchlistItem,
} from '@/types';
import { idxStocks } from '@/data/idx-stocks';
import type { IDXStock } from '@/types';

// ─── State Shape ───
interface StockState {
  stocks: StockQuote[];
  ihsg: IHSGQuote | null;
  gainers: StockQuote[];
  losers: StockQuote[];
  sectors: SectorPerformance[];
  signals: TradingSignal[];
  allStocks: IDXStock[];
  news: NewsItem[];
  selectedTicker: string | null;
  lastUpdate: number;
  loading: boolean;
  stocksLoading: boolean;
  ihsgLoading: boolean;
  portfolio: PortfolioPosition[];
  watchlist: WatchlistItem[];
  commandBarOpen: boolean;
  searchQuery: string;

  // Actions
  setStocks: (stocks: StockQuote[]) => void;
  setIhsg: (ihsg: IHSGQuote) => void;
  setGainers: (gainers: StockQuote[]) => void;
  setLosers: (losers: StockQuote[]) => void;
  setSectors: (sectors: SectorPerformance[]) => void;
  setSignals: (signals: TradingSignal[]) => void;
  setNews: (news: NewsItem[]) => void;
  setSelectedTicker: (ticker: string | null) => void;
  setLoading: (loading: boolean) => void;
  setStocksLoading: (loading: boolean) => void;
  setIhsgLoading: (loading: boolean) => void;
  updateStockPrice: (ticker: string, price: number, change: number, changePercent: number, volume: number) => void;
  addToPortfolio: (position: PortfolioPosition) => void;
  removeFromPortfolio: (id: string) => void;
  addToWatchlist: (item: WatchlistItem) => void;
  removeFromWatchlist: (ticker: string) => void;
  toggleCommandBar: () => void;
  setSearchQuery: (q: string) => void;
  updateIhsg: (data: Partial<IHSGQuote>) => void;
}

// ─── Demo news presets ───
const initialNews: NewsItem[] = [
  {
    id: 'news-1',
    title: 'IHSG Dibuka Menguat di Awal Sesi Perdagangan',
    source: 'Kontan',
    url: '#',
    timestamp: Date.now() - 3600_000,
    sentiment: 'positive',
    tickers: [],
    summary: 'Indeks Harga Saham Gabungan dibuka menguat 0.48% di awal sesi perdagangan.',
  },
  {
    id: 'news-2',
    title: 'Bank Indonesia Pertahankan Suku Bunga di 5.75%',
    source: 'Bisnis',
    url: '#',
    timestamp: Date.now() - 7200_000,
    sentiment: 'neutral',
    tickers: ['BBCA', 'BBRI', 'BMRI'],
  },
  {
    id: 'news-3',
    title: 'Sektor Tambang Pimpin Penguatan IHSG Pekan Ini',
    source: 'CNBC Indonesia',
    url: '#',
    timestamp: Date.now() - 10800_000,
    sentiment: 'positive',
    tickers: ['ADRO', 'BYAN', 'PTBA'],
  },
  {
    id: 'news-4',
    title: 'Inflasi AS Turun, Pasar Asia Kompak Hijau',
    source: 'Reuters',
    url: '#',
    timestamp: Date.now() - 14400_000,
    sentiment: 'positive',
    tickers: [],
  },
  {
    id: 'news-5',
    title: 'Saham Teknologi Tertekan Aksi Ambil Untung',
    source: 'Bloomberg',
    url: '#',
    timestamp: Date.now() - 18000_000,
    sentiment: 'negative',
    tickers: ['GOTO', 'DCII'],
  },
];

export const useStockStore = create<StockState>((set, get) => ({
  // ─── Initial State ───
  stocks: [],
  ihsg: null,
  gainers: [],
  losers: [],
  sectors: [],
  signals: [],
  allStocks: idxStocks,
  news: initialNews,
  selectedTicker: null,
  lastUpdate: 0,
  loading: false,
  stocksLoading: false,
  ihsgLoading: false,
  portfolio: [],
  watchlist: [],
  commandBarOpen: false,
  searchQuery: '',

  // ─── Actions ───
  setStocks: (stocks) =>
    set({ stocks, lastUpdate: Date.now(), stocksLoading: false }),

  setIhsg: (ihsg) =>
    set({ ihsg, lastUpdate: Date.now(), ihsgLoading: false }),

  setGainers: (gainers) => set({ gainers }),

  setLosers: (losers) => set({ losers }),

  setSectors: (sectors) => set({ sectors }),

  setSignals: (signals) => set({ signals }),

  setNews: (news) => set({ news }),

  setSelectedTicker: (ticker) => set({ selectedTicker: ticker }),

  setLoading: (loading) => set({ loading }),

  setStocksLoading: (loading) => set({ stocksLoading: loading }),

  setIhsgLoading: (loading) => set({ ihsgLoading: loading }),

  updateStockPrice: (ticker, price, change, changePercent, volume) => {
    const { stocks } = get();
    const updated = stocks.map((s) =>
      s.ticker === ticker
        ? { ...s, price, change, changePercent, volume, lastUpdate: Date.now() }
        : s
    );
    set({ stocks: updated, lastUpdate: Date.now() });
  },

  updateIhsg: (data) => {
    const { ihsg } = get();
    if (!ihsg) return;
    set({ ihsg: { ...ihsg, ...data }, lastUpdate: Date.now() });
  },

  addToPortfolio: (position) =>
    set((s) => ({ portfolio: [...s.portfolio, position] })),

  removeFromPortfolio: (id) =>
    set((s) => ({ portfolio: s.portfolio.filter((p) => p.id !== id) })),

  addToWatchlist: (item) =>
    set((s) => ({ watchlist: [...s.watchlist, item] })),

  removeFromWatchlist: (ticker) =>
    set((s) => ({ watchlist: s.watchlist.filter((w) => w.ticker !== ticker) })),

  toggleCommandBar: () =>
    set((s) => ({ commandBarOpen: !s.commandBarOpen })),

  setSearchQuery: (q) => set({ searchQuery: q }),
}));
