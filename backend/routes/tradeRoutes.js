const express = require('express');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const tradeController = require('../controllers/tradeController');

const router = express.Router();

router.post('/buy', auth, tradeController.tradeValidators, validate, tradeController.buyStock);
router.post('/sell', auth, tradeController.tradeValidators, validate, tradeController.sellStock);

module.exports = router;
