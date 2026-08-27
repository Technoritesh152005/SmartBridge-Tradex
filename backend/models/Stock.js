const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    exchange: {
      type: String,
      default: 'NASDAQ',
      trim: true,
    },
    sector: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

stockSchema.index({ name: 'text', symbol: 'text' });

module.exports = mongoose.model('Stock', stockSchema);
