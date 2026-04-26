const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

// my-recipes must come before /:id to avoid being caught by the param route
router.get('/my-recipes', requireAuth, UserController.getMyRecipes);

// Public profile page
router.get('/:id', UserController.show);
router.get('/:id/saved', requireAuth, UserController.getSaved);
router.post('/:id/saved/:rid', requireAuth, UserController.save);
router.delete('/:id/saved/:rid', requireAuth, UserController.unsave);

module.exports = router;
