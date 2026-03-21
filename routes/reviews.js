const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');

// Get all reviews for a recipe
router.get('/recipe/:recipeId', reviewController.getReviewsByRecipe);

// Add a review (requires authentication)
router.post('/recipe/:recipeId', auth, reviewController.addReview);

// Update a review (requires authentication)
router.put('/:reviewId', auth, reviewController.updateReview);

// Delete a review (requires authentication)
router.delete('/:reviewId', auth, reviewController.deleteReview);

module.exports = router;
