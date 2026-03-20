const express = require('express');
const router = express.Router();
const db = require('../services/db');
const recipeController = require('../controllers/recipeController');

// POST /recipes/search — ingredient-based search (JSON API for homepage widget)
router.post('/recipes/search', recipeController.search);

// GET /browse — browse/search page
router.get('/browse', recipeController.browse);

// GET /recipes/new — placeholder, 404 until recipe creation is built
router.get('/recipes/new', (req, res) => {
    res.status(404).render('404', { user: req.session.user });
});

// GET /recipes/:id — recipe detail page
router.get('/recipes/:id', async (req, res) => {
    try {
        const recipeId = parseInt(req.params.id);
        const rows = await db.query('SELECT * FROM recipes WHERE id = ?', [recipeId]);
        let recipe = rows[0] || null;

        if (!recipe) {
            const demos = {
                1: { id: 1, title: 'Creamy Garlic Chicken Pasta', author: 'jamie_cooks', image_url: '/images/chicken_pasta.png', cuisine: 'Italian', difficulty: 'Easy', prep_time: 15, cook_time: 20, servings: 4, ingredients: '200g spaghetti,4 cloves garlic,200ml cream,50g Parmesan,150g chicken,2 tbsp olive oil,Salt and pepper', instructions: '1. Cook spaghetti until al dente.\n2. Season and cook chicken until golden. Slice and set aside.\n3. Sauté garlic in the same pan for 1 minute.\n4. Add cream and Parmesan. Stir until smooth.\n5. Toss pasta and chicken in the sauce. Serve immediately.' },
                2: { id: 2, title: 'Simple Fried Rice Bowl', author: 'student_eats', image_url: '/images/fried_rice.png', cuisine: 'Asian', difficulty: 'Easy', prep_time: 5, cook_time: 15, servings: 2, ingredients: '2 cups cooked rice,2 eggs,1 cup mixed vegetables,3 tbsp soy sauce,2 cloves garlic,2 tbsp sesame oil,Spring onions', instructions: '1. Heat sesame oil in a wok over high heat.\n2. Add garlic and fry 30 seconds.\n3. Add vegetables and stir-fry 2 minutes.\n4. Push aside, scramble eggs in pan.\n5. Add rice and soy sauce. Toss everything together.\n6. Garnish with spring onions.' },
                3: { id: 3, title: 'Lemon Herb Baked Salmon', author: 'uni_kitchen', image_url: '/images/baked_salmon.png', cuisine: 'Mediterranean', difficulty: 'Easy', prep_time: 10, cook_time: 20, servings: 2, ingredients: '2 salmon fillets,1 lemon (sliced),2 tbsp fresh dill,2 tbsp parsley,2 cloves garlic,2 tbsp olive oil,Salt and pepper', instructions: '1. Preheat oven to 200°C.\n2. Place salmon on a lined baking tray.\n3. Mix olive oil, garlic, dill, and parsley.\n4. Brush herb mix over salmon and top with lemon slices.\n5. Bake 18-20 minutes until salmon flakes easily.' }
            };
            recipe = demos[recipeId] || demos[1];
        }

        let isSaved = false;
        if (req.session.user && recipe.id) {
            const saved = await db.query(
                'SELECT 1 FROM saved_recipes WHERE user_id = ? AND recipe_id = ?',
                [req.session.user.id, recipe.id]
            );
            isSaved = saved.length > 0;
        }

        res.render('recipes/detail', { recipe, isSaved, user: req.session.user });
    } catch (err) {
        console.error('Recipe detail error:', err);
        res.status(500).render('error', { message: 'Could not load recipe.', user: req.session.user });
    }
});

module.exports = router;
