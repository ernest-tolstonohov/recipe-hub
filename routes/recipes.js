const express = require('express');
const router = express.Router();
const RecipeController = require('../controllers/recipeController');

router.get('/:id', RecipeController.detail);
router.post('/search', express.json(), RecipeController.search);

module.exports = router;
