const db = require('../app/services/db');

class Review {
    /**
     * Get all reviews for a recipe, newest first.
     */
    static async findByRecipe(recipeId) {
        const rows = await db.query(`
            SELECT rv.review_id, rv.rating, rv.body, rv.created_at,
                   u.username, u.user_id
            FROM reviews rv
            JOIN users u ON rv.user_id = u.user_id
            WHERE rv.recipe_id = ?
            ORDER BY rv.created_at DESC
        `, [recipeId]);
        return rows;
    }

    /**
     * Add a new review to a recipe.
     */
    static async addReview(recipeId, userId, rating, body) {
        const result = await db.query(
            `INSERT INTO reviews (recipe_id, user_id, rating, body, created_at)
             VALUES (?, ?, ?, ?, NOW())`,
            [recipeId, userId, rating, body]
        );

        // Update the recipe's average rating and review count
        await db.query(`
            UPDATE recipes
            SET avg_rating = CASE WHEN (SELECT COUNT(*) FROM reviews WHERE recipe_id = ?) > 0 THEN (SELECT AVG(rating) FROM reviews WHERE recipe_id = ?) ELSE NULL END,
                review_count = (SELECT COUNT(*) FROM reviews WHERE recipe_id = ?)
            WHERE recipe_id = ?
        `, [recipeId, recipeId, recipeId, recipeId]);

        return { review_id: result.insertId, recipe_id: recipeId, user_id: userId, rating, body };
    }

    /**
     * Update a review (only by the user who wrote it).
     */
    static async updateReview(reviewId, userId, rating, body) {
        const result = await db.query(
            `UPDATE reviews SET rating = ?, body = ? WHERE review_id = ? AND user_id = ?`,
            [rating, body, reviewId, userId]
        );

        // Get recipe_id from the review
        const review = await db.query('SELECT recipe_id FROM reviews WHERE review_id = ?', [reviewId]);
        if (review.length > 0) {
            const recipeId = review[0].recipe_id;
            // Update the recipe's average rating and review count
            await db.query(`
                UPDATE recipes
                SET avg_rating = CASE WHEN (SELECT COUNT(*) FROM reviews WHERE recipe_id = ?) > 0 THEN (SELECT AVG(rating) FROM reviews WHERE recipe_id = ?) ELSE NULL END,
                    review_count = (SELECT COUNT(*) FROM reviews WHERE recipe_id = ?)
                WHERE recipe_id = ?
            `, [recipeId, recipeId, recipeId, recipeId]);
        }

        return { review_id: reviewId, rating, body };
    }

    /**
     * Delete a review (only by the user who wrote it).
     */
    static async deleteReview(reviewId, userId) {
        // Get recipe_id before deleting
        const review = await db.query('SELECT recipe_id FROM reviews WHERE review_id = ? AND user_id = ?', [reviewId, userId]);
        if (review.length === 0) return false;

        const recipeId = review[0].recipe_id;

        await db.query(
            `DELETE FROM reviews WHERE review_id = ? AND user_id = ?`,
            [reviewId, userId]
        );

        // Update the recipe's average rating and review count
        await db.query(`
            UPDATE recipes
            SET avg_rating = CASE WHEN (SELECT COUNT(*) FROM reviews WHERE recipe_id = ?) > 0 THEN (SELECT AVG(rating) FROM reviews WHERE recipe_id = ?) ELSE NULL END,
                review_count = (SELECT COUNT(*) FROM reviews WHERE recipe_id = ?)
            WHERE recipe_id = ?
        `, [recipeId, recipeId, recipeId, recipeId]);

        return true;
    }
}

module.exports = Review;
