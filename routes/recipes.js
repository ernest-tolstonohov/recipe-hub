const express = require('express');
const router = express.Router();
const RecipeController = require('../controllers/recipeController');
const { requireAuth } = require('../middleware/auth');

router.get('/:id', RecipeController.detail);
router.post('/search', express.json(), RecipeController.search);

module.exports = router;
