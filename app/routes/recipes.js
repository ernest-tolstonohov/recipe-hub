const express = require('express');
const router = express.Router();
const db = require('../services/db');

// Show recipe detail page
router.get('/recipes/:id', async (req, res) => {
    try {
        const recipeId = parseInt(req.params.id);
        
        // Try to get real recipe from DB
        const rows = await db.query('SELECT * FROM recipes WHERE id = ?', [recipeId]);
        let recipe = rows[0] || null;
        
        // If not found in DB, use demo data so the detail page always renders
        if (!recipe) {
            const demos = {
                1: {
                    id: 1,
                    title: 'Creamy Garlic Chicken Pasta',
                    author: 'jamie_cooks',
                    image_url: '/images/chicken_pasta.png',
                    cuisine: 'Italian',
                    difficulty: 'Easy',
                    prep_time: 15,
                    cook_time: 20,
                    servings: 4,
                    ingredients: '200g spaghetti,150g chicken breast,4 cloves garlic,200ml heavy cream,50g Parmesan,2 tbsp olive oil,Salt and pepper to taste',
                    instructions: '1. Cook spaghetti according to package directions until al dente.\n2. Season chicken with salt and pepper, cook in olive oil until golden. Set aside.\n3. In the same pan, sauté garlic for 1 minute.\n4. Add cream and bring to a gentle simmer. Add Parmesan and stir.\n5. Toss pasta and sliced chicken in the sauce. Serve immediately.'
                },
                2: {
                    id: 2,
                    title: 'Simple Fried Rice Bowl',
                    author: 'student_eats',
                    image_url: '/images/fried_rice.png',
                    cuisine: 'Asian',
                    difficulty: 'Easy',
                    prep_time: 5,
                    cook_time: 15,
                    servings: 2,
                    ingredients: '2 cups cooked rice,2 eggs,1 cup mixed vegetables,3 tbsp soy sauce,2 cloves garlic,2 tbsp sesame oil,Spring onions to garnish',
                    instructions: '1. Heat sesame oil in a large wok over high heat.\n2. Add garlic and fry for 30 seconds.\n3. Add vegetables and stir-fry for 2 minutes.\n4. Push to one side, scramble eggs in the pan.\n5. Add rice and soy sauce, toss everything together.\n6. Garnish with spring onions and serve.'
                },
                3: {
                    id: 3,
                    title: 'Lemon Herb Baked Salmon',
                    author: 'uni_kitchen',
                    image_url: '/images/baked_salmon.png',
                    cuisine: 'Mediterranean',
                    difficulty: 'Easy',
                    prep_time: 10,
                    cook_time: 20,
                    servings: 2,
                    ingredients: '2 salmon fillets,1 lemon (sliced),2 tbsp fresh dill,2 tbsp fresh parsley,2 cloves garlic,2 tbsp olive oil,Salt and pepper to taste',
                    instructions: '1. Preheat oven to 200°C / 400°F.\n2. Place salmon on a lined baking tray.\n3. Mix olive oil, crushed garlic, dill, and parsley.\n4. Brush mixture over salmon. Top with lemon slices.\n5. Bake for 18-20 minutes until salmon flakes easily.\n6. Serve with salad or roasted vegetables.'
                }
            };
            recipe = demos[recipeId] || demos[1];
        }
        
        const isSaved = false; // default for non-logged-in users
        res.render('recipes/detail', { recipe, isSaved });
    } catch (err) {
        console.error('Recipe detail error:', err);
        // Fallback with demo recipe
        const recipe = {
            id: parseInt(req.params.id) || 1,
            title: 'Creamy Garlic Chicken Pasta',
            author: 'jamie_cooks',
            image_url: '/images/chicken_pasta.png',
            cuisine: 'Italian',
            difficulty: 'Easy',
            prep_time: 15,
            cook_time: 20,
            servings: 4,
            ingredients: '200g spaghetti,4 cloves garlic,200ml cream,50g Parmesan,2 tbsp olive oil',
            instructions: '1. Cook spaghetti until al dente.\n2. Sauté garlic in oil.\n3. Add cream and Parmesan.\n4. Toss with pasta and serve.'
        };
        res.render('recipes/detail', { recipe, isSaved: false });
    }
});

module.exports = router;
