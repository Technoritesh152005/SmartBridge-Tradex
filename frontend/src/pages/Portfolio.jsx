import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import StatCard from '../components/StatCard';
import TradeModal from '../components/TradeModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchPortfolio, fetchTransactions, fetchPerformance } from '../store/slices/portfolioSlice';

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Portfolio() {
  const dispatch = useDispatch();
  const { data, transactions, performance, loading } = useSelector((state) => state.portfolio);
  const [trade, setTrade] = useState(null);

  useEffect(() => {
    dispatch(fetchPortfolio());
    dispatch(fetchTransactions());
    dispatch(fetchPerformance());
  }, [dispatch]);

  if (loading && !data) return <LoadingSpinner text="Loading portfolio..." />;

  const summary = data?.summary || {};

  return (
    <div className="container page-container">
      <h2 className="fw-bold mb-4">Portfolio Management</h2>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <StatCard label="Total Value" value={formatMoney(summary.totalPortfolioValue)} />
        </div>
        <div className="col-md-4">
          <StatCard label="Invested (Holdings)" value={formatMoney(summary.totalMarketValue)} />
        </div>
        <div className="col-md-4">
          <StatCard
            label="Unrealized P&L"
            value={formatMoney(summary.totalGainLoss)}
            subValue={`${(summary.totalGainLossPercent || 0).toFixed(2)}%`}
            positive={(summary.totalGainLoss || 0) >= 0}
          />
        </div>
      </div>

      <div className="card-panel p-4 mb-4">
        <h5 className="fw-bold mb-3">Current Holdings</h5>
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Company</th>
                <th>Qty</th>
                <th>Avg Cost</th>
                <th>Current</th>
                <th>Market Value</th>
                <th>P&L</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.holdings?.length ? (
                data.holdings.map((h) => (
                  <tr key={h.symbol}>
                    <td>
                      <Link to={`/stocks/${h.symbol}`} className="fw-semibold">
                        {h.symbol}
                      </Link>
                    </td>
                    <td>{h.companyName}</td>
                    <td>{h.quantity}</td>
                    <td>{formatMoney(h.avgBuyPrice)}</td>
                    <td>{formatMoney(h.currentPrice)}</td>
                    <td>{formatMoney(h.marketValue)}</td>
                    <td className={h.gainLoss >= 0 ? 'positive' : 'negative'}>
                      {formatMoney(h.gainLoss)} ({h.gainLossPercent.toFixed(2)}%)
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() =>
                          setTrade({
                            mode: 'sell',
                            symbol: h.symbol,
                            companyName: h.companyName,
                            currentPrice: h.currentPrice,
                            maxQuantity: h.quantity,
                          })
                        }
                      >
                        Sell
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-4">
                    No holdings. <Link to="/stocks">Browse stocks</Link> to start trading.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card-panel p-4">
        <h5 className="fw-bold mb-3">Transaction History</h5>
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Symbol</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {transactions?.length ? (
                transactions.map((t) => (
                  <tr key={t._id}>
                    <td>{new Date(t.createdAt).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${t.type === 'buy' ? 'bg-success' : 'bg-danger'}`}>
                        {t.type.toUpperCase()}
                      </span>
                    </td>
                    <td>{t.symbol}</td>
                    <td>{t.quantity}</td>
                    <td>{formatMoney(t.price)}</td>
                    <td>{formatMoney(t.total)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    No transactions yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {trade && (
        <TradeModal
          symbol={trade.symbol}
          companyName={trade.companyName}
          currentPrice={trade.currentPrice}
          mode={trade.mode}
          maxQuantity={trade.maxQuantity}
          onClose={() => setTrade(null)}
        />
      )}
    </div>
  );
}

export default Portfolio;
