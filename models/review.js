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
}

module.exports = Review;
