-- RecipeHub Database Migration
-- Tables: users, recipes, saved_recipes

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS saved_recipes;
DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Recipes Table
CREATE TABLE IF NOT EXISTS recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    ingredients TEXT,
    instructions TEXT,
    image_url VARCHAR(512),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Saved Recipes Table (Composite PK)
CREATE TABLE IF NOT EXISTS saved_recipes (
    user_id INT NOT NULL,
    recipe_id INT NOT NULL,
    saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, recipe_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Data
-- Passwords: secret123 (bcrypt 12 rounds)
-- user: $2a$12$R9h/LIPzKuRZyjSpz6uvCOu9f13PP9v.qUyXG8v14Mv9G5G6.U9K.
-- admin: $2a$12$R9h/LIPzKuRZyjSpz6uvCOu9f13PP9v.qUyXG8v14Mv9G5G6.U9K.

INSERT IGNORE INTO users (username, email, password_hash, role) VALUES
('student_cook', 'user@recipehub.com', '$2a$12$R9h/LIPzKuRZyjSpz6uvCOu9f13PP9v.qUyXG8v14Mv9G5G6.U9K.', 'user'),
('head_chef', 'admin@recipehub.com', '$2a$12$R9h/LIPzKuRZyjSpz6uvCOu9f13PP9v.qUyXG8v14Mv9G5G6.U9K.', 'admin');

INSERT IGNORE INTO recipes (user_id, title, description, ingredients, instructions, image_url) VALUES
(1, 'Quick Student Pasta', 'A simple and affordable pasta dish for busy nights.', 'Pasta, Garlic, Olive Oil, Chili Flakes, Parmesan', '1. Boil pasta.\n2. Sauté garlic and chili in oil.\n3. Toss pasta with oil and cheese.', 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=800'),
(2, 'Gourmet Mushroom Risotto', 'Rich and creamy risotto with fresh herbs.', 'Arborio Rice, Mushrooms, Vegetable Stock, Onion, White Wine, Butter, Thyme', '1. Sauté onions and mushrooms.\n2. Add rice and toast.\n3. Gradually add stock until creamy.', 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&q=80&w=800');
