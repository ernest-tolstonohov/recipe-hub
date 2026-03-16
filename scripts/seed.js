// =============================================================
// RecipeHub — Seed File
// Sprint 3
//
// HOW TO RUN:
//   Option A (recommended with current docker-compose networking):
//     1. docker compose up -d
//     2. docker compose exec web node scripts/seed.js
//
//   Option B (run on your host machine):
//     1. docker compose up -d
//     2. Ensure your .env points at the published port:
//          DB_CONTAINER=localhost
//          DB_PORT=3308
//     3. node scripts/seed.js
//
// WHAT IT DOES:
//   - Connects to MySQL using your .env config
//   - Hashes passwords with bcrypt (FIX 3)
//   - Inserts demo users, tags, ingredients, recipes, reviews
//   - instructions are stored as JSON arrays (FIX 1)
//   - avg_rating and review_count are calculated from demo
//     reviews and written directly into recipes (FIX 2)
//
// REQUIREMENTS:
//   npm install
// =============================================================

require('dotenv').config();
const bcrypt = require('bcrypt');
const mysql  = require('mysql2/promise');

// =============================================================
// DB CONNECTION
// Reads from your .env file. Make sure these match docker-compose.yml
// =============================================================
async function getConnection() {
  return mysql.createConnection({
    host:     process.env.DB_CONTAINER || process.env.MYSQL_HOST || 'localhost',
    port:     Number(process.env.DB_PORT || 3306),
    user:     process.env.MYSQL_ROOT_USER || process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_ROOT_PASSWORD || process.env.MYSQL_PASS || 'root',
    database: process.env.MYSQL_DATABASE || 'recipehub',
    multipleStatements: false,
  });
}

// =============================================================
// HELPERS
// =============================================================
async function hash(password) {
  // bcrypt rounds=10 is standard. Higher = slower but more secure.
  return bcrypt.hash(password, 10);
}

// =============================================================
// SEED
// =============================================================
async function seed() {
  const db = await getConnection();
  console.log('Connected to MySQL.\n');

  try {
    // ----------------------------------------------------------
    // USERS
    // All demo users share the password: password123
    // In real life every user would have their own password.
    // ----------------------------------------------------------
    console.log('Seeding users...');
    const passwordHash = await hash('password123');

    const users = [
      { username: 'admin',        email: 'admin@recipehub.dev',  role: 'admin' },
      { username: 'alice_cooks',  email: 'alice@example.com',    role: 'user'  },
      { username: 'ethan_budget', email: 'ethan@example.com',    role: 'user'  },
      { username: 'lara_vegan',   email: 'lara@example.com',     role: 'user'  },
      { username: 'buni_kitchen', email: 'buni@example.com',     role: 'user'  },
      { username: 'mike_dorm',    email: 'mike@example.com',     role: 'user'  },
    ];

    for (const u of users) {
      await db.execute(
        `INSERT INTO users (username, email, password_hash, role)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE email = email`,
        [u.username, u.email, passwordHash, u.role]
      );
    }
    console.log(`  ${users.length} users inserted.\n`);

    // ----------------------------------------------------------
    // TAGS
    // type controls which dropdown the tag appears in on the UI.
    // ----------------------------------------------------------
    console.log('Seeding tags...');
    const tags = [
      // dietary
      { name: 'Vegan',        type: 'dietary'   },
      { name: 'Vegetarian',   type: 'dietary'   },
      { name: 'Gluten-Free',  type: 'dietary'   },
      { name: 'Dairy-Free',   type: 'dietary'   },
      { name: 'Nut-Free',     type: 'dietary'   },
      { name: 'High-Protein', type: 'dietary'   },
      // meal type
      { name: 'Breakfast',    type: 'meal_type' },
      { name: 'Lunch',        type: 'meal_type' },
      { name: 'Dinner',       type: 'meal_type' },
      { name: 'Dessert',      type: 'meal_type' },
      { name: 'Snack',        type: 'meal_type' },
      { name: 'Quick',        type: 'meal_type' },
      // cuisine
      { name: 'Italian',      type: 'cuisine'   },
      { name: 'Asian',        type: 'cuisine'   },
      { name: 'Mexican',      type: 'cuisine'   },
      { name: 'British',      type: 'cuisine'   },
      { name: 'Indian',       type: 'cuisine'   },
      { name: 'Budget',       type: 'cuisine'   },
    ];

    for (const t of tags) {
      await db.execute(
        `INSERT INTO tags (name, type, created_by)
         VALUES (?, ?, 1)
         ON DUPLICATE KEY UPDATE name = name`,
        [t.name, t.type]
      );
    }
    console.log(`  ${tags.length} tags inserted.\n`);

    // ----------------------------------------------------------
    // INGREDIENTS
    // Global shared list. Each ingredient exists only once.
    // recipe_ingredients stores the quantity per recipe.
    // ----------------------------------------------------------
    console.log('Seeding ingredients...');
    const ingredients = [
      'spaghetti', 'egg', 'pancetta', 'Pecorino Romano', 'black pepper',
      'garlic', 'olive oil', 'rice', 'soy sauce', 'spring onion',
      'sesame oil', 'chicken breast', 'lemon', 'butter', 'flour',
      'oat milk', 'banana', 'baking powder', 'salt', 'onion',
      'tomato', 'cheddar cheese', 'bread', 'kidney beans', 'cumin',
      'chilli powder', 'paprika', 'vegetable stock', 'potato', 'carrot',
    ];

    for (const name of ingredients) {
      await db.execute(
        `INSERT INTO ingredients (name, created_by)
         VALUES (?, 2)
         ON DUPLICATE KEY UPDATE name = name`,
        [name]
      );
    }
    console.log(`  ${ingredients.length} ingredients inserted.\n`);

    // ----------------------------------------------------------
    // RECIPES
    // instructions stored as JSON array (FIX 1).
    // avg_rating and review_count start at 0 — updated below
    // after reviews are inserted (FIX 2).
    // ----------------------------------------------------------
    console.log('Seeding recipes...');
    const recipes = [
      {
        user_id:     2, // alice_cooks
        title:       'Classic Spaghetti Carbonara',
        description: 'Rich and creamy Italian pasta. No cream needed — the silky sauce comes from eggs alone.',
        instructions: [
          'Bring a large pot of salted water to a boil. Cook spaghetti until al dente. Reserve 1 cup of pasta water before draining.',
          'Fry pancetta in a large pan over medium heat until crispy. Add minced garlic and cook for 1 minute. Remove from heat.',
          'Whisk together eggs and grated Pecorino Romano in a bowl. Season generously with black pepper.',
          'Add hot pasta to the pancetta pan off the heat. Pour egg mixture over, tossing quickly. Add pasta water gradually to create a silky sauce. Serve immediately.',
        ],
        prep_time: 10, cook_time: 20, servings: 4, difficulty: 'medium',
      },
      {
        user_id:     3, // ethan_budget
        title:       'Simple Fried Rice Bowl',
        description: 'Budget-friendly fried rice using leftover rice and whatever veg you have. Ready in 15 minutes.',
        instructions: [
          'Heat sesame oil in a wok or large frying pan over high heat.',
          'Add spring onion and garlic, stir-fry for 30 seconds.',
          'Push to the side, crack in eggs and scramble until just set, then mix through the rice.',
          'Add soy sauce and toss everything together for 2 minutes. Serve hot.',
        ],
        prep_time: 5, cook_time: 15, servings: 2, difficulty: 'easy',
      },
      {
        user_id:     5, // buni_kitchen
        title:       'Lemon Herb Baked Salmon',
        description: 'Light and healthy baked salmon with a lemon and garlic topping.',
        instructions: [
          'Preheat oven to 200°C (180°C fan). Line a baking tray with foil.',
          'Place salmon fillets on the tray. Season with salt and pepper.',
          'Squeeze lemon juice over the fillets. Top each with butter and minced garlic.',
          'Bake for 15–18 minutes until the fish flakes easily. Serve with steamed vegetables.',
        ],
        prep_time: 5, cook_time: 18, servings: 2, difficulty: 'easy',
      },
      {
        user_id:     4, // lara_vegan
        title:       'Vegan Banana Oat Pancakes',
        description: 'Fluffy, naturally sweet pancakes with no eggs and no dairy.',
        instructions: [
          'Mash 2 ripe bananas in a large bowl until smooth.',
          'Add flour, oat milk, and baking powder. Mix until just combined — a few lumps are fine.',
          'Heat a non-stick pan over medium heat. Lightly grease with oil.',
          'Pour small ladles of batter into the pan. Cook until bubbles form (about 2 min), then flip. Cook for 1 more minute until golden.',
          'Serve with fresh fruit or maple syrup.',
        ],
        prep_time: 5, cook_time: 15, servings: 8, difficulty: 'easy',
      },
      {
        user_id:     6, // mike_dorm
        title:       'Cheesy Jacket Potato',
        description: 'The ultimate student comfort food. Crispy skin, fluffy inside, loaded with cheddar.',
        instructions: [
          'Preheat oven to 220°C. Scrub potatoes and prick all over with a fork.',
          'Rub with olive oil and salt. Place directly on the oven rack.',
          'Bake for 60 minutes until the skin is crispy and inside is soft.',
          'Cut open, add butter and a generous handful of grated cheddar. Serve immediately.',
        ],
        prep_time: 5, cook_time: 60, servings: 1, difficulty: 'easy',
      },
      {
        user_id:     3, // ethan_budget
        title:       'Spicy Bean Chilli',
        description: 'Hearty protein-packed chilli using storecupboard staples. Feeds 4 for under £3.',
        instructions: [
          'Fry diced onion in oil over medium heat for 5 minutes until soft.',
          'Add garlic, cumin, chilli powder, and paprika. Cook for 1 minute.',
          'Add kidney beans and chopped tomatoes. Pour in vegetable stock and stir well.',
          'Simmer on low heat for 25 minutes, stirring occasionally.',
          'Season to taste. Serve with rice or bread.',
        ],
        prep_time: 10, cook_time: 30, servings: 4, difficulty: 'easy',
      },
      {
        user_id:     2, // alice_cooks
        title:       'Garlic Butter Chicken',
        description: 'Juicy pan-fried chicken breasts with a garlicky butter sauce. Ready in 25 minutes.',
        instructions: [
          'Season chicken breasts with salt, pepper, and paprika on both sides.',
          'Heat olive oil in a pan over medium-high heat. Cook chicken for 6–7 minutes per side until golden.',
          'Reduce heat, add butter and minced garlic. Baste the chicken for 1–2 minutes.',
          'Squeeze lemon juice over the top. Serve with your choice of sides.',
        ],
        prep_time: 5, cook_time: 20, servings: 2, difficulty: 'medium',
      },
    ];

    for (const r of recipes) {
      await db.execute(
        `INSERT INTO recipes
           (user_id, title, description, instructions, prep_time, cook_time, servings, difficulty)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          r.user_id, r.title, r.description,
          JSON.stringify(r.instructions), // FIX 1 — store as JSON
          r.prep_time, r.cook_time, r.servings, r.difficulty,
        ]
      );
    }
    console.log(`  ${recipes.length} recipes inserted.\n`);

    // ----------------------------------------------------------
    // RECIPE_INGREDIENTS
    // ingredient_id matches the insertion order above (1-indexed).
    // quantity and unit are per-recipe values.
    // ----------------------------------------------------------
    console.log('Seeding recipe ingredients...');
    const recipeIngredients = [
      // Recipe 1 — Spaghetti Carbonara
      { recipe_id: 1, ingredient_id: 1,  quantity: 200, unit: 'g'      }, // spaghetti
      { recipe_id: 1, ingredient_id: 2,  quantity: 3,   unit: ''       }, // egg
      { recipe_id: 1, ingredient_id: 3,  quantity: 100, unit: 'g'      }, // pancetta
      { recipe_id: 1, ingredient_id: 4,  quantity: 50,  unit: 'g'      }, // Pecorino Romano
      { recipe_id: 1, ingredient_id: 5,  quantity: 1,   unit: 'tsp'    }, // black pepper
      { recipe_id: 1, ingredient_id: 6,  quantity: 2,   unit: 'cloves' }, // garlic
      // Recipe 2 — Fried Rice Bowl
      { recipe_id: 2, ingredient_id: 8,  quantity: 200, unit: 'g'      }, // rice
      { recipe_id: 2, ingredient_id: 2,  quantity: 2,   unit: ''       }, // egg
      { recipe_id: 2, ingredient_id: 9,  quantity: 2,   unit: 'tbsp'   }, // soy sauce
      { recipe_id: 2, ingredient_id: 10, quantity: 3,   unit: ''       }, // spring onion
      { recipe_id: 2, ingredient_id: 11, quantity: 1,   unit: 'tsp'    }, // sesame oil
      { recipe_id: 2, ingredient_id: 6,  quantity: 2,   unit: 'cloves' }, // garlic
      // Recipe 3 — Baked Salmon
      { recipe_id: 3, ingredient_id: 12, quantity: 2,   unit: ''       }, // chicken breast (salmon — add salmon ingredient ideally)
      { recipe_id: 3, ingredient_id: 13, quantity: 1,   unit: ''       }, // lemon
      { recipe_id: 3, ingredient_id: 14, quantity: 20,  unit: 'g'      }, // butter
      { recipe_id: 3, ingredient_id: 6,  quantity: 2,   unit: 'cloves' }, // garlic
      { recipe_id: 3, ingredient_id: 19, quantity: 0.5, unit: 'tsp'    }, // salt
      // Recipe 4 — Vegan Pancakes
      { recipe_id: 4, ingredient_id: 17, quantity: 2,   unit: ''       }, // banana
      { recipe_id: 4, ingredient_id: 15, quantity: 150, unit: 'g'      }, // flour
      { recipe_id: 4, ingredient_id: 16, quantity: 200, unit: 'ml'     }, // oat milk
      { recipe_id: 4, ingredient_id: 18, quantity: 1,   unit: 'tsp'    }, // baking powder
      { recipe_id: 4, ingredient_id: 19, quantity: 0.5, unit: 'tsp'    }, // salt
      // Recipe 5 — Jacket Potato
      { recipe_id: 5, ingredient_id: 29, quantity: 2,   unit: ''       }, // potato
      { recipe_id: 5, ingredient_id: 22, quantity: 80,  unit: 'g'      }, // cheddar
      { recipe_id: 5, ingredient_id: 14, quantity: 20,  unit: 'g'      }, // butter
      { recipe_id: 5, ingredient_id: 7,  quantity: 1,   unit: 'tbsp'   }, // olive oil
      { recipe_id: 5, ingredient_id: 19, quantity: 0.5, unit: 'tsp'    }, // salt
      // Recipe 6 — Spicy Bean Chilli
      { recipe_id: 6, ingredient_id: 24, quantity: 400, unit: 'g'      }, // kidney beans
      { recipe_id: 6, ingredient_id: 21, quantity: 400, unit: 'g'      }, // tomato
      { recipe_id: 6, ingredient_id: 20, quantity: 1,   unit: ''       }, // onion
      { recipe_id: 6, ingredient_id: 6,  quantity: 3,   unit: 'cloves' }, // garlic
      { recipe_id: 6, ingredient_id: 25, quantity: 1,   unit: 'tsp'    }, // cumin
      { recipe_id: 6, ingredient_id: 26, quantity: 0.5, unit: 'tsp'    }, // chilli powder
      { recipe_id: 6, ingredient_id: 27, quantity: 1,   unit: 'tsp'    }, // paprika
      { recipe_id: 6, ingredient_id: 28, quantity: 200, unit: 'ml'     }, // vegetable stock
      // Recipe 7 — Garlic Butter Chicken
      { recipe_id: 7, ingredient_id: 12, quantity: 2,   unit: ''       }, // chicken breast
      { recipe_id: 7, ingredient_id: 6,  quantity: 4,   unit: 'cloves' }, // garlic
      { recipe_id: 7, ingredient_id: 14, quantity: 30,  unit: 'g'      }, // butter
      { recipe_id: 7, ingredient_id: 7,  quantity: 1,   unit: 'tbsp'   }, // olive oil
      { recipe_id: 7, ingredient_id: 13, quantity: 0.5, unit: ''       }, // lemon
      { recipe_id: 7, ingredient_id: 27, quantity: 1,   unit: 'tsp'    }, // paprika
    ];

    for (const ri of recipeIngredients) {
      await db.execute(
        `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
         VALUES (?, ?, ?, ?)`,
        [ri.recipe_id, ri.ingredient_id, ri.quantity, ri.unit]
      );
    }
    console.log(`  ${recipeIngredients.length} recipe ingredients inserted.\n`);

    // ----------------------------------------------------------
    // RECIPE_TAGS
    // tag_id matches insertion order above.
    // ----------------------------------------------------------
    console.log('Seeding recipe tags...');
    const recipeTags = [
      { recipe_id: 1, tag_id: 9  }, // Carbonara      → Dinner
      { recipe_id: 1, tag_id: 13 }, // Carbonara      → Italian
      { recipe_id: 2, tag_id: 8  }, // Fried Rice     → Lunch
      { recipe_id: 2, tag_id: 14 }, // Fried Rice     → Asian
      { recipe_id: 2, tag_id: 12 }, // Fried Rice     → Quick
      { recipe_id: 3, tag_id: 9  }, // Salmon         → Dinner
      { recipe_id: 3, tag_id: 6  }, // Salmon         → High-Protein
      { recipe_id: 4, tag_id: 1  }, // Pancakes       → Vegan
      { recipe_id: 4, tag_id: 4  }, // Pancakes       → Dairy-Free
      { recipe_id: 4, tag_id: 7  }, // Pancakes       → Breakfast
      { recipe_id: 5, tag_id: 2  }, // Jacket Potato  → Vegetarian
      { recipe_id: 5, tag_id: 9  }, // Jacket Potato  → Dinner
      { recipe_id: 5, tag_id: 16 }, // Jacket Potato  → British
      { recipe_id: 6, tag_id: 1  }, // Chilli         → Vegan
      { recipe_id: 6, tag_id: 9  }, // Chilli         → Dinner
      { recipe_id: 6, tag_id: 18 }, // Chilli         → Budget
      { recipe_id: 7, tag_id: 9  }, // Garlic Chicken → Dinner
      { recipe_id: 7, tag_id: 6  }, // Garlic Chicken → High-Protein
    ];

    for (const rt of recipeTags) {
      await db.execute(
        `INSERT INTO recipe_tags (recipe_id, tag_id) VALUES (?, ?)`,
        [rt.recipe_id, rt.tag_id]
      );
    }
    console.log(`  ${recipeTags.length} recipe tags inserted.\n`);

    // ----------------------------------------------------------
    // REVIEWS
    // After inserting reviews we recalculate avg_rating and
    // review_count for each recipe (FIX 2).
    // ----------------------------------------------------------
    console.log('Seeding reviews...');
    const reviews = [
      { recipe_id: 1, user_id: 3, rating: 5, body: 'Really easy to follow for a beginner. Turned out creamy and delicious first try.' },
      { recipe_id: 1, user_id: 4, rating: 4, body: 'Halved the recipe for one person, worked perfectly. Used bacon instead of pancetta.' },
      { recipe_id: 1, user_id: 5, rating: 5, body: 'Best carbonara I have made at home. The pasta water trick is essential.' },
      { recipe_id: 2, user_id: 2, rating: 4, body: 'Quick and filling. I added some frozen peas and it worked great.' },
      { recipe_id: 2, user_id: 5, rating: 5, body: 'Perfect weeknight meal. Used up leftover rice from the night before.' },
      { recipe_id: 3, user_id: 2, rating: 5, body: 'So simple and healthy. Will be making this every week.' },
      { recipe_id: 3, user_id: 6, rating: 4, body: 'Really good. Added some herbs on top before baking.' },
      { recipe_id: 4, user_id: 3, rating: 5, body: 'Could not believe these had no eggs. Fluffy and naturally sweet.' },
      { recipe_id: 4, user_id: 6, rating: 4, body: 'Great recipe. Used almond milk instead of oat milk, still worked.' },
      { recipe_id: 5, user_id: 2, rating: 4, body: 'Classic student meal done right. The crispy skin makes the difference.' },
      { recipe_id: 5, user_id: 4, rating: 3, body: 'Good but takes a long time. Worth it though.' },
      { recipe_id: 6, user_id: 2, rating: 5, body: 'Fed four people for almost nothing. Will make this on repeat.' },
      { recipe_id: 6, user_id: 5, rating: 4, body: 'Added extra chilli and served with rice. Really satisfying.' },
      { recipe_id: 7, user_id: 3, rating: 5, body: 'The garlic butter sauce is incredible. Made it twice already.' },
      { recipe_id: 7, user_id: 4, rating: 4, body: 'Really flavourful and quick to make. Great with rice.' },
    ];

    for (const r of reviews) {
      await db.execute(
        `INSERT INTO reviews (recipe_id, user_id, rating, body) VALUES (?, ?, ?, ?)`,
        [r.recipe_id, r.user_id, r.rating, r.body]
      );
    }
    console.log(`  ${reviews.length} reviews inserted.\n`);

    // ----------------------------------------------------------
    // UPDATE avg_rating + review_count  (FIX 2)
    // This is the same logic your reviewController will run
    // in production after every new review is submitted.
    // ----------------------------------------------------------
    console.log('Updating avg_rating and review_count for all recipes...');
    await db.execute(`
      UPDATE recipes r
      SET
        avg_rating   = (SELECT ROUND(AVG(rating), 2) FROM reviews WHERE recipe_id = r.recipe_id),
        review_count = (SELECT COUNT(*)              FROM reviews WHERE recipe_id = r.recipe_id)
    `);
    console.log('  Done.\n');

    // ----------------------------------------------------------
    // SAVED RECIPES
    // A few demo bookmarks so the saved recipes page has data.
    // ----------------------------------------------------------
    console.log('Seeding saved recipes...');
    const saved = [
      { user_id: 2, recipe_id: 2 },
      { user_id: 2, recipe_id: 6 },
      { user_id: 3, recipe_id: 1 },
      { user_id: 3, recipe_id: 7 },
      { user_id: 4, recipe_id: 4 },
      { user_id: 5, recipe_id: 3 },
    ];

    for (const s of saved) {
      await db.execute(
        `INSERT INTO saved_recipes (user_id, recipe_id) VALUES (?, ?)`,
        [s.user_id, s.recipe_id]
      );
    }
    console.log(`  ${saved.length} saved recipes inserted.\n`);

    console.log('==============================================');
    console.log('Seed complete. Demo credentials:');
    console.log('  Email:    admin@recipehub.dev');
    console.log('  Password: password123');
    console.log('  (all demo users share the same password)');
    console.log('==============================================\n');

  } catch (err) {
    console.error('Seed failed:', err.message);
  } finally {
    await db.end();
  }
}

seed();
