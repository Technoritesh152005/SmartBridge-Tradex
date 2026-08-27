import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import portfolioReducer from './slices/portfolioSlice';
import stockReducer from './slices/stockSlice';
import watchlistReducer from './slices/watchlistSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    portfolio: portfolioReducer,
    stocks: stockReducer,
    watchlist: watchlistReducer,
  },
});

export default store;
