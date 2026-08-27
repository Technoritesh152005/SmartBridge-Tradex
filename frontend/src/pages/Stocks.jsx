import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchPopularStocks, searchStocks } from '../store/slices/stockSlice';

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function Stocks() {
  const dispatch = useDispatch();
  const { popular, searchResults, loading } = useSelector((state) => state.stocks);
  const [query, setQuery] = useState('');

  useEffect(() => {
    dispatch(fetchPopularStocks());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) dispatch(searchStocks(query.trim()));
    }, 350);
    return () => clearTimeout(timer);
  }, [query, dispatch]);

  const displayStocks = query.trim()
    ? searchResults.map((s) => ({
        symbol: s.symbol,
        companyName: s.name || s.description || s.companyName,
        current: s.current || 0,
        change: s.change || 0,
        percentChange: s.percentChange || 0,
      }))
    : popular;

  return (
    <div className="container page-container">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Stock Market</h2>
          <p className="text-muted mb-0">Browse and search US stocks available for paper trading</p>
        </div>
        <input
          type="search"
          className="form-control"
          style={{ maxWidth: 360 }}
          placeholder="Search by symbol or name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading && !displayStocks?.length ? (
        <LoadingSpinner />
      ) : (
        <div className="card-panel p-0 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Symbol</th>
                  <th>Company</th>
                  <th>Price</th>
                  <th>Change</th>
                  <th>% Change</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {displayStocks?.length ? (
                  displayStocks.map((stock) => (
                    <tr key={stock.symbol}>
                      <td className="fw-semibold">{stock.symbol}</td>
                      <td>{stock.companyName || '—'}</td>
                      <td>{formatMoney(stock.current)}</td>
                      <td className={stock.change >= 0 ? 'positive' : 'negative'}>
                        {formatMoney(stock.change)}
                      </td>
                      <td className={stock.percentChange >= 0 ? 'positive' : 'negative'}>
                        {(stock.percentChange || 0).toFixed(2)}%
                      </td>
                      <td>
                        <Link to={`/stocks/${stock.symbol}`} className="btn btn-sm btn-outline-primary">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      No stocks found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Stocks;
