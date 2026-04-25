# Recipe HUB

## Project Overview

RecipeHub is a student-focused, database-driven web app for sharing and discovering recipes. It supports the 2026 module theme of “Sharing, exchange and building community” by enabling knowledge exchange, collaboration, and community support around cooking.

## Problem Statement

University students often face limited cooking skills, food waste, tight budgets, and social isolation. Existing recipe sites lack structured collaboration, student-focused features, and ingredient-based search that helps reduce waste.

## Core Objectives

- **Knowledge Exchange**: Encourage students to share budget-friendly and easy-to-cook recipes.
- **Waste Reduction**: Implement ingredient-based search to help students cook with what they have.
- **Ownership & Attribution**: Maintain a robust history of recipe edits and attribution.
- **Community Support**: Integrated rating and review system for recipe validation.

## Key Features

- **User Management**: Secure registration and login with session persistence and role-based access.
- **Recipe Management**: Comprehensive CRUD operations, including ingredient tag building and multi-step instructions.
- **Advanced Search**: 
    - Real-time autocomplete suggestions for recipe titles.
    - Dynamic ingredient filtering with "Tag Builder" UI.
- **Social Integration**: Review system, rating analytics, and community-driven category management.
- **Security Hardened**:
    - **CSRF Protection**: Prevents cross-site request forgery on all POST operations.
    - **CSP Enforcement**: Strict Content Security Policy protects against XSS.
    - **Password Security**: Bcryptjs hashing (12 rounds) and rate-limited login routes.
    - **Secure Uploads**: Multer-based image handling with UUID renaming and off-root storage.

## Technical Stack

- **Frontend**: HTML5, Vanilla JavaScript, CSS3 (Custom Modules), Pug Templating.
- **Backend**: Node.js (Latest), Express.js framework.
- **Database**: MySQL 8.0 with relational normalization and performance indexing.
- **Infrastructure**: Docker & Docker Compose for consistent environment orchestration.

## Project Structure

```text
recipe-hub/
├── app/                    # Backend Logic
│   ├── controllers/        # Route handlers
│   ├── models/             # Database models (Recipe, Ingredient, User)
│   ├── routes/             # Express route definitions
│   └── services/           # Database connection and utilities
├── views/                  # Pug Template files
├── static/                 # Client-side assets
│   ├── css/                # Global and component stylesheets
│   └── js/                 # Autocomplete and form logic
├── middleware/             # CSRF, Auth, and Security middleware
├── secure_uploads/        # Non-public directory for user images
├── Dockerfile              # Container configuration
└── docker-compose.yml      # Multi-container orchestration
```

## Setup Instructions

### 1. Environment Configuration

Copy `env-sample` to `.env` and configure your database and session secret keys.

### 2. Deployment via Docker

```bash
# Rebuild and start containers in detached mode
docker compose up --build -d
```

### 3. Database Initialization

1. Access **PHPMyAdmin** at `http://localhost:8081`.
2. Import the `sd2-db.sql` schema.
3. (Optional) Seed demo data via the command line:
   ```bash
   docker compose exec web node scripts/seed.js
   ```

## Development Commands

- **Start App**: `npm start` (Runs via `supervisor` for hot-reloading).
- **Stop Containers**: `docker compose down`.
- **View Logs**: `docker compose logs -f web`.

## License

This project is developed as part of the SD2 2026 Core Module. All rights reserved.

## Authors

- **Ernest Tolstonohov** - Z23608695
- **Matenin Dosso** - A00017688
- **Hajar Natiq** - A00024033
- **Baburam Bastola** - A00022220
