const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Review = require('../models/review');

async function getRecipesWithReviews() {
    const recipes = await Recipe.findAll();
    for (const recipe of recipes) {
        recipe.reviews = await Review.findByRecipe(recipe.id);
    }
    return recipes;
}

async function getDashboard(req, res) {
    const tab = req.query.tab || 'users';
    try {
        if (tab === 'users') {
            const users = await User.findAll();
            res.render('admin', { user: req.session.user, tab, users, recipes: null });
        } else {
            const recipes = await getRecipesWithReviews();
            res.render('admin', { user: req.session.user, tab, users: null, recipes });
        }
    } catch (err) {
        console.error('[Admin] getDashboard error:', err);
        res.status(500).render('error', { message: 'Failed to load admin panel', user: req.session.user });
    }
}

async function toggleUserStatus(req, res) {
    const targetId = parseInt(req.params.id, 10);
    const adminId = req.session.user.id;

    if (targetId === adminId) {
        return res.status(400).json({ error: 'Cannot change your own status' });
    }

    try {
        const targetUser = await User.findById(targetId);
        if (!targetUser) return res.status(404).json({ error: 'User not found' });

        const newStatus = !targetUser.is_active;
        await User.setActive(targetId, newStatus);
        res.json({ ok: true, is_active: newStatus });
    } catch (err) {
        console.error('[Admin] toggleUserStatus error:', err);
        res.status(500).json({ error: 'Server error' });
    }
}

async function deleteRecipe(req, res) {
    const id = parseInt(req.params.id, 10);
    try {
        await Recipe.delete(id);
        res.json({ ok: true });
    } catch (err) {
        console.error('[Admin] deleteRecipe error:', err);
        res.status(500).json({ error: 'Server error' });
    }
}

async function deleteReview(req, res) {
    const id = parseInt(req.params.id, 10);
    try {
        const deleted = await Review.deleteReview(id);
        if (!deleted) return res.status(404).json({ error: 'Review not found' });
        res.json({ ok: true });
    } catch (err) {
        console.error('[Admin] deleteReview error:', err);
        res.status(500).json({ error: 'Server error' });
    }
}

module.exports = { getDashboard, toggleUserStatus, deleteRecipe, deleteReview };
