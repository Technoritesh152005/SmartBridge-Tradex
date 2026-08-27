const express = require('express');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const authController = require('../controllers/authController');

const router = express.Router();

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.post('/register', authController.registerValidators, validate, asyncHandler(authController.register));
router.post('/login', authController.loginValidators, validate, asyncHandler(authController.login));
router.get('/me', auth, asyncHandler(authController.getMe));

module.exports = router;
