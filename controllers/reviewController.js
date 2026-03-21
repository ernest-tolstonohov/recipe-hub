const Review = require('../models/review');

// Get all reviews for a recipe
exports.getReviewsByRecipe = async (req, res) => {
    try {
        const { recipeId } = req.params;
        const reviews = await Review.findByRecipe(recipeId);
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
};

// Add a new review to a recipe
exports.addReview = async (req, res) => {
    try {
        const { recipeId } = req.params;
        const { rating, body } = req.body;
        const userId = req.user.user_id; // Assumes auth middleware sets req.user
        const result = await Review.addReview(recipeId, userId, rating, body);
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: 'Failed to add review' });
    }
};

// Update a review
exports.updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, body } = req.body;
        const userId = req.user.user_id;
        const result = await Review.updateReview(reviewId, userId, rating, body);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update review' });
    }
};

// Delete a review
exports.deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.user_id;
        await Review.deleteReview(reviewId, userId);
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete review' });
    }
};
