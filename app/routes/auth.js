const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Show login page
router.get('/login', authController.showLogin);

// Handle login form
router.post('/login', authController.login);

// Handle logout
router.post('/logout', authController.logout);

module.exports = router;
