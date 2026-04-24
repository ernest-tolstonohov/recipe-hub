const express = require('express');
const router = express.Router();
const RecipeController = require('../controllers/recipeController');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', RecipeController.index);
router.get('/new', requireAuth, RecipeController.newForm);
router.post('/new', requireAuth, upload.single('recipe_image'), RecipeController.create);
router.get('/:id', RecipeController.detail);
router.get('/:id/edit', requireAuth, RecipeController.editForm);
router.post('/:id/edit', requireAuth, upload.single('recipe_image'), RecipeController.update);
router.delete('/:id', requireAuth, RecipeController.destroy);
router.post('/search', express.json(), RecipeController.search);

module.exports = router;
