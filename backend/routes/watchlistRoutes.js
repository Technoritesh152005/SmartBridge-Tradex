const express = require('express');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const watchlistController = require('../controllers/watchlistController');

const router = express.Router();

router.get('/', auth, watchlistController.getWatchlist);
router.post('/', auth, watchlistController.addValidators, validate, watchlistController.addToWatchlist);
router.delete('/:symbol', auth, watchlistController.removeFromWatchlist);

module.exports = router;
