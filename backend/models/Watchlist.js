const mongoose = require('mongoose');

const watchlistItemSchema = new mongoose.Schema(
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
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const watchlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    stocks: [watchlistItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Watchlist', watchlistSchema);
