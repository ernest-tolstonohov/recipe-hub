CREATE DATABASE IF NOT EXISTS `sd2-db`;
USE `sd2-db`;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    ingredients TEXT NOT NULL,
    instructions TEXT NOT NULL,
    image_url VARCHAR(512),
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS saved_recipes (
    user_id INT NOT NULL,
    recipe_id INT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, recipe_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

INSERT INTO users (username, email, password_hash, role) VALUES 
('jamie_cooks', 'jamie@example.com', 'hash', 'user'),
('student_eats', 'student@example.com', 'hash', 'admin'),
('uni_kitchen', 'uni@example.com', 'hash', 'user')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO recipes (title, ingredients, instructions, image_url, user_id) VALUES 
('Creamy Garlic Chicken Pasta', 'chicken, pasta, garlic, cream, parmesan cheese', '1. Cook pasta\n2. Fry chicken and garlic\n3. Add cream and cheese\n4. Mix with pasta', NULL, 1),
('Simple Fried Rice Bowl', 'rice, egg, soy sauce, peas, carrots, onions', '1. Boil rice\n2. Scramble egg\n3. Fry veggies\n4. Mix everything with soy sauce', NULL, 2),
('Lemon Herb Baked Salmon', 'salmon, lemon, olive oil, herbs, salt', '1. Preheat oven\n2. Squeeze lemon over salmon\n3. Sprinkle herbs and bake', NULL, 3)
ON DUPLICATE KEY UPDATE title=title;
