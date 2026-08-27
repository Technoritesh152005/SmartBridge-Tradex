const express = require('express');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validate = require('../middleware/validate');
const stockController = require('../controllers/stockController');

const router = express.Router();

router.get('/search', stockController.searchStocks);
router.get('/popular', stockController.getPopular);
router.get('/quote/:symbol', stockController.getQuote);
router.get('/history/:symbol', stockController.getHistory);

router.get('/', auth, admin, stockController.listStocks);
router.get('/manage/:symbol', auth, admin, stockController.getStock);
router.post('/', auth, admin, stockController.stockValidators, validate, stockController.createStock);
router.put('/:symbol', auth, admin, stockController.updateValidators, validate, stockController.updateStock);
router.delete('/:symbol', auth, admin, stockController.deleteStock);

module.exports = router;
