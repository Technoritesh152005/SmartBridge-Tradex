import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchPortfolio, fetchPerformance, fetchTransactions } from '../store/slices/portfolioSlice';
import { fetchPopularStocks } from '../store/slices/stockSlice';

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { data, performance, transactions, loading } = useSelector((state) => state.portfolio);
  const { popular } = useSelector((state) => state.stocks);

  useEffect(() => {
    dispatch(fetchPortfolio());
    dispatch(fetchPerformance());
    dispatch(fetchTransactions());
    dispatch(fetchPopularStocks());
  }, [dispatch]);

  if (loading && !data) return <LoadingSpinner text="Loading dashboard..." />;

  const summary = data?.summary || {};
  const isPositive = (summary.totalGainLoss || 0) >= 0;

  return (
    <div className="container page-container">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1">Welcome, {user?.name}</h2>
          <p className="text-muted mb-0">Your paper trading overview</p>
        </div>
        <Link to="/stocks" className="btn btn-primary">
          Explore Stocks
        </Link>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3 col-sm-6">
          <StatCard label="Portfolio Value" value={formatMoney(summary.totalPortfolioValue)} />
        </div>
        <div className="col-md-3 col-sm-6">
          <StatCard label="Cash Balance" value={formatMoney(data?.cashBalance)} />
        </div>
        <div className="col-md-3 col-sm-6">
          <StatCard
            label="Total P&L"
            value={formatMoney(summary.totalGainLoss)}
            subValue={`${(summary.totalGainLossPercent || 0).toFixed(2)}%`}
            positive={isPositive}
          />
        </div>
        <div className="col-md-3 col-sm-6">
          <StatCard
            label="Total Return"
            value={formatMoney(performance?.totalReturn)}
            subValue={`${(performance?.totalReturnPercent || 0).toFixed(2)}% vs start`}
            positive={(performance?.totalReturn || 0) >= 0}
          />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card-panel p-4">
            <h5 className="fw-bold mb-3">Holdings</h5>
            {data?.holdings?.length ? (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Symbol</th>
                      <th>Qty</th>
                      <th>Value</th>
                      <th>P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.holdings.slice(0, 5).map((h) => (
                      <tr key={h.symbol}>
                        <td>
                          <Link to={`/stocks/${h.symbol}`} className="fw-semibold">
                            {h.symbol}
                          </Link>
                        </td>
                        <td>{h.quantity}</td>
                        <td>{formatMoney(h.marketValue)}</td>
                        <td className={h.gainLoss >= 0 ? 'positive' : 'negative'}>
                          {formatMoney(h.gainLoss)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted mb-0">No holdings yet. Start by buying your first stock.</p>
            )}
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card-panel p-4 mb-4">
            <h5 className="fw-bold mb-3">Recent Transactions</h5>
            {transactions?.length ? (
              <ul className="list-group list-group-flush">
                {transactions.slice(0, 5).map((t) => (
                  <li key={t._id} className="list-group-item px-0 d-flex justify-content-between">
                    <span>
                      <span className={`badge ${t.type === 'buy' ? 'bg-success' : 'bg-danger'} me-2`}>
                        {t.type.toUpperCase()}
                      </span>
                      {t.symbol}
                    </span>
                    <span>{formatMoney(t.total)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted mb-0">No transactions yet.</p>
            )}
          </div>

          <div className="card-panel p-4">
            <h5 className="fw-bold mb-3">Market Movers</h5>
            {popular?.slice(0, 5).map((s) => (
              <div key={s.symbol} className="d-flex justify-content-between py-2 border-bottom">
                <Link to={`/stocks/${s.symbol}`}>{s.symbol}</Link>
                <span className={s.change >= 0 ? 'positive' : 'negative'}>
                  {formatMoney(s.current)} ({s.percentChange?.toFixed(2)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
