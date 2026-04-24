const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Show login page
router.get('/login', authController.showLogin);

const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts. Please try again in 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Handle login form
router.post('/login', loginLimiter, authController.login);

// Handle logout
router.post('/logout', authController.logout);

module.exports = router;
