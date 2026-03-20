const db = require('../app/services/db');

class SavedRecipe {
    /**
     * Find recipes saved by a specific user.
     * @param {number} userId 
     * @returns {Promise<Array>}
     */
    static async findByUser(userId) {
        const rows = await db.query(`
            SELECT r.recipe_id AS id, r.user_id, r.title, r.description, r.image_url,
                   r.avg_rating, r.review_count, r.difficulty, r.created_at,
                   u.username AS author, sr.saved_at
            FROM saved_recipes sr
            JOIN recipes r ON sr.recipe_id = r.recipe_id
            JOIN users u ON r.user_id = u.user_id
            WHERE sr.user_id = ?
            ORDER BY sr.saved_at DESC
        `, [userId]);
        return rows;
    }

    /**
     * Check if a recipe is saved by a user.
     * @param {number} userId 
     * @param {number} recipeId 
     * @returns {Promise<boolean>}
     */
    static async isSaved(userId, recipeId) {
        const rows = await db.query(
            'SELECT 1 FROM saved_recipes WHERE user_id = ? AND recipe_id = ? LIMIT 1',
            [userId, recipeId]
        );
        return rows.length > 0;
    }

    /**
     * Save a recipe for a user.
     * @param {number} userId 
     * @param {number} recipeId 
     * @returns {Promise<Object>}
     */
    static async save(userId, recipeId) {
        return await db.query(
            'INSERT IGNORE INTO saved_recipes (user_id, recipe_id) VALUES (?, ?)',
            [userId, recipeId]
        );
    }

    /**
     * Unsave a recipe for a user.
     * @param {number} userId 
     * @param {number} recipeId 
     * @returns {Promise<Object>}
     */
    static async unsave(userId, recipeId) {
        return await db.query(
            'DELETE FROM saved_recipes WHERE user_id = ? AND recipe_id = ?',
            [userId, recipeId]
        );
    }
}

module.exports = SavedRecipe;
