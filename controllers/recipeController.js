const Recipe = require('../models/recipe');
const SavedRecipe = require('../models/savedRecipe');

class RecipeController {
    /**
     * Show recipe details.
     */
    static async detail(req, res) {
        try {
            const recipeId = req.params.id;
            const recipe = await Recipe.findById(recipeId);

            if (!recipe) {
                return res.status(404).render('error', { message: 'Recipe not found.' });
            }

            let isSaved = false;
            if (req.session.user) {
                isSaved = await SavedRecipe.isSaved(req.session.user.id, recipeId);
            }

            res.render('recipes/detail', { recipe, isSaved });
        } catch (err) {
            console.error(err);
            res.status(500).render('error', { message: 'Something went wrong.' });
        }
    }

    /**
     * Search recipes APIs.
     */
    static async search(req, res) {
        try {
            const { ingredients = [], tags = [] } = req.body;
            const recipes = await Recipe.search(ingredients, tags);
            res.json({ recipes });
        } catch (err) {
            console.error('Search error:', err);
            res.status(500).json({ error: 'Failed to search recipes.' });
        }
    }
}

module.exports = RecipeController;
