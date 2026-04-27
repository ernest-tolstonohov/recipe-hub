// =============================================================
// RecipeHub — Seed File
// Sprint 3
//
// HOW TO RUN:
//   Option A (recommended with current docker-compose networking):
//     1. docker compose up -d
//     2. docker compose exec web node app/scripts/seed.js
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

async function hash(password) {
  return bcrypt.hash(password, 10);
}

async function seed() {
  const db = await getConnection();
  console.log('Connected to MySQL.\n');

  try {
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

    console.log('Seeding tags...');
    const tags = [
      { name: 'Vegan',        type: 'dietary'   },
      { name: 'Vegetarian',   type: 'dietary'   },
      { name: 'Gluten-Free',  type: 'dietary'   },
      { name: 'Dairy-Free',   type: 'dietary'   },
      { name: 'Nut-Free',     type: 'dietary'   },
      { name: 'High-Protein', type: 'dietary'   },
      { name: 'Breakfast',    type: 'meal_type' },
      { name: 'Lunch',        type: 'meal_type' },
      { name: 'Dinner',       type: 'meal_type' },
      { name: 'Dessert',      type: 'meal_type' },
      { name: 'Snack',        type: 'meal_type' },
      { name: 'Quick',        type: 'meal_type' },
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

    console.log('Seeding recipes...');
    const recipes = [
      {
        user_id:     2,
        title:       'Classic Spaghetti Carbonara',
        description: 'Rich and creamy Italian pasta. No cream needed — the silky sauce comes from eggs alone.',
        image_url:   'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800',
        instructions: [
          'Bring a large pot of salted water to a boil. Cook spaghetti until al dente. Reserve 1 cup of pasta water before draining.',
          'Fry pancetta in a large pan over medium heat until crispy. Add minced garlic and cook for 1 minute. Remove from heat.',
          'Whisk together eggs and grated Pecorino Romano in a bowl. Season generously with black pepper.',
          'Add hot pasta to the pancetta pan off the heat. Pour egg mixture over, tossing quickly. Add pasta water gradually to create a silky sauce. Serve immediately.',
        ],
        prep_time: 10, cook_time: 20, servings: 4, difficulty: 'medium',
      },
      {
        user_id:     3,
        title:       'Simple Fried Rice Bowl',
        description: 'Budget-friendly fried rice using leftover rice and whatever veg you have. Ready in 15 minutes.',
        image_url:   'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800',
        instructions: [
          'Heat sesame oil in a wok or large frying pan over high heat.',
          'Add spring onion and garlic, stir-fry for 30 seconds.',
          'Push to the side, crack in eggs and scramble until just set, then mix through the rice.',
          'Add soy sauce and toss everything together for 2 minutes. Serve hot.',
        ],
        prep_time: 5, cook_time: 15, servings: 2, difficulty: 'easy',
      },
      {
        user_id:     5,
        title:       'Lemon Herb Baked Salmon',
        description: 'Light and healthy baked salmon with a lemon and garlic topping.',
        image_url:   'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800',
        instructions: [
          'Preheat oven to 200°C (180°C fan). Line a baking tray with foil.',
          'Place salmon fillets on the tray. Season with salt and pepper.',
          'Squeeze lemon juice over the fillets. Top each with butter and minced garlic.',
          'Bake for 15–18 minutes until the fish flakes easily. Serve with steamed vegetables.',
        ],
        prep_time: 5, cook_time: 18, servings: 2, difficulty: 'easy',
      },
      {
        user_id:     4,
        title:       'Vegan Banana Oat Pancakes',
        description: 'Fluffy, naturally sweet pancakes with no eggs and no dairy.',
        image_url:   'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800',
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
        user_id:     6,
        title:       'Cheesy Jacket Potato',
        description: 'The ultimate student comfort food. Crispy skin, fluffy inside, loaded with cheddar.',
        image_url:   'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800',
        instructions: [
          'Preheat oven to 220°C. Scrub potatoes and prick all over with a fork.',
          'Rub with olive oil and salt. Place directly on the oven rack.',
          'Bake for 60 minutes until the skin is crispy and inside is soft.',
          'Cut open, add butter and a generous handful of grated cheddar. Serve immediately.',
        ],
        prep_time: 5, cook_time: 60, servings: 1, difficulty: 'easy',
      },
      {
        user_id:     3,
        title:       'Spicy Bean Chilli',
        description: 'Hearty protein-packed chilli using storecupboard staples. Feeds 4 for under £3.',
        image_url:   'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800',
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
        user_id:     2,
        title:       'Garlic Butter Chicken',
        description: 'Juicy pan-fried chicken breasts with a garlicky butter sauce. Ready in 25 minutes.',
        image_url:   'https://images.unsplash.com/photo-1598103442097-8b74394b95c4?w=800',
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
        `INSERT IGNORE INTO recipes
           (user_id, title, description, instructions, image_url, prep_time, cook_time, servings, difficulty)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          r.user_id, r.title, r.description,
          JSON.stringify(r.instructions),
          r.image_url || null,
          r.prep_time, r.cook_time, r.servings, r.difficulty,
        ]
      );
    }

    // Also update existing recipes with images
    console.log('Updating image URLs for existing recipes...');
    for (const r of recipes) {
      await db.execute(
        `UPDATE recipes SET image_url = ? WHERE title = ? AND (image_url IS NULL OR image_url = '')`,
        [r.image_url, r.title]
      );
    }
    console.log(`  ${recipes.length} recipes inserted/updated.\n`);

    console.log('Seeding recipe ingredients...');
    const recipeIngredients = [
      { recipe_id: 1, ingredient_id: 1,  quantity: 200, unit: 'g'      },
      { recipe_id: 1, ingredient_id: 2,  quantity: 3,   unit: ''       },
      { recipe_id: 1, ingredient_id: 3,  quantity: 100, unit: 'g'      },
      { recipe_id: 1, ingredient_id: 4,  quantity: 50,  unit: 'g'      },
      { recipe_id: 1, ingredient_id: 5,  quantity: 1,   unit: 'tsp'    },
      { recipe_id: 1, ingredient_id: 6,  quantity: 2,   unit: 'cloves' },
      { recipe_id: 2, ingredient_id: 8,  quantity: 200, unit: 'g'      },
      { recipe_id: 2, ingredient_id: 2,  quantity: 2,   unit: ''       },
      { recipe_id: 2, ingredient_id: 9,  quantity: 2,   unit: 'tbsp'   },
      { recipe_id: 2, ingredient_id: 10, quantity: 3,   unit: ''       },
      { recipe_id: 2, ingredient_id: 11, quantity: 1,   unit: 'tsp'    },
      { recipe_id: 2, ingredient_id: 6,  quantity: 2,   unit: 'cloves' },
      { recipe_id: 3, ingredient_id: 12, quantity: 2,   unit: ''       },
      { recipe_id: 3, ingredient_id: 13, quantity: 1,   unit: ''       },
      { recipe_id: 3, ingredient_id: 14, quantity: 20,  unit: 'g'      },
      { recipe_id: 3, ingredient_id: 6,  quantity: 2,   unit: 'cloves' },
      { recipe_id: 3, ingredient_id: 19, quantity: 0.5, unit: 'tsp'    },
      { recipe_id: 4, ingredient_id: 17, quantity: 2,   unit: ''       },
      { recipe_id: 4, ingredient_id: 15, quantity: 150, unit: 'g'      },
      { recipe_id: 4, ingredient_id: 16, quantity: 200, unit: 'ml'     },
      { recipe_id: 4, ingredient_id: 18, quantity: 1,   unit: 'tsp'    },
      { recipe_id: 4, ingredient_id: 19, quantity: 0.5, unit: 'tsp'    },
      { recipe_id: 5, ingredient_id: 29, quantity: 2,   unit: ''       },
      { recipe_id: 5, ingredient_id: 22, quantity: 80,  unit: 'g'      },
      { recipe_id: 5, ingredient_id: 14, quantity: 20,  unit: 'g'      },
      { recipe_id: 5, ingredient_id: 7,  quantity: 1,   unit: 'tbsp'   },
      { recipe_id: 5, ingredient_id: 19, quantity: 0.5, unit: 'tsp'    },
      { recipe_id: 6, ingredient_id: 24, quantity: 400, unit: 'g'      },
      { recipe_id: 6, ingredient_id: 21, quantity: 400, unit: 'g'      },
      { recipe_id: 6, ingredient_id: 20, quantity: 1,   unit: ''       },
      { recipe_id: 6, ingredient_id: 6,  quantity: 3,   unit: 'cloves' },
      { recipe_id: 6, ingredient_id: 25, quantity: 1,   unit: 'tsp'    },
      { recipe_id: 6, ingredient_id: 26, quantity: 0.5, unit: 'tsp'    },
      { recipe_id: 6, ingredient_id: 27, quantity: 1,   unit: 'tsp'    },
      { recipe_id: 6, ingredient_id: 28, quantity: 200, unit: 'ml'     },
      { recipe_id: 7, ingredient_id: 12, quantity: 2,   unit: ''       },
      { recipe_id: 7, ingredient_id: 6,  quantity: 4,   unit: 'cloves' },
      { recipe_id: 7, ingredient_id: 14, quantity: 30,  unit: 'g'      },
      { recipe_id: 7, ingredient_id: 7,  quantity: 1,   unit: 'tbsp'   },
      { recipe_id: 7, ingredient_id: 13, quantity: 0.5, unit: ''       },
      { recipe_id: 7, ingredient_id: 27, quantity: 1,   unit: 'tsp'    },
    ];

    for (const ri of recipeIngredients) {
      await db.execute(
        `INSERT IGNORE INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
         VALUES (?, ?, ?, ?)`,
        [ri.recipe_id, ri.ingredient_id, ri.quantity, ri.unit]
      );
    }
    console.log(`  ${recipeIngredients.length} recipe ingredients inserted.\n`);

    console.log('Seeding recipe tags...');
    const recipeTags = [
      { recipe_id: 1, tag_id: 9  },
      { recipe_id: 1, tag_id: 13 },
      { recipe_id: 2, tag_id: 8  },
      { recipe_id: 2, tag_id: 14 },
      { recipe_id: 2, tag_id: 12 },
      { recipe_id: 3, tag_id: 9  },
      { recipe_id: 3, tag_id: 6  },
      { recipe_id: 4, tag_id: 1  },
      { recipe_id: 4, tag_id: 4  },
      { recipe_id: 4, tag_id: 7  },
      { recipe_id: 5, tag_id: 2  },
      { recipe_id: 5, tag_id: 9  },
      { recipe_id: 5, tag_id: 16 },
      { recipe_id: 6, tag_id: 1  },
      { recipe_id: 6, tag_id: 9  },
      { recipe_id: 6, tag_id: 18 },
      { recipe_id: 7, tag_id: 9  },
      { recipe_id: 7, tag_id: 6  },
    ];

    for (const rt of recipeTags) {
      await db.execute(
        `INSERT IGNORE INTO recipe_tags (recipe_id, tag_id) VALUES (?, ?)`,
        [rt.recipe_id, rt.tag_id]
      );
    }
    console.log(`  ${recipeTags.length} recipe tags inserted.\n`);

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
        `INSERT IGNORE INTO reviews (recipe_id, user_id, rating, body) VALUES (?, ?, ?, ?)`,
        [r.recipe_id, r.user_id, r.rating, r.body]
      );
    }
    console.log(`  ${reviews.length} reviews inserted.\n`);

    console.log('Updating avg_rating and review_count for all recipes...');
    await db.execute(`
      UPDATE recipes r
      SET
        avg_rating   = (SELECT ROUND(AVG(rating), 2) FROM reviews WHERE recipe_id = r.recipe_id),
        review_count = (SELECT COUNT(*)              FROM reviews WHERE recipe_id = r.recipe_id)
    `);
    console.log('  Done.\n');

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