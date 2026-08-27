const Stock = require('../models/Stock');
const stockService = require('../services/stockService');
const { body } = require('express-validator');

const stockValidators = [
  body('symbol').trim().notEmpty().withMessage('Symbol is required'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('exchange').optional().trim(),
  body('sector').optional().trim(),
  body('description').optional().trim(),
  body('isActive').optional().isBoolean(),
];

const updateValidators = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('exchange').optional().trim(),
  body('sector').optional().trim(),
  body('description').optional().trim(),
  body('isActive').optional().isBoolean(),
];

const listStocks = async (req, res) => {
  const { search, active } = req.query;
  const filter = {};

  if (active === 'true') filter.isActive = true;
  if (active === 'false') filter.isActive = false;

  if (search) {
    filter.$or = [
      { symbol: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
    ];
  }

  const stocks = await Stock.find(filter).sort({ symbol: 1 });
  res.json({ stocks });
};

const getStock = async (req, res) => {
  const stock = await Stock.findOne({ symbol: req.params.symbol.toUpperCase() });
  if (!stock) {
    return res.status(404).json({ message: 'Stock not found' });
  }
  res.json({ stock });
};

const createStock = async (req, res) => {
  const symbol = req.body.symbol.toUpperCase();
  const existing = await Stock.findOne({ symbol });
  if (existing) {
    return res.status(400).json({ message: 'Stock symbol already exists' });
  }

  const stock = await Stock.create({ ...req.body, symbol });
  res.status(201).json({ message: 'Stock created', stock });
};

const updateStock = async (req, res) => {
  const stock = await Stock.findOneAndUpdate(
    { symbol: req.params.symbol.toUpperCase() },
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!stock) {
    return res.status(404).json({ message: 'Stock not found' });
  }

  res.json({ message: 'Stock updated', stock });
};

const deleteStock = async (req, res) => {
  const stock = await Stock.findOneAndDelete({ symbol: req.params.symbol.toUpperCase() });
  if (!stock) {
    return res.status(404).json({ message: 'Stock not found' });
  }
  res.json({ message: 'Stock deleted' });
};

const searchStocks = async (req, res) => {
  try {
    const query = req.query.q || '';
    const dbResults = await Stock.find({
      isActive: true,
      $or: [
        { symbol: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
      ],
    })
      .limit(20)
      .sort({ symbol: 1 });

    if (dbResults.length > 0 || !query) {
      return res.json({ results: dbResults, source: 'database' });
    }

    const liveResults = await stockService.searchStocks(query);
    res.json({ results: liveResults, source: 'finnhub' });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Failed to search stocks' });
  }
};

const getQuote = async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const stock = await Stock.findOne({ symbol });
    const quote = await stockService.getQuote(symbol);
    const profile = await stockService.getCompanyProfile(symbol);

    res.json({
      quote,
      profile,
      stock: stock || null,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Failed to fetch quote' });
  }
};

const getHistory = async (req, res) => {
  try {
    const history = await stockService.getHistoricalCandles(req.params.symbol, req.query.range);
    res.json(history);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Failed to fetch history' });
  }
};

const getPopular = async (req, res) => {
  try {
    const dbStocks = await Stock.find({ isActive: true }).limit(10);
    if (dbStocks.length > 0) {
      const stocks = await Promise.all(
        dbStocks.map(async (stock) => {
          try {
            const quote = await stockService.getQuote(stock.symbol);
            return { ...quote, companyName: stock.name, symbol: stock.symbol };
          } catch {
            return { symbol: stock.symbol, companyName: stock.name, current: 0, change: 0, percentChange: 0 };
          }
        })
      );
      return res.json({ stocks });
    }

    const stocks = await stockService.getPopularStocks();
    res.json({ stocks });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Failed to fetch popular stocks' });
  }
};

module.exports = {
  stockValidators,
  updateValidators,
  listStocks,
  getStock,
  createStock,
  updateStock,
  deleteStock,
  searchStocks,
  getQuote,
  getHistory,
  getPopular,
};
