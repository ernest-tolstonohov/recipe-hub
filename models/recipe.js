const db = require('../app/services/db');

class Recipe {
    /**
     * Find all recipes with their author's username.
     * @returns {Promise<Array>}
     */
    static async findAll() {
        const rows = await db.query(`
            SELECT r.*, u.username as author 
            FROM recipes r 
            JOIN users u ON r.user_id = u.id 
            ORDER BY r.created_at DESC
        `);
        return rows;
    }

    /**
     * Find a single recipe by ID with author details.
     * @param {number} id 
     * @returns {Promise<Object|null>}
     */
    static async findById(id) {
        const rows = await db.query(`
            SELECT r.*, u.username as author 
            FROM recipes r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.id = ?
        `, [id]);
        return rows[0] || null;
    }

    /**
     * Search recipes by ingredients.
     * @param {Array<string>} ingredients 
     * @returns {Promise<Array>}
     */
    static async searchByIngredients(ingredients) {
        if (!ingredients || ingredients.length === 0) {
            return await this.findAll();
        }

        let query = `
            SELECT r.*, u.username as author 
            FROM recipes r 
            JOIN users u ON r.user_id = u.id 
            WHERE 1=1
        `;
        const params = [];

        ingredients.forEach(ing => {
            query += ` AND LOWER(r.ingredients) LIKE ?`;
            params.push(`%${ing.toLowerCase()}%`);
        });

        query += ` ORDER BY r.created_at DESC`;

        const rows = await db.query(query, params);
        return rows;
    }
}

module.exports = Recipe;
