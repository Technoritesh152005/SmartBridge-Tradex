import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { buyStock, sellStock, fetchPortfolio } from '../store/slices/portfolioSlice';

function TradeModal({ symbol, companyName, currentPrice, mode, maxQuantity, onClose }) {
  const dispatch = useDispatch();
  const { tradeLoading } = useSelector((state) => state.portfolio);
  const [quantity, setQuantity] = useState(1);

  const total = (currentPrice * quantity).toFixed(2);
  const isBuy = mode === 'buy';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = isBuy ? buyStock : sellStock;

    const result = await dispatch(action({ symbol, quantity: Number(quantity) }));
    if (action.fulfilled.match(result)) {
      toast.success(`${isBuy ? 'Buy' : 'Sell'} order executed successfully`);
      dispatch(fetchPortfolio());
      onClose();
    } else {
      toast.error(result.payload || 'Trade failed');
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {isBuy ? 'Buy' : 'Sell'} {symbol}
            </h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <p className="text-muted mb-3">{companyName}</p>
              <div className="mb-3">
                <label className="form-label">Current Price</label>
                <input className="form-control" value={`$${currentPrice?.toFixed(2)}`} readOnly />
              </div>
              <div className="mb-3">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  max={isBuy ? undefined : maxQuantity}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
                {!isBuy && <small className="text-muted">Available: {maxQuantity} shares</small>}
              </div>
              <div className="alert alert-light border mb-0">
                Estimated Total: <strong>${total}</strong>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className={`btn ${isBuy ? 'btn-success' : 'btn-danger'}`}
                disabled={tradeLoading}
              >
                {tradeLoading ? 'Processing...' : isBuy ? 'Confirm Buy' : 'Confirm Sell'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TradeModal;
