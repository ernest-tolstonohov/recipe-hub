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
     * Get the logged-in user's created recipes.
     */
    static async getMyRecipes(req, res) {
        try {
            const loggedInUser = req.session.user;
            const Recipe = require('../models/recipe');
            const recipes = await Recipe.findByUser(loggedInUser.id);
            res.render('users/my-recipes', { recipes });
        } catch (err) {
            console.error(err);
            res.status(500).render('error', { message: 'Failed to fetch your recipes.' });
        }
    }

    /**
     * Show user profile.
     */
    static async show(req, res) {
        try {
            const profileId = parseInt(req.params.id);
            const user = await User.findById(profileId);
            
            if (!user) {
                return res.status(404).render('error', { message: 'User not found.' });
            }

            // Sprint 3 requirement: check is_active
            if (!user.is_active) {
                return res.status(403).render('error', { message: 'This user profile is no longer active.' });
            }

            // Fetch list of own recipes as requested
            const Recipe = require('../models/recipe');
            const recipes = await Recipe.findByUser(profileId);
            
            res.render('users/profile', { profileUser: user, recipes });
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
