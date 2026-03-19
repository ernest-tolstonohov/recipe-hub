const User = require('../models/user');
const SavedRecipe = require('../models/savedRecipe');

class UserController {
    /**
     * Get a user's saved recipes.
     */
    static async getSaved(req, res) {
        try {
            const profileId = parseInt(req.params.id);
            const loggedInUser = req.session.user;

            // Only owner or admin may view
            if (loggedInUser.id !== profileId && loggedInUser.role !== 'admin') {
                return res.status(403).render('error', { 
                    message: 'Access Denied. You can only view your own saved recipes.' 
                });
            }

            const profileUser = await User.findById(profileId);
            if (!profileUser) {
                return res.status(404).render('error', { message: 'User not found.' });
            }

            const saved = await SavedRecipe.findByUser(profileId);
            res.render('users/saved', { profileUser, saved });
        } catch (err) {
            console.error(err);
            res.status(500).render('error', { message: 'Something went wrong.' });
        }
    }

    /**
     * Show user profile.
     */
    static async profile(req, res) {
        try {
            const profileId = parseInt(req.params.id);
            const user = await User.findById(profileId);
            if (!user) {
                return res.status(404).render('error', { message: 'User not found.' });
            }

            const saved = await SavedRecipe.findByUser(profileId);
            res.render('users/profile', { profileUser: user, saved });
        } catch (err) {
            console.error(err);
            res.status(500).render('error', { message: 'Something went wrong.' });
        }
    }

    /**
     * Save a recipe for the logged-in user.
     */
    static async save(req, res) {
        try {
            const userId = parseInt(req.params.id);
            const recipeId = parseInt(req.params.rid);
            const loggedInUser = req.session.user;

            if (loggedInUser.id !== userId) {
                return res.status(403).json({ error: 'Unauthorized.' });
            }

            await SavedRecipe.save(userId, recipeId);
            res.json({ saved: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Something went wrong.' });
        }
    }

    /**
     * Unsave a recipe for the logged-in user.
     */
    static async unsave(req, res) {
        try {
            const userId = parseInt(req.params.id);
            const recipeId = parseInt(req.params.rid);
            const loggedInUser = req.session.user;

            if (loggedInUser.id !== userId) {
                return res.status(403).json({ error: 'Unauthorized.' });
            }

            await SavedRecipe.unsave(userId, recipeId);
            res.json({ saved: false });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Something went wrong.' });
        }
    }
}

module.exports = UserController;
