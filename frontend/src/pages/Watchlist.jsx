import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchWatchlist, removeFromWatchlist } from '../store/slices/watchlistSlice';

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function Watchlist() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.watchlist);

  useEffect(() => {
    dispatch(fetchWatchlist());
  }, [dispatch]);

  const handleRemove = async (symbol) => {
    const result = await dispatch(removeFromWatchlist(symbol));
    if (removeFromWatchlist.fulfilled.match(result)) {
      toast.success(`${symbol} removed from watchlist`);
    } else {
      toast.error(result.payload);
    }
  };

  if (loading && !items.length) return <LoadingSpinner text="Loading watchlist..." />;

  return (
    <div className="container page-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Watchlist</h2>
          <p className="text-muted mb-0">Track stocks you are interested in</p>
        </div>
        <Link to="/stocks" className="btn btn-primary">
          Add Stocks
        </Link>
      </div>

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
                <th>Added</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <Link to={`/stocks/${item.symbol}`} className="fw-semibold">
                        {item.symbol}
                      </Link>
                    </td>
                    <td>{item.companyName}</td>
                    <td>{formatMoney(item.currentPrice)}</td>
                    <td className={item.change >= 0 ? 'positive' : 'negative'}>
                      {formatMoney(item.change)}
                    </td>
                    <td className={item.percentChange >= 0 ? 'positive' : 'negative'}>
                      {(item.percentChange || 0).toFixed(2)}%
                    </td>
                    <td>{new Date(item.addedAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleRemove(item.symbol)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    Your watchlist is empty. Browse stocks and add favorites.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Watchlist;
