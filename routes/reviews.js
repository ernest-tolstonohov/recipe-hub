const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');

// Get all reviews for a recipe
router.get('/recipe/:recipeId', reviewController.getReviewsByRecipe);

// Add a review (requires authentication)
router.post('/recipe/:recipeId', auth.requireAuth, reviewController.addReview);

// Update a review (requires authentication)
router.put('/:reviewId', auth.requireAuth, reviewController.updateReview);

// Delete a review (requires authentication)
router.delete('/:reviewId', auth.requireAuth, reviewController.deleteReview);

module.exports = router;
