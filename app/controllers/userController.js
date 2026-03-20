const db = require('../services/db');

// GET /users/:id — user profile with their recipes
async function show(req, res) {
    try {
        const userId = parseInt(req.params.id);

        const users = await db.query(
            `SELECT id, username, email, created_at
             FROM users
             WHERE id = ? AND is_active = 1`,
            [userId]
        );

        if (!users || users.length === 0) {
            return res.status(404).render('404', { user: req.session.user });
        }

        const profileUser = users[0];

        const recipes = await db.query(
            `SELECT id, title, description, tags, created_at
             FROM recipes
             WHERE user_id = ?
             ORDER BY created_at DESC`,
            [userId]
        );

        res.render('users/profile', {
            user: req.session.user,
            profileUser,
            recipes
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', {
            message: 'Something went wrong.',
            user: req.session.user
        });
    }
}

// POST /users/:id/saved/:rid — save a recipe
async function save(req, res) {
    try {
        const userId = parseInt(req.params.id);
        const recipeId = parseInt(req.params.rid);

        // Only allow saving own bookmarks
        if (!req.session.user || req.session.user.id !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        await db.query(
            'INSERT IGNORE INTO saved_recipes (user_id, recipe_id) VALUES (?, ?)',
            [userId, recipeId]
        );

        res.json({ saved: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not save recipe.' });
    }
}

// DELETE /users/:id/saved/:rid — unsave a recipe
async function unsave(req, res) {
    try {
        const userId = parseInt(req.params.id);
        const recipeId = parseInt(req.params.rid);

        if (!req.session.user || req.session.user.id !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        await db.query(
            'DELETE FROM saved_recipes WHERE user_id = ? AND recipe_id = ?',
            [userId, recipeId]
        );

        res.json({ saved: false });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not unsave recipe.' });
    }
}

// GET /users/:id/saved — list saved recipes
async function getSaved(req, res) {
    try {
        const userId = parseInt(req.params.id);

        const recipes = await db.query(
            `SELECT r.id, r.title, r.description, r.tags, r.image_url, r.created_at
             FROM saved_recipes sr
             JOIN recipes r ON r.id = sr.recipe_id
             WHERE sr.user_id = ?
             ORDER BY sr.saved_at DESC`,
            [userId]
        );

        res.render('users/saved', {
            user: req.session.user,
            recipes
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', {
            message: 'Could not load saved recipes.',
            user: req.session.user
        });
    }
}

module.exports = { show, save, unsave, getSaved };