const axios = require('axios');

const FINNHUB_BASE = 'https://finnhub.io/api/v1';

const getApiKey = () => process.env.FINNHUB_API_KEY;

const DEMO_PRICES = {
  AAPL: 227.16,
  MSFT: 505.72,
  GOOGL: 201.42,
  AMZN: 231.48,
  TSLA: 339.03,
  NVDA: 181.59,
  META: 751.67,
  JPM: 295.44,
  V: 341.12,
  DIS: 113.84,
};

const demoPrice = (symbol) => DEMO_PRICES[symbol.toUpperCase()] || 100;

const getDemoQuote = (symbol) => {
  const upperSymbol = symbol.toUpperCase();
  const current = demoPrice(upperSymbol);
  const change = Number((Math.sin(upperSymbol.length * 3.7) * current * 0.012).toFixed(2));
  return {
    symbol: upperSymbol,
    current,
    change,
    percentChange: Number(((change / current) * 100).toFixed(2)),
    high: Number((current * 1.01).toFixed(2)),
    low: Number((current * 0.985).toFixed(2)),
    open: Number((current - change).toFixed(2)),
    previousClose: Number((current - change).toFixed(2)),
    timestamp: Math.floor(Date.now() / 1000),
    demo: true,
  };
};

const finnhubGet = async (path, params = {}) => {
  const apiKey = getApiKey();
  if (!apiKey || apiKey === 'your_finnhub_api_key_here') {
    const err = new Error('Finnhub API key is not configured');
    err.status = 503;
    throw err;
  }

  const { data } = await axios.get(`${FINNHUB_BASE}${path}`, {
    params: { ...params, token: apiKey },
    timeout: 15000,
  });
  return data;
};

const searchStocks = async (query) => {
  if (!query || query.trim().length < 1) return [];
  const data = await finnhubGet('/search', { q: query.trim() });
  const usResults = (data.result || []).filter(
    (item) => item.type === 'Common Stock' && !item.symbol.includes('.')
  );
  return usResults.slice(0, 20);
};

const getQuote = async (symbol) => {
  let data;
  try {
    data = await finnhubGet('/quote', { symbol: symbol.toUpperCase() });
  } catch (error) {
    if (error.status === 404) throw error;
    return getDemoQuote(symbol);
  }
  if (!data || !Number.isFinite(Number(data.c)) || Number(data.c) <= 0) {
    return getDemoQuote(symbol);
  }
  return {
    symbol: symbol.toUpperCase(),
    current: data.c,
    change: data.d,
    percentChange: data.dp,
    high: data.h,
    low: data.l,
    open: data.o,
    previousClose: data.pc,
    timestamp: data.t,
  };
};

const getCompanyProfile = async (symbol) => {
  try {
    const data = await finnhubGet('/stock/profile2', { symbol: symbol.toUpperCase() });
    return {
      name: data.name || symbol.toUpperCase(),
      exchange: data.exchange || '',
      industry: data.finnhubIndustry || '',
      marketCap: data.marketCapitalization || 0,
      logo: data.logo || '',
      weburl: data.weburl || '',
    };
  } catch {
    return { name: symbol.toUpperCase(), exchange: '', industry: '', marketCap: 0, logo: '', weburl: '' };
  }
};

const getHistoricalCandles = async (symbol, range = '1M') => {
  const now = Math.floor(Date.now() / 1000);
  const ranges = {
    '1W': 7 * 24 * 60 * 60,
    '1M': 30 * 24 * 60 * 60,
    '3M': 90 * 24 * 60 * 60,
    '6M': 180 * 24 * 60 * 60,
    '1Y': 365 * 24 * 60 * 60,
  };
  const from = now - (ranges[range] || ranges['1M']);

  let data;
  try {
    data = await finnhubGet('/stock/candle', {
      symbol: symbol.toUpperCase(),
      resolution: range === '1W' ? '60' : 'D',
      from,
      to: now,
    });
  } catch (error) {
    if (error.status === 404) throw error;
    data = null;
  }

  if (!data || data.s !== 'ok' || !data.t?.length) {
    const points = range === '1W' ? 42 : 30;
    const base = demoPrice(symbol);
    const candles = Array.from({ length: points }, (_, index) => {
      const time = now - (points - index) * (range === '1W' ? 4 : 24) * 60 * 60;
      const close = Number((base * (1 + Math.sin(index / 3) * 0.018 + (index / points - 0.5) * 0.02)).toFixed(2));
      return { time, open: close * 0.997, high: close * 1.01, low: close * 0.99, close, volume: 0 };
    });
    return { symbol: symbol.toUpperCase(), candles, demo: true };
  }

  const candles = data.t.map((time, i) => ({
    time,
    open: data.o[i],
    high: data.h[i],
    low: data.l[i],
    close: data.c[i],
    volume: data.v[i],
  }));

  return { symbol: symbol.toUpperCase(), candles };
};

const getPopularStocks = async () => {
  const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'JPM', 'V', 'DIS'];
  const quotes = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const quote = await getQuote(symbol);
        const profile = await getCompanyProfile(symbol);
        return { ...quote, companyName: profile.name };
      } catch {
        return null;
      }
    })
  );
  return quotes.filter(Boolean);
};

module.exports = {
  searchStocks,
  getQuote,
  getCompanyProfile,
  getHistoricalCandles,
  getPopularStocks,
};
