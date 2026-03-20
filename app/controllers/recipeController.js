const db = require('../services/db');

/**
 * POST /recipes/search
 * Body: { ingredients: ['chicken','rice'], tags: ['vegan'] }
 * Returns JSON sorted by match_count DESC
 */
async function search(req, res) {
    try {
        let { ingredients = [], tags = [] } = req.body;

        // Accept both array and comma-separated string
        if (typeof ingredients === 'string') {
            ingredients = ingredients.split(',').map(s => s.trim()).filter(Boolean);
        }
        if (typeof tags === 'string') {
            tags = tags.split(',').map(s => s.trim()).filter(Boolean);
        }

        if (ingredients.length === 0) {
            // No ingredients — return popular recipes (no search)
            const popular = await db.query(
                `SELECT id, title, description, tags, image_url, created_at
                 FROM recipes
                 ORDER BY created_at DESC
                 LIMIT 12`
            );
            return res.json({ recipes: popular.map(r => ({ ...r, match_count: 0, total_ingredients: 0 })) });
        }

        // Build placeholders for the IN clause
        const placeholders = ingredients.map(() => '?').join(', ');

        const rows = await db.query(
            `SELECT
                r.id,
                r.title,
                r.description,
                r.tags,
                r.image_url,
                r.created_at,
                COUNT(ri.ingredient_name) AS match_count,
                (SELECT COUNT(*) FROM recipe_ingredients WHERE recipe_id = r.id) AS total_ingredients
             FROM recipes r
             JOIN recipe_ingredients ri
               ON ri.recipe_id = r.id
               AND LOWER(ri.ingredient_name) IN (${placeholders})
             GROUP BY r.id
             ORDER BY match_count DESC
             LIMIT 20`,
            ingredients.map(i => i.toLowerCase())
        );

        // Optionally filter by tags (comma-separated stored field)
        let results = rows;
        if (tags.length > 0) {
            results = rows.filter(r => {
                if (!r.tags) return false;
                const recipeTags = r.tags.toLowerCase().split(',').map(t => t.trim());
                return tags.some(t => recipeTags.includes(t.toLowerCase()));
            });
        }

        res.json({ recipes: results });
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ error: 'Search failed.' });
    }
}

module.exports = { search };
