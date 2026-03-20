const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

// User profile
router.get('/users/:id', userController.show);

// Saved recipes list (protected)
router.get('/users/:id/saved', requireAuth, userController.getSaved);

// Save a recipe (protected)
router.post('/users/:id/saved/:rid', requireAuth, userController.save);

// Unsave a recipe (protected)
router.delete('/users/:id/saved/:rid', requireAuth, userController.unsave);

module.exports = router;