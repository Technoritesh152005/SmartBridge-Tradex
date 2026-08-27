const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const Watchlist = require('../models/Watchlist');

const getJwtSecret = () => process.env.JWT_SECRET || 'tradex_dev_jwt_secret_change_me';

const generateToken = (userId) =>
  jwt.sign({ id: userId }, getJwtSecret(), { expiresIn: '7d' });

const registerValidators = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidators = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  const user = await User.create({ name, email, password });
  await Portfolio.create({ user: user._id });
  await Watchlist.create({ user: user._id, stocks: [] });

  const token = generateToken(user._id);

  res.status(201).json({
    message: 'Registration successful',
    token,
    user,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = generateToken(user._id);

  res.json({
    message: 'Login successful',
    token,
    user,
  });
};

const getMe = async (req, res) => {
  const portfolio = await Portfolio.findOne({ user: req.user._id });
  res.json({
    user: req.user,
    portfolio: {
      cashBalance: portfolio?.cashBalance ?? 0,
      holdingsCount: portfolio?.holdings?.length ?? 0,
    },
  });
};

module.exports = {
  registerValidators,
  loginValidators,
  register,
  login,
  getMe,
};
