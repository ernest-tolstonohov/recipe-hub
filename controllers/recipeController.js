const Recipe = require('../models/recipe');
const SavedRecipe = require('../models/savedRecipe');
const Review = require('../models/review');
const db = require('../app/services/db');

class RecipeController {
    /**
     * Show new recipe form.
     */
    static async newForm(req, res) {
        try {
            const tags = await db.query('SELECT tag_id, name, type FROM tags ORDER BY type, name');
            res.render('recipes/new', { tags, error: null, fields: {} });
        } catch (err) {
            console.error(err);
            res.status(500).render('error', { message: 'Failed to load form.' });
        }
    }

    /**
     * Create a new recipe.
     */
    static async create(req, res) {
        const { title, description, prep_time, cook_time, servings, difficulty, image_url } = req.body;
        const fields = { title, description, prep_time, cook_time, servings, difficulty, image_url };

        if (!title || !prep_time || !cook_time || !servings || !difficulty) {
            const tags = await db.query('SELECT tag_id, name, type FROM tags ORDER BY type, name');
            return res.render('recipes/new', { tags, error: 'Please fill in all required fields.', fields });
        }

        try {
            // Build instructions array from numbered inputs
            const instructions = [];
            let i = 1;
            while (req.body[`step_${i}`]) {
                if (req.body[`step_${i}`].trim()) instructions.push(req.body[`step_${i}`].trim());
                i++;
            }

            // Insert recipe
            const result = await db.query(
                `INSERT INTO recipes (user_id, title, description, instructions, prep_time, cook_time, servings, difficulty, image_url)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [req.session.user.id, title, description || null, JSON.stringify(instructions),
                 parseInt(prep_time), parseInt(cook_time), parseInt(servings), difficulty, image_url || null]
            );
            const recipeId = result.insertId;

            // Insert ingredients
            const ingNames = [].concat(req.body.ing_name || []);
            const ingQtys  = [].concat(req.body.ing_qty  || []);
            const ingUnits = [].concat(req.body.ing_unit || []);
            for (let j = 0; j < ingNames.length; j++) {
                const name = ingNames[j].trim().toLowerCase();
                if (!name) continue;
                // findOrCreate ingredient
                let [rows] = await db.query('SELECT ingredient_id FROM ingredients WHERE LOWER(name) = ?', [name]);
                let ingredientId;
                if (rows && rows.ingredient_id) {
                    ingredientId = rows.ingredient_id;
                } else {
                    const ins = await db.query('INSERT INTO ingredients (name, created_by) VALUES (?, ?)', [name, req.session.user.id]);
                    ingredientId = ins.insertId;
                }
                await db.query(
                    'INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)',
                    [recipeId, ingredientId, parseFloat(ingQtys[j]) || 1, ingUnits[j] || '']
                );
            }

            // Insert tags
            const selectedTags = [].concat(req.body.tags || []);
            for (const tagId of selectedTags) {
                await db.query('INSERT IGNORE INTO recipe_tags (recipe_id, tag_id) VALUES (?, ?)', [recipeId, tagId]);
            }

            res.redirect(`/recipes/${recipeId}`);
        } catch (err) {
            console.error(err);
            const tags = await db.query('SELECT tag_id, name, type FROM tags ORDER BY type, name');
            res.render('recipes/new', { tags, error: 'Failed to create recipe. Please try again.', fields });
        }
    }

    /**
     * List all recipes.
     */
    static async index(req, res) {
        try {
            const recipes = await Recipe.findAll();
            res.render('recipes/index', { recipes });
        } catch (err) {
            console.error(err);
            res.status(500).render('error', { message: 'Failed to load recipes.' });
        }
    }

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

            // Parse JSON instructions — mysql2 may already return an array
            if (!Array.isArray(recipe.instructions)) {
                try {
                    recipe.instructions = JSON.parse(recipe.instructions);
                } catch (e) {
                    recipe.instructions = [];
                }
            }

            // Fetch normalized ingredients and reviews
            const [ingredients, reviews] = await Promise.all([
                Recipe.findIngredientsByRecipeId(recipeId),
                Review.findByRecipe(recipeId)
            ]);

            let isSaved = false;
            if (req.session.user) {
                isSaved = await SavedRecipe.isSaved(req.session.user.id, recipeId);
            }

            res.render('recipes/detail', { recipe, ingredients, reviews, isSaved });
        } catch (err) {
            console.error(err);
            res.status(500).render('error', { message: 'Something went wrong.' });
        }
    }

    /**
     * Show edit recipe form.
     */
    static async editForm(req, res) {
        try {
            const recipe = await Recipe.findById(req.params.id);
            if (!recipe) return res.status(404).render('error', { message: 'Recipe not found.' });
            if (recipe.user_id !== req.session.user.id) return res.status(403).render('error', { message: 'Not authorised.' });

            if (!Array.isArray(recipe.instructions)) {
                try { recipe.instructions = JSON.parse(recipe.instructions); } catch { recipe.instructions = []; }
            }

            const [tags, ingredients] = await Promise.all([
                db.query('SELECT tag_id, name, type FROM tags ORDER BY type, name'),
                Recipe.findIngredientsByRecipeId(req.params.id)
            ]);
            const selectedTagIds = (await db.query('SELECT tag_id FROM recipe_tags WHERE recipe_id=?', [req.params.id])).map(r => r.tag_id);

            res.render('recipes/edit', { recipe, tags, selectedTagIds, ingredients, error: null });
        } catch (err) {
            console.error(err);
            res.status(500).render('error', { message: 'Failed to load edit form.' });
        }
    }

    /**
     * Update a recipe.
     */
    static async update(req, res) {
        const { title, description, prep_time, cook_time, servings, difficulty, image_url } = req.body;
        const recipeId = req.params.id;

        try {
            const recipe = await Recipe.findById(recipeId);
            if (!recipe) return res.status(404).render('error', { message: 'Recipe not found.' });
            if (recipe.user_id !== req.session.user.id) return res.status(403).render('error', { message: 'Not authorised.' });

            // Build instructions array
            const instructions = [];
            let i = 1;
            while (req.body[`step_${i}`]) {
                if (req.body[`step_${i}`].trim()) instructions.push(req.body[`step_${i}`].trim());
                i++;
            }

            await Recipe.update(recipeId, { title, description, prep_time, cook_time, servings, difficulty, image_url, instructions });

            // Replace ingredients
            await db.query('DELETE FROM recipe_ingredients WHERE recipe_id=?', [recipeId]);
            const ingNames = [].concat(req.body.ing_name || []);
            const ingQtys  = [].concat(req.body.ing_qty  || []);
            const ingUnits = [].concat(req.body.ing_unit || []);
            for (let j = 0; j < ingNames.length; j++) {
                const name = ingNames[j].trim().toLowerCase();
                if (!name) continue;
                let [rows] = await db.query('SELECT ingredient_id FROM ingredients WHERE LOWER(name) = ?', [name]);
                let ingredientId;
                if (rows && rows.ingredient_id) {
                    ingredientId = rows.ingredient_id;
                } else {
                    const ins = await db.query('INSERT INTO ingredients (name, created_by) VALUES (?, ?)', [name, req.session.user.id]);
                    ingredientId = ins.insertId;
                }
                await db.query(
                    'INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)',
                    [recipeId, ingredientId, parseFloat(ingQtys[j]) || 1, ingUnits[j] || '']
                );
            }

            // Replace tags
            await db.query('DELETE FROM recipe_tags WHERE recipe_id=?', [recipeId]);
            const selectedTags = [].concat(req.body.tags || []);
            for (const tagId of selectedTags) {
                await db.query('INSERT IGNORE INTO recipe_tags (recipe_id, tag_id) VALUES (?, ?)', [recipeId, tagId]);
            }

            res.redirect(`/recipes/${recipeId}`);
        } catch (err) {
            console.error(err);
            res.status(500).render('error', { message: 'Failed to update recipe.' });
        }
    }

    /**
     * Delete a recipe.
     */
    static async destroy(req, res) {
        try {
            const recipe = await Recipe.findById(req.params.id);
            if (!recipe) return res.status(404).json({ error: 'Not found.' });
            if (recipe.user_id !== req.session.user.id) return res.status(403).json({ error: 'Not authorised.' });

            await Recipe.delete(req.params.id);
            res.json({ success: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to delete recipe.' });
        }
    }

    /**
     * Search recipes APIs.
     */
    static async search(req, res) {
        try {
            const { ingredients = [], tags = [], matchMode = 'any' } = req.body;
            const recipes = await Recipe.search(ingredients, tags, matchMode);
            res.json({ recipes });
        } catch (err) {
            console.error('Search error:', err);
            res.status(500).json({ error: 'Failed to search recipes.' });
        }
    }
}

module.exports = RecipeController;
