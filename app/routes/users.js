const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Show user profile page
router.get('/users/:id', userController.show);

module.exports = router;