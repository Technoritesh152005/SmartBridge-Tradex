import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import StockChart from '../components/StockChart';
import TradeModal from '../components/TradeModal';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  fetchStockQuote,
  fetchStockHistory,
  clearQuote,
} from '../store/slices/stockSlice';
import { fetchPortfolio } from '../store/slices/portfolioSlice';
import { addToWatchlist } from '../store/slices/watchlistSlice';

const RANGES = ['1W', '1M', '3M', '6M', '1Y'];

function StockDetail() {
  const { symbol } = useParams();
  const dispatch = useDispatch();
  const { quote, profile, history, error } = useSelector((state) => state.stocks);
  const { data: portfolio } = useSelector((state) => state.portfolio);
  const [range, setRange] = useState('1M');
  const [tradeMode, setTradeMode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);

  const holding = portfolio?.holdings?.find((h) => h.symbol === symbol?.toUpperCase());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([
        dispatch(fetchStockQuote(symbol)),
        dispatch(fetchStockHistory({ symbol, range })),
        dispatch(fetchPortfolio()),
      ]);
      setLoading(false);
    };
    load();
    return () => dispatch(clearQuote());
  }, [symbol, dispatch]);

  useEffect(() => {
    setHistoryLoading(true);
    dispatch(fetchStockHistory({ symbol, range })).finally(() => setHistoryLoading(false));
  }, [range, symbol, dispatch]);

  const handleWatchlist = async () => {
    const result = await dispatch(addToWatchlist(symbol));
    if (addToWatchlist.fulfilled.match(result)) {
      toast.success(`${symbol} added to watchlist`);
    } else {
      toast.error(result.payload);
    }
  };

  if (loading) return <LoadingSpinner text="Loading stock details..." />;

  const formatPrice = (value) => (Number.isFinite(Number(value)) ? `$${Number(value).toFixed(2)}` : '--');

  return (
    <div className="container page-container">
      <div className="d-flex flex-wrap justify-content-between align-items-start mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">
            {symbol?.toUpperCase()}{' '}
            <span className="fs-5 text-muted">{profile?.name}</span>
          </h2>
          <p className="mb-0">
            <span className="fs-3 fw-bold">{formatPrice(quote?.current)}</span>{' '}
            <span className={quote?.change >= 0 ? 'positive' : 'negative'}>
              {quote?.change >= 0 ? '+' : ''}
              {quote?.change?.toFixed(2)} ({quote?.percentChange?.toFixed(2)}%)
            </span>
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button type="button" className="btn btn-outline-secondary" onClick={handleWatchlist}>
            Add to Watchlist
          </button>
          <button type="button" className="btn btn-success" onClick={() => setTradeMode('buy')}>
            Buy
          </button>
          {holding && (
            <button type="button" className="btn btn-danger" onClick={() => setTradeMode('sell')}>
              Sell
            </button>
          )}
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-3 col-6">
          <div className="stat-card">
            <div className="stat-label">Open</div>
            <div className="stat-value fs-5">${quote?.open?.toFixed(2)}</div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="stat-card">
            <div className="stat-label">High</div>
            <div className="stat-value fs-5">${quote?.high?.toFixed(2)}</div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="stat-card">
            <div className="stat-label">Low</div>
            <div className="stat-value fs-5">${quote?.low?.toFixed(2)}</div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="stat-card">
            <div className="stat-label">Your Shares</div>
            <div className="stat-value fs-5">{holding?.quantity || 0}</div>
          </div>
        </div>
      </div>

      <div className="card-panel chart-panel p-4">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div>
            <h5 className="fw-bold mb-0">Price History</h5>
            <small className="text-muted">{historyLoading ? 'Updating...' : error ? error : 'Market trend'}</small>
          </div>
          <div className="btn-group">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                className={`btn btn-sm ${range === r ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setRange(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <StockChart candles={history} symbol={symbol?.toUpperCase()} />
      </div>

      {tradeMode && (
        <TradeModal
          symbol={symbol?.toUpperCase()}
          companyName={profile?.name}
          currentPrice={quote?.current}
          mode={tradeMode}
          maxQuantity={holding?.quantity || 0}
          onClose={() => setTradeMode(null)}
        />
      )}
    </div>
  );
}

export default StockDetail;
