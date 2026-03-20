const db = require('../app/services/db');

class Recipe {
    /**
     * Find all recipes with their author's username.
     * @returns {Promise<Array>}
     */
    static async findAll() {
        const rows = await db.query(`
            SELECT r.recipe_id AS id, r.user_id, r.title, r.description, r.instructions,
                   r.prep_time, r.cook_time, r.servings, r.difficulty,
                   COALESCE(r.image_url, '/images/default-recipe.svg') AS image_url, r.avg_rating, r.review_count, r.created_at, r.updated_at,
                   u.username AS author
            FROM recipes r
            JOIN users u ON r.user_id = u.user_id
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
            SELECT r.recipe_id AS id, r.user_id, r.title, r.description, r.instructions,
                   r.prep_time, r.cook_time, r.servings, r.difficulty,
                   COALESCE(r.image_url, '/images/default-recipe.svg') AS image_url, r.avg_rating, r.review_count, r.created_at, r.updated_at,
                   u.username AS author
            FROM recipes r
            JOIN users u ON r.user_id = u.user_id
            WHERE r.recipe_id = ?
        `, [id]);
        return rows[0] || null;
    }

    /**
     * Search recipes by ingredients and tags using JOIN.
     * @param {Array<string>} ingredients
     * @param {Array<string>} tags
     * @returns {Promise<Array>}
     */
    static async search(ingredients = [], tags = [], matchMode = 'any') {
        const params = [];

        // Correlated subquery counts how many of the selected ingredients a recipe has.
        // This avoids the LEFT JOIN / WHERE interaction that breaks match counts.
        let matchCountSubquery = '0';
        if (ingredients.length > 0) {
            const placeholders = ingredients.map(() => '?').join(',');
            matchCountSubquery = `(
                SELECT COUNT(DISTINCT ri2.ingredient_id)
                FROM recipe_ingredients ri2
                JOIN ingredients ing2 ON ri2.ingredient_id = ing2.ingredient_id
                WHERE ri2.recipe_id = r.recipe_id
                  AND LOWER(ing2.name) IN (${placeholders})
            )`;
            params.push(...ingredients.map(i => i.toLowerCase()));
        }

        let query = `
            SELECT r.recipe_id AS id, r.user_id, r.title, r.description, COALESCE(r.image_url, '/images/default-recipe.svg') AS image_url,
                   r.avg_rating, r.review_count, r.difficulty, r.prep_time, r.cook_time, r.servings, r.created_at,
                   u.username AS author,
                   ${matchCountSubquery} AS match_count,
                   (SELECT COUNT(*) FROM recipe_ingredients WHERE recipe_id = r.recipe_id) AS total_ingredients
            FROM recipes r
            JOIN users u ON r.user_id = u.user_id
        `;

        const conditions = [];

        if (tags.length > 0) {
            tags.forEach(() => {
                conditions.push(`
                    EXISTS (
                        SELECT 1 FROM recipe_tags rt
                        JOIN tags t ON rt.tag_id = t.tag_id
                        WHERE rt.recipe_id = r.recipe_id AND LOWER(t.name) = ?
                    )
                `);
            });
            params.push(...tags.map(t => t.toLowerCase()));
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' GROUP BY r.recipe_id ';

        if (ingredients.length > 0) {
            if (matchMode === 'all') {
                query += ` HAVING match_count = ? `;
                params.push(ingredients.length);
            } else {
                query += ' HAVING match_count > 0 ';
            }
        }

        query += ' ORDER BY match_count DESC, r.created_at DESC ';

        const rows = await db.query(query, params);

        return rows.map(row => {
            const match_percentage = row.total_ingredients > 0
                ? Math.round((row.match_count / row.total_ingredients) * 100)
                : 0;
            return { ...row, match_percentage };
        });
    }

    /**
     * Find ingredients for a recipe.
     * @param {number} id
     * @returns {Promise<Array>}
     */
    static async findIngredientsByRecipeId(id) {
        const rows = await db.query(`
            SELECT ing.name, ri.quantity, ri.unit
            FROM recipe_ingredients ri
            JOIN ingredients ing ON ri.ingredient_id = ing.ingredient_id
            WHERE ri.recipe_id = ?
            ORDER BY ing.name
        `, [id]);
        return rows;
    }

    /**
     * Update a recipe (basic fields + instructions).
     */
    static async update(id, { title, description, prep_time, cook_time, servings, difficulty, image_url, instructions }) {
        await db.query(
            `UPDATE recipes SET title=?, description=?, prep_time=?, cook_time=?, servings=?, difficulty=?, image_url=?, instructions=?, updated_at=NOW()
             WHERE recipe_id=?`,
            [title, description || null, parseInt(prep_time), parseInt(cook_time), parseInt(servings), difficulty, image_url || null, JSON.stringify(instructions), id]
        );
    }

    /**
     * Delete a recipe and its related data.
     */
    static async delete(id) {
        await db.query('DELETE FROM recipe_tags WHERE recipe_id=?', [id]);
        await db.query('DELETE FROM recipe_ingredients WHERE recipe_id=?', [id]);
        await db.query('DELETE FROM saved_recipes WHERE recipe_id=?', [id]);
        await db.query('DELETE FROM reviews WHERE recipe_id=?', [id]);
        await db.query('DELETE FROM recipes WHERE recipe_id=?', [id]);
    }

    /**
     * Find recipes authored by a specific user.
     * @param {number} userId
     * @returns {Promise<Array>}
     */
    static async findByUser(userId) {
        const rows = await db.query(`
            SELECT r.recipe_id AS id, r.user_id, r.title, r.description, COALESCE(r.image_url, '/images/default-recipe.svg') AS image_url,
                   r.avg_rating, r.review_count, r.difficulty, r.prep_time, r.cook_time, r.servings, r.created_at,
                   u.username AS author
            FROM recipes r
            JOIN users u ON r.user_id = u.user_id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
        `, [userId]);
        return rows;
    }
}

module.exports = Recipe;
