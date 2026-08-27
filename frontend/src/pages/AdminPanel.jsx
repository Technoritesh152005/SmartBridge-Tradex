import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  fetchAdminStocks,
  createStock,
  updateStock,
  deleteStock,
} from '../store/slices/stockSlice';

const emptyForm = {
  symbol: '',
  name: '',
  exchange: 'NASDAQ',
  sector: '',
  description: '',
  isActive: true,
};

function AdminPanel() {
  const dispatch = useDispatch();
  const { adminStocks } = useSelector((state) => state.stocks);
  const [form, setForm] = useState(emptyForm);
  const [editSymbol, setEditSymbol] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await dispatch(fetchAdminStocks());
      setLoading(false);
    };
    load();
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editSymbol) {
      const result = await dispatch(updateStock({ symbol: editSymbol, data: form }));
      if (updateStock.fulfilled.match(result)) {
        toast.success('Stock updated');
        setEditSymbol(null);
        setForm(emptyForm);
      } else {
        toast.error(result.payload);
      }
    } else {
      const result = await dispatch(createStock(form));
      if (createStock.fulfilled.match(result)) {
        toast.success('Stock created');
        setForm(emptyForm);
      } else {
        toast.error(result.payload);
      }
    }
  };

  const handleEdit = (stock) => {
    setEditSymbol(stock.symbol);
    setForm({
      symbol: stock.symbol,
      name: stock.name,
      exchange: stock.exchange,
      sector: stock.sector,
      description: stock.description,
      isActive: stock.isActive,
    });
  };

  const handleDelete = async (symbol) => {
    if (!window.confirm(`Delete ${symbol}?`)) return;
    const result = await dispatch(deleteStock(symbol));
    if (deleteStock.fulfilled.match(result)) {
      toast.success('Stock deleted');
    } else {
      toast.error(result.payload);
    }
  };

  if (loading) return <LoadingSpinner text="Loading admin panel..." />;

  return (
    <div className="container page-container">
      <h2 className="fw-bold mb-1">Admin Stock Management</h2>
      <p className="text-muted mb-4">Full CRUD control over tradeable stocks</p>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card-panel p-4">
            <h5 className="fw-bold mb-3">{editSymbol ? `Edit ${editSymbol}` : 'Add New Stock'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Symbol</label>
                <input
                  name="symbol"
                  className="form-control"
                  value={form.symbol}
                  onChange={handleChange}
                  disabled={!!editSymbol}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input name="name" className="form-control" value={form.name} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Exchange</label>
                <input name="exchange" className="form-control" value={form.exchange} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">Sector</label>
                <input name="sector" className="form-control" value={form.sector} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows="3"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  id="isActive"
                />
                <label className="form-check-label" htmlFor="isActive">
                  Active for trading
                </label>
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary">
                  {editSymbol ? 'Update' : 'Create'}
                </button>
                {editSymbol && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditSymbol(null);
                      setForm(emptyForm);
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card-panel p-0 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Symbol</th>
                    <th>Name</th>
                    <th>Exchange</th>
                    <th>Sector</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminStocks.map((stock) => (
                    <tr key={stock._id}>
                      <td className="fw-semibold">{stock.symbol}</td>
                      <td>{stock.name}</td>
                      <td>{stock.exchange}</td>
                      <td>{stock.sector || '—'}</td>
                      <td>
                        <span className={`badge ${stock.isActive ? 'bg-success' : 'bg-secondary'}`}>
                          {stock.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleEdit(stock)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(stock.symbol)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
