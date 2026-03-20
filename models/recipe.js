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
     * Search recipes by ingredients and tags using JOIN.
     * @param {Array<string>} ingredients 
     * @param {Array<string>} tags
     * @returns {Promise<Array>}
     */
    static async search(ingredients = [], tags = []) {
        let query = `
            SELECT r.*, u.username as author, 
                   COUNT(ri.ingredient_name) as match_count,
                   (SELECT COUNT(*) FROM recipe_ingredients WHERE recipe_id = r.id) as total_ingredients
            FROM recipes r 
            JOIN users u ON r.user_id = u.id 
            LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id 
        `;
        const params = [];

        if (ingredients && ingredients.length > 0) {
            const placeholders = ingredients.map(() => '?').join(',');
            query += ` AND LOWER(ri.ingredient_name) IN (${placeholders}) `;
            params.push(...ingredients.map(i => i.toLowerCase()));
        }

        query += ` WHERE 1=1 `;

        if (tags && tags.length > 0) {
            tags.forEach(tag => {
                query += ` AND LOWER(r.tags) LIKE ? `;
                params.push(`%${tag.toLowerCase()}%`);
            });
        }

        query += ` GROUP BY r.id `;

        if (ingredients && ingredients.length > 0) {
            query += ` HAVING match_count > 0 `;
        }

        query += ` ORDER BY match_count DESC, r.created_at DESC `;

        const rows = await db.query(query, params);
        
        return rows.map(row => {
            let match_percentage = 0;
            if (row.total_ingredients > 0) {
                match_percentage = Math.round((row.match_count / row.total_ingredients) * 100);
            }
            return { ...row, match_percentage };
        });
    }

    /**
     * Find recipes authored by a specific user.
     * @param {number} userId 
     * @returns {Promise<Array>}
     */
    static async findByUser(userId) {
        const rows = await db.query(`
            SELECT r.*, u.username as author 
            FROM recipes r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
        `, [userId]);
        return rows;
    }
}

module.exports = Recipe;
