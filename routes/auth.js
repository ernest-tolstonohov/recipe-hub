const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

router.get('/register', AuthController.getRegister);
router.post('/register', AuthController.postRegister);
router.get('/login', AuthController.getLogin);
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,   // 15-minute window
    max: 5,                      // max 5 attempts
    message: 'Too many login attempts. Please try again in 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/login', loginLimiter, AuthController.postLogin);
router.get('/logout', AuthController.logout);
router.post('/logout', AuthController.logout);

module.exports = router;
