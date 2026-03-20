const db = require('../services/db');

async function show(req, res) {
    try {
        const userId = parseInt(req.params.id);

        // Get user from database
        const users = await db.query(
            `SELECT user_id, username, email, avatar_url, created_at 
             FROM users 
             WHERE user_id = ? AND is_active = 1`,
            [userId]
        );

        // If user not found or deactivated, show 404
        if (!users || users.length === 0) {
            return res.status(404).render('error', { 
                message: 'User not found.',
                user: req.session.user 
            });
        }

        const profileUser = users[0];

        // Get all recipes by this user
        const recipes = await db.query(
            `SELECT recipe_id, title, description, difficulty, 
                    prep_time, cook_time, image_url, created_at
             FROM recipes 
             WHERE user_id = ? 
             ORDER BY created_at DESC`,
            [userId]
        );

        res.render('users/profile', { 
            user: req.session.user,
            profileUser: profileUser,
            recipes: recipes
        });

    } catch (err) {
        console.error(err);
        res.status(500).render('error', { 
            message: 'Something went wrong.',
            user: req.session.user 
        });
    }
}

module.exports = { show };