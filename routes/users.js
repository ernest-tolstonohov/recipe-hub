const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

// Protect all user routes
router.use(requireAuth);

router.get('/my-recipes', UserController.getMyRecipes);
router.get('/:id', UserController.show);
router.get('/:id/saved', UserController.getSaved);
router.post('/:id/saved/:rid', UserController.save);
router.delete('/:id/saved/:rid', UserController.unsave);

module.exports = router;
