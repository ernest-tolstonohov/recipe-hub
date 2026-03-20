const db = require('../services/db');

/**
 * GET /browse — browse/search page with server-side filtering
 * Query params: q (name), tags, difficulty
 */
async function browse(req, res) {
    try {
        const { q = '', tags = '', difficulty = '' } = req.query;

        let sql = `SELECT id, title, description, tags, image_url, created_at FROM recipes WHERE 1=1`;
        const params = [];

        // Full-text name search
        if (q.trim()) {
            sql += ` AND (title LIKE ? OR description LIKE ? OR ingredients LIKE ?)`;
            const like = `%${q.trim()}%`;
            params.push(like, like, like);
        }

        // Tag filter (tags column is comma-separated text)
        if (tags.trim()) {
            sql += ` AND tags LIKE ?`;
            params.push(`%${tags.trim()}%`);
        }

        // Difficulty filter (stored in tags for simple schema)
        if (difficulty.trim()) {
            sql += ` AND tags LIKE ?`;
            params.push(`%${difficulty.trim()}%`);
        }

        sql += ` ORDER BY created_at DESC LIMIT 30`;

        const recipes = await db.query(sql, params);

        res.render('recipes/browse', {
            user: req.session.user,
            recipes,
            q,
            tags,
            difficulty
        });
    } catch (err) {
        console.error('Browse error:', err);
        res.status(500).render('error', {
            message: 'Could not load recipes.',
            user: req.session.user
        });
    }
}

/**
 * POST /recipes/search — ingredient-based search (JSON API for homepage widget)
 * Body: { ingredients: ['chicken','rice'], tags: [] }
 */
async function search(req, res) {
    try {
        let { ingredients = [], tags = [] } = req.body;

        if (typeof ingredients === 'string') {
            ingredients = ingredients.split(',').map(s => s.trim()).filter(Boolean);
        }
        if (typeof tags === 'string') {
            tags = tags.split(',').map(s => s.trim()).filter(Boolean);
        }

        if (ingredients.length === 0) {
            const popular = await db.query(
                `SELECT id, title, description, tags, image_url, created_at
                 FROM recipes ORDER BY created_at DESC LIMIT 12`
            );
            return res.json({ recipes: popular.map(r => ({ ...r, match_count: 0, total_ingredients: 0 })) });
        }

        const placeholders = ingredients.map(() => '?').join(', ');

        const rows = await db.query(
            `SELECT
                r.id, r.title, r.description, r.tags, r.image_url, r.created_at,
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

module.exports = { browse, search };
