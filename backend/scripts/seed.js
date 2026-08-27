require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const connectDB = require('../config/db');
const User = require('../models/User');
const Stock = require('../models/Stock');
const Portfolio = require('../models/Portfolio');
const Watchlist = require('../models/Watchlist');

const DEFAULT_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', sector: 'Consumer Cyclical' },
  { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', sector: 'Automotive' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', sector: 'Technology' },
  { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ', sector: 'Technology' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE', sector: 'Financial' },
  { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE', sector: 'Financial' },
  { symbol: 'DIS', name: 'The Walt Disney Company', exchange: 'NYSE', sector: 'Entertainment' },
];

const seed = async () => {
  await connectDB();

  for (const stock of DEFAULT_STOCKS) {
    await Stock.findOneAndUpdate({ symbol: stock.symbol }, stock, { upsert: true, new: true });
  }
  console.log(`Seeded ${DEFAULT_STOCKS.length} stocks`);

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@tradex.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'TradeX Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });
    console.log(`Admin created: ${adminEmail} / ${adminPassword}`);
  } else {
    admin.role = 'admin';
    admin.password = adminPassword;
    await admin.save();
    console.log(`Admin password reset: ${adminEmail} / ${adminPassword}`);
  }

  if (!(await Portfolio.findOne({ user: admin._id }))) {
    await Portfolio.create({ user: admin._id });
    console.log('Admin portfolio created');
  }

  if (!(await Watchlist.findOne({ user: admin._id }))) {
    await Watchlist.create({ user: admin._id, stocks: [] });
    console.log('Admin watchlist created');
  }

  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
