const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');
const stockService = require('../services/stockService');

const enrichHoldings = async (holdings) =>
  Promise.all(
    holdings.map(async (holding) => {
      try {
        const quote = await stockService.getQuote(holding.symbol);
        const currentPrice = quote.current;
        const marketValue = currentPrice * holding.quantity;
        const costBasis = holding.avgBuyPrice * holding.quantity;
        const gainLoss = marketValue - costBasis;
        const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

        return {
          symbol: holding.symbol,
          companyName: holding.companyName,
          quantity: holding.quantity,
          avgBuyPrice: holding.avgBuyPrice,
          currentPrice,
          marketValue,
          costBasis,
          gainLoss,
          gainLossPercent,
          dayChange: quote.change,
          dayChangePercent: quote.percentChange,
        };
      } catch {
        const costBasis = holding.avgBuyPrice * holding.quantity;
        return {
          symbol: holding.symbol,
          companyName: holding.companyName,
          quantity: holding.quantity,
          avgBuyPrice: holding.avgBuyPrice,
          currentPrice: holding.avgBuyPrice,
          marketValue: costBasis,
          costBasis,
          gainLoss: 0,
          gainLossPercent: 0,
          dayChange: 0,
          dayChangePercent: 0,
        };
      }
    })
  );

const getPortfolio = async (req, res) => {
  const portfolio = await Portfolio.findOne({ user: req.user._id });
  if (!portfolio) {
    return res.status(404).json({ message: 'Portfolio not found' });
  }

  const enriched = await enrichHoldings(portfolio.holdings);
  const totalMarketValue = enriched.reduce((sum, h) => sum + h.marketValue, 0);
  const totalCostBasis = enriched.reduce((sum, h) => sum + h.costBasis, 0);
  const totalGainLoss = totalMarketValue - totalCostBasis;

  res.json({
    cashBalance: portfolio.cashBalance,
    holdings: enriched,
    summary: {
      totalMarketValue,
      totalCostBasis,
      totalGainLoss,
      totalGainLossPercent: totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0,
      totalPortfolioValue: portfolio.cashBalance + totalMarketValue,
    },
  });
};

const getTransactions = async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
  const transactions = await Transaction.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(limit);

  res.json({ transactions });
};

const getPerformance = async (req, res) => {
  const initialBalance = Number(process.env.INITIAL_BALANCE) || 100000;
  const portfolio = await Portfolio.findOne({ user: req.user._id });
  const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: 1 });

  let holdingsValue = 0;
  if (portfolio) {
    const enriched = await enrichHoldings(portfolio.holdings);
    holdingsValue = enriched.reduce((sum, h) => sum + h.marketValue, 0);
  }

  const cashBalance = portfolio?.cashBalance ?? initialBalance;
  const currentValue = cashBalance + holdingsValue;
  const totalReturn = currentValue - initialBalance;

  res.json({
    initialBalance,
    currentValue,
    cashBalance,
    holdingsValue,
    totalReturn,
    totalReturnPercent: (totalReturn / initialBalance) * 100,
    totalTrades: transactions.length,
    buyCount: transactions.filter((t) => t.type === 'buy').length,
    sellCount: transactions.filter((t) => t.type === 'sell').length,
  });
};

module.exports = {
  getPortfolio,
  getTransactions,
  getPerformance,
};
