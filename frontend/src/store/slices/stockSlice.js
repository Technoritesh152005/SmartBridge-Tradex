import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const searchStocks = createAsyncThunk('stocks/search', async (query, { rejectWithValue }) => {
  try {
    const res = await api.get('/stocks/search', { params: { q: query } });
    return res.data.results;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Search failed');
  }
});

export const fetchPopularStocks = createAsyncThunk('stocks/popular', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/stocks/popular');
    return res.data.stocks;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load stocks');
  }
});

export const fetchStockQuote = createAsyncThunk('stocks/quote', async (symbol, { rejectWithValue }) => {
  try {
    const res = await api.get(`/stocks/quote/${symbol}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load quote');
  }
});

export const fetchStockHistory = createAsyncThunk('stocks/history', async ({ symbol, range }, { rejectWithValue }) => {
  try {
    const res = await api.get(`/stocks/history/${symbol}`, { params: { range } });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load history');
  }
});

export const fetchAdminStocks = createAsyncThunk('stocks/adminList', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/stocks');
    return res.data.stocks;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load admin stocks');
  }
});

export const createStock = createAsyncThunk('stocks/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/stocks', data);
    return res.data.stock;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create stock');
  }
});

export const updateStock = createAsyncThunk('stocks/update', async ({ symbol, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/stocks/${symbol}`, data);
    return res.data.stock;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update stock');
  }
});

export const deleteStock = createAsyncThunk('stocks/delete', async (symbol, { rejectWithValue }) => {
  try {
    await api.delete(`/stocks/${symbol}`);
    return symbol;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete stock');
  }
});

const stockSlice = createSlice({
  name: 'stocks',
  initialState: {
    searchResults: [],
    popular: [],
    quote: null,
    profile: null,
    history: [],
    adminStocks: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearQuote(state) {
      state.quote = null;
      state.profile = null;
      state.history = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchStocks.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      })
      .addCase(fetchPopularStocks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPopularStocks.fulfilled, (state, action) => {
        state.loading = false;
        state.popular = action.payload;
      })
      .addCase(fetchPopularStocks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchStockQuote.fulfilled, (state, action) => {
        state.quote = action.payload.quote;
        state.profile = action.payload.profile;
      })
      .addCase(fetchStockQuote.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchStockHistory.fulfilled, (state, action) => {
        state.history = action.payload.candles || [];
      })
      .addCase(fetchStockHistory.rejected, (state, action) => {
        state.history = [];
        state.error = action.payload;
      })
      .addCase(fetchAdminStocks.fulfilled, (state, action) => {
        state.adminStocks = action.payload;
      })
      .addCase(createStock.fulfilled, (state, action) => {
        state.adminStocks.push(action.payload);
      })
      .addCase(updateStock.fulfilled, (state, action) => {
        const idx = state.adminStocks.findIndex((s) => s.symbol === action.payload.symbol);
        if (idx !== -1) state.adminStocks[idx] = action.payload;
      })
      .addCase(deleteStock.fulfilled, (state, action) => {
        state.adminStocks = state.adminStocks.filter((s) => s.symbol !== action.payload);
      });
  },
});

export const { clearQuote } = stockSlice.actions;
export default stockSlice.reducer;
