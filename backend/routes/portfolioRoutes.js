const express = require('express');
const auth = require('../middleware/auth');
const portfolioController = require('../controllers/portfolioController');

const router = express.Router();

router.get('/', auth, portfolioController.getPortfolio);
router.get('/transactions', auth, portfolioController.getTransactions);
router.get('/performance', auth, portfolioController.getPerformance);

module.exports = router;
