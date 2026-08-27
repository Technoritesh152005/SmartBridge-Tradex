const { body } = require('express-validator');
const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');
const Stock = require('../models/Stock');
const stockService = require('../services/stockService');

const tradeValidators = [
  body('symbol').trim().notEmpty().withMessage('Stock symbol is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

const ensureStockTradeable = async (symbol) => {
  const upperSymbol = symbol.toUpperCase();
  const dbStock = await Stock.findOne({ symbol: upperSymbol, isActive: true });
  return dbStock || { symbol: upperSymbol, name: upperSymbol };
};

const buyStock = async (req, res) => {
  const { symbol, quantity } = req.body;
  const upperSymbol = symbol.toUpperCase();

  try {
    const dbStock = await ensureStockTradeable(upperSymbol);
    const quote = await stockService.getQuote(upperSymbol);
    const profile = await stockService.getCompanyProfile(upperSymbol);
    const price = quote.current;
    const total = price * quantity;

    const portfolio = await Portfolio.findOne({ user: req.user._id });
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    if (portfolio.cashBalance < total) {
      return res.status(400).json({ message: 'Insufficient virtual balance' });
    }

    portfolio.cashBalance -= total;

    const existing = portfolio.findHolding(upperSymbol);
    if (existing) {
      const newQty = existing.quantity + quantity;
      existing.avgBuyPrice =
        (existing.avgBuyPrice * existing.quantity + price * quantity) / newQty;
      existing.quantity = newQty;
      existing.companyName = profile.name || dbStock.name;
    } else {
      portfolio.holdings.push({
        symbol: upperSymbol,
        companyName: profile.name || dbStock.name,
        quantity,
        avgBuyPrice: price,
      });
    }

    await portfolio.save();

    const transaction = await Transaction.create(
      [
        {
          user: req.user._id,
          symbol: upperSymbol,
          companyName: profile.name || dbStock.name,
          type: 'buy',
          quantity,
          price,
          total,
        },
      ]
    );

    res.status(201).json({
      message: 'Buy order executed',
      transaction: transaction[0],
      portfolio,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Buy order failed' });
  }
};

const sellStock = async (req, res) => {
  const { symbol, quantity } = req.body;
  const upperSymbol = symbol.toUpperCase();

  try {
    await ensureStockTradeable(upperSymbol);

    const portfolio = await Portfolio.findOne({ user: req.user._id });
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const holding = portfolio.findHolding(upperSymbol);
    if (!holding || holding.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient shares to sell' });
    }

    const quote = await stockService.getQuote(upperSymbol);
    const price = quote.current;
    const total = price * quantity;
    const companyName = holding.companyName;

    portfolio.cashBalance += total;
    holding.quantity -= quantity;

    if (holding.quantity === 0) {
      portfolio.holdings = portfolio.holdings.filter((h) => h.symbol !== upperSymbol);
    }

    await portfolio.save();

    const transaction = await Transaction.create(
      [
        {
          user: req.user._id,
          symbol: upperSymbol,
          companyName,
          type: 'sell',
          quantity,
          price,
          total,
        },
      ]
    );

    res.json({
      message: 'Sell order executed',
      transaction: transaction[0],
      portfolio,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Sell order failed' });
  }
};

module.exports = {
  tradeValidators,
  buyStock,
  sellStock,
};
