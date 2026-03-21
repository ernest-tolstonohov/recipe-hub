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
        const userId = req.session.user.id;
        const result = await Review.addReview(recipeId, userId, rating, body);
        res.status(201).json(result);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'You have already reviewed this recipe' });
        }
        console.error('addReview error:', err);
        res.status(500).json({ error: 'Failed to add review' });
    }
};

// Update a review (owner or admin only)
exports.updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, body } = req.body;
        const currentUser = req.session.user;

        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ error: 'Review not found' });

        if (Number(review.user_id) !== Number(currentUser.id) && currentUser.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorised' });
        }

        const result = await Review.updateReview(reviewId, rating, body);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update review' });
    }
};

// Delete a review (owner or admin only)
exports.deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const currentUser = req.session.user;

        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ error: 'Review not found' });

        if (Number(review.user_id) !== Number(currentUser.id) && currentUser.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorised' });
        }

        await Review.deleteReview(reviewId);
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete review' });
    }
};
