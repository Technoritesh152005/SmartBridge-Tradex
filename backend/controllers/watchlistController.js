const Watchlist = require('../models/Watchlist');
const Stock = require('../models/Stock');
const stockService = require('../services/stockService');
const { body } = require('express-validator');

const addValidators = [
  body('symbol').trim().notEmpty().withMessage('Stock symbol is required'),
];

const getWatchlist = async (req, res) => {
  let watchlist = await Watchlist.findOne({ user: req.user._id });
  if (!watchlist) {
    watchlist = await Watchlist.create({ user: req.user._id, stocks: [] });
  }

  const enriched = await Promise.all(
    watchlist.stocks.map(async (item) => {
      try {
        const quote = await stockService.getQuote(item.symbol);
        return {
          _id: item._id,
          symbol: item.symbol,
          companyName: item.companyName,
          addedAt: item.addedAt,
          currentPrice: quote.current,
          change: quote.change,
          percentChange: quote.percentChange,
        };
      } catch {
        return {
          _id: item._id,
          symbol: item.symbol,
          companyName: item.companyName,
          addedAt: item.addedAt,
          currentPrice: 0,
          change: 0,
          percentChange: 0,
        };
      }
    })
  );

  res.json({ watchlist: enriched });
};

const addToWatchlist = async (req, res) => {
  const symbol = req.body.symbol.toUpperCase();
  const stock = await Stock.findOne({ symbol, isActive: true });

  let companyName = stock?.name || symbol;
  if (!stock) {
    try {
      const profile = await stockService.getCompanyProfile(symbol);
      companyName = profile.name;
    } catch {
      return res.status(404).json({ message: 'Stock not found' });
    }
  }

  let watchlist = await Watchlist.findOne({ user: req.user._id });
  if (!watchlist) {
    watchlist = await Watchlist.create({ user: req.user._id, stocks: [] });
  }

  const exists = watchlist.stocks.some((s) => s.symbol === symbol);
  if (exists) {
    return res.status(400).json({ message: 'Stock already in watchlist' });
  }

  watchlist.stocks.push({ symbol, companyName });
  await watchlist.save();

  res.status(201).json({ message: 'Added to watchlist', watchlist: watchlist.stocks });
};

const removeFromWatchlist = async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const watchlist = await Watchlist.findOne({ user: req.user._id });

  if (!watchlist) {
    return res.status(404).json({ message: 'Watchlist not found' });
  }

  const before = watchlist.stocks.length;
  watchlist.stocks = watchlist.stocks.filter((s) => s.symbol !== symbol);

  if (watchlist.stocks.length === before) {
    return res.status(404).json({ message: 'Stock not in watchlist' });
  }

  await watchlist.save();
  res.json({ message: 'Removed from watchlist', watchlist: watchlist.stocks });
};

module.exports = {
  addValidators,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
};
