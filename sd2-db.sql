-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Oct 30, 2022 at 09:54 AM
-- Server version: 8.0.24
-- PHP Version: 7.4.20

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */
;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */
;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */
;
/*!40101 SET NAMES utf8mb4 */
;

--
-- Database: `sd2-db`
--

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */
;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */
;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */
;

-- =============================================================
-- RecipeHub — Database Schema
-- Sprint 3
-- Engine: MySQL 8 | Charset: utf8mb4
--
-- NOTE:  sessions table excluded intentionally.
--        express-mysql-session creates its own table at runtime.
--        A custom sessions table causes a schema conflict.
-- =============================================================
-- To reset the database, run this block to drop all tables in the correct order.
-- SET FOREIGN_KEY_CHECKS = 0;

-- DROP TABLE IF EXISTS password_reset_tokens;

-- DROP TABLE IF EXISTS saved_recipes;

-- DROP TABLE IF EXISTS reviews;

-- DROP TABLE IF EXISTS recipe_tags;

-- DROP TABLE IF EXISTS recipe_ingredients;

-- DROP TABLE IF EXISTS tags;

-- DROP TABLE IF EXISTS ingredients;

-- DROP TABLE IF EXISTS recipes;

-- DROP TABLE IF EXISTS users;

-- SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================
-- USERS
-- Central table — every other table references this one.
--
-- role:      'user' (default) or 'admin'.
--            Checked in middleware to protect admin routes.
--
-- is_active: soft-delete flag. Deactivated users cannot log in
--            but their recipes and reviews stay in the DB.
--            Always deactivate, never hard-delete users.
--
-- password_hash: bcrypt hash. VARCHAR(255) is enough —
--               bcrypt always produces a 60-character string.
-- =============================================================
CREATE TABLE users (
    user_id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255) DEFAULT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- =============================================================
-- RECIPES
--
-- user_id: the owner. One recipe belongs to one user.
--          Direct FK — no junction needed (one-to-many).
--
-- instructions (FIX 1):
--   JSON array of strings. Each string is one numbered step.
--   Example value stored in DB:
--     ["Boil a large pot of salted water.",
--      "Cook spaghetti al dente, reserve 1 cup pasta water.",
--      "Mix eggs and Pecorino in a bowl.",
--      "Combine everything off the heat and serve."]
--
--   In your model (Recipe.js):
--     INSERT: instructions = JSON.stringify(stepsArray)
--     SELECT: recipe.instructions = JSON.parse(recipe.instructions)
--
--   In your Pug template (detail.pug):
--     each step, i in instructions
--       p #{i + 1}. #{step}
--
-- avg_rating (FIX 2):
--   Cached average. Default 0.00 = no reviews yet.
--   reviewController updates this after every INSERT into reviews:
--     UPDATE recipes
--     SET avg_rating   = (SELECT AVG(rating) FROM reviews WHERE recipe_id = ?),
--         review_count = (SELECT COUNT(*)     FROM reviews WHERE recipe_id = ?)
--     WHERE recipe_id = ?;
--   Listing page then just reads avg_rating directly — no JOIN.
--
-- review_count (FIX 2):
--   Cached count for the same reason. Avoids COUNT(*) + GROUP BY
--   on every listing page load.
-- =============================================================
CREATE TABLE recipes (
    recipe_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT DEFAULT NULL,
    instructions JSON NOT NULL,
    prep_time INT NOT NULL COMMENT 'minutes',
    cook_time INT NOT NULL COMMENT 'minutes',
    servings INT NOT NULL DEFAULT 4,
    difficulty ENUM('easy', 'medium', 'hard') NOT NULL DEFAULT 'easy',
    image_url VARCHAR(255) DEFAULT NULL,
    avg_rating DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
    review_count INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (recipe_id),
    CONSTRAINT fk_recipe_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- =============================================================
-- INGREDIENTS
-- Global shared list of ingredient names.
-- Normalised so "chicken" exists once, not once per recipe.
-- This is what makes ingredient-based search efficient via JOIN.
--
-- created_by: SET NULL on delete so ingredients survive if
--             the user who added them is removed.
-- =============================================================
CREATE TABLE ingredients (
    ingredient_id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_by INT DEFAULT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (ingredient_id),
    CONSTRAINT fk_ingredient_creator FOREIGN KEY (created_by) REFERENCES users (user_id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- =============================================================
-- RECIPE_INGREDIENTS  (junction — many-to-many)
-- One recipe has many ingredients.
-- One ingredient appears in many recipes.
-- quantity and unit live here because "200g spaghetti" belongs
-- to this specific recipe, not to the ingredient globally.
--
-- Example rows for Spaghetti Carbonara (recipe_id = 1):
--   (1, 1, 200, 'g')    -- spaghetti
--   (1, 2, 3,   '')     -- eggs (no unit — countable)
--   (1, 3, 100, 'g')    -- pancetta
-- =============================================================
CREATE TABLE recipe_ingredients (
    recipe_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    quantity DECIMAL(8, 2) NOT NULL,
    unit VARCHAR(30) NOT NULL DEFAULT '',
    PRIMARY KEY (recipe_id, ingredient_id),
    CONSTRAINT fk_ri_recipe FOREIGN KEY (recipe_id) REFERENCES recipes (recipe_id) ON DELETE CASCADE,
    CONSTRAINT fk_ri_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredients (ingredient_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- =============================================================
-- TAGS
-- Used for filtering: by cuisine, dietary need, or meal type.
-- type controls which filter dropdown a tag appears in on the UI.
--
-- Examples:
--   name='Vegan',     type='dietary'
--   name='Breakfast', type='meal_type'
--   name='Italian',   type='cuisine'
-- =============================================================
CREATE TABLE tags (
    tag_id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    type ENUM(
        'dietary',
        'meal_type',
        'cuisine'
    ) NOT NULL,
    created_by INT DEFAULT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (tag_id),
    CONSTRAINT fk_tag_creator FOREIGN KEY (created_by) REFERENCES users (user_id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- =============================================================
-- RECIPE_TAGS  (junction — many-to-many)
-- One recipe can have many tags (Vegan + Dinner + Italian).
-- One tag applies to many recipes.
-- No extra columns needed here — just the two foreign keys.
-- =============================================================
CREATE TABLE recipe_tags (
    recipe_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (recipe_id, tag_id),
    CONSTRAINT fk_rt_recipe FOREIGN KEY (recipe_id) REFERENCES recipes (recipe_id) ON DELETE CASCADE,
    CONSTRAINT fk_rt_tag FOREIGN KEY (tag_id) REFERENCES tags (tag_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- =============================================================
-- REVIEWS
-- One user can review one recipe exactly once.
-- UNIQUE KEY on (recipe_id, user_id) enforces this at DB level —
-- no duplicate check needed in the controller.
--
-- body is optional (star rating without a written comment is fine).
-- rating is enforced between 1 and 5 by a CHECK constraint.
--
-- After every INSERT here, reviewController must update
-- avg_rating and review_count in the recipes table (FIX 2).
-- =============================================================
CREATE TABLE reviews (
    review_id INT NOT NULL AUTO_INCREMENT,
    recipe_id INT NOT NULL,
    user_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    body TEXT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (review_id),
    UNIQUE KEY uq_one_review_per_user (recipe_id, user_id),
    CONSTRAINT fk_review_recipe FOREIGN KEY (recipe_id) REFERENCES recipes (recipe_id) ON DELETE CASCADE,
    CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- =============================================================
-- SAVED_RECIPES  (junction — many-to-many)
-- Users bookmark recipes. One user saves many recipes.
-- One recipe is saved by many users.
-- saved_at allows sorting by "recently saved" on the dashboard.
-- =============================================================
CREATE TABLE saved_recipes (
    user_id INT NOT NULL,
    recipe_id INT NOT NULL,
    saved_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, recipe_id),
    CONSTRAINT fk_sr_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_sr_recipe FOREIGN KEY (recipe_id) REFERENCES recipes (recipe_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- =============================================================
-- PASSWORD_RESET_TOKENS
-- Stores one-time tokens for the forgot password flow.
-- authController checks: token exists + expires_at > NOW()
-- + used = FALSE. After reset, used is set to TRUE so the
-- token cannot be reused.
-- =============================================================
CREATE TABLE password_reset_tokens (
    token_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (token_id),
    CONSTRAINT fk_prt_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- =============================================================
-- INDEXES
-- MySQL does NOT auto-create indexes on foreign key columns.
-- Without these, every JOIN does a full table scan.
-- These cover every FK and the most common WHERE/ORDER BY fields.
-- =============================================================
CREATE INDEX idx_recipes_user ON recipes (user_id);

CREATE INDEX idx_recipes_difficulty ON recipes (difficulty);

CREATE INDEX idx_ri_recipe ON recipe_ingredients (recipe_id);

CREATE INDEX idx_ri_ingredient ON recipe_ingredients (ingredient_id);

CREATE INDEX idx_rt_recipe ON recipe_tags (recipe_id);

CREATE INDEX idx_rt_tag ON recipe_tags (tag_id);

CREATE INDEX idx_reviews_recipe ON reviews (recipe_id);

CREATE INDEX idx_reviews_user ON reviews (user_id);

CREATE INDEX idx_saved_user ON saved_recipes (user_id);

CREATE INDEX idx_ingredients_name ON ingredients (name);

CREATE INDEX idx_tags_type          ON tags(type);