import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchPortfolio = createAsyncThunk('portfolio/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/portfolio');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load portfolio');
  }
});

export const fetchTransactions = createAsyncThunk('portfolio/transactions', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/portfolio/transactions');
    return res.data.transactions;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load transactions');
  }
});

export const fetchPerformance = createAsyncThunk('portfolio/performance', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/portfolio/performance');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load performance');
  }
});

export const buyStock = createAsyncThunk('portfolio/buy', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/trade/buy', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Buy failed');
  }
});

export const sellStock = createAsyncThunk('portfolio/sell', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/trade/sell', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Sell failed');
  }
});

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState: {
    data: null,
    transactions: [],
    performance: null,
    loading: false,
    tradeLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPortfolio.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPortfolio.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchPortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload;
      })
      .addCase(fetchPerformance.fulfilled, (state, action) => {
        state.performance = action.payload;
      })
      .addCase(buyStock.pending, (state) => {
        state.tradeLoading = true;
      })
      .addCase(buyStock.fulfilled, (state) => {
        state.tradeLoading = false;
      })
      .addCase(buyStock.rejected, (state) => {
        state.tradeLoading = false;
      })
      .addCase(sellStock.pending, (state) => {
        state.tradeLoading = true;
      })
      .addCase(sellStock.fulfilled, (state) => {
        state.tradeLoading = false;
      })
      .addCase(sellStock.rejected, (state) => {
        state.tradeLoading = false;
      });
  },
});

export default portfolioSlice.reducer;
