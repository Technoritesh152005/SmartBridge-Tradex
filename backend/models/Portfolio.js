const mongoose = require('mongoose');

const holdingItemSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    companyName: {
      type: String,
      default: '',
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    avgBuyPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const portfolioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    cashBalance: {
      type: Number,
      default: () => Number(process.env.INITIAL_BALANCE) || 100000,
      min: 0,
    },
    holdings: [holdingItemSchema],
  },
  { timestamps: true }
);

portfolioSchema.methods.findHolding = function findHolding(symbol) {
  return this.holdings.find((h) => h.symbol === symbol.toUpperCase());
};

module.exports = mongoose.model('Portfolio', portfolioSchema);
