const express = require('express');
const router = express.Router();
const RecipeController = require('../controllers/recipeController');
const { requireAuth } = require('../middleware/auth');

router.get('/', RecipeController.index);
router.get('/new', requireAuth, RecipeController.newForm);
router.post('/new', requireAuth, RecipeController.create);
router.get('/:id', RecipeController.detail);
router.get('/:id/edit', requireAuth, RecipeController.editForm);
router.post('/:id/edit', requireAuth, RecipeController.update);
router.delete('/:id', requireAuth, RecipeController.destroy);
router.post('/search', express.json(), RecipeController.search);

module.exports = router;
