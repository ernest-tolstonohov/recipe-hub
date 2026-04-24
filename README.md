# Recipe HUB

## Project Overview

RecipeHub is a student-focused, database-driven web app for sharing and discovering recipes. It supports the 2026 module theme of “Sharing, exchange and building community” by enabling knowledge exchange, collaboration, and community support around cooking.

## Problem Statement

University students often face limited cooking skills, food waste, tight budgets, and social isolation. Existing recipe sites lack structured collaboration, student-focused features, and ingredient-based search that helps reduce waste.

## Core Objectives

- Encourage knowledge sharing among students.
- Reduce food waste with ingredient-based search.
- Protect recipe ownership through approval-based edits.
- Promote community building via ratings, comments, and collaboration.

## Key Features

- **User Management**: Registration, login, profiles, and dashboards.
- **Recipe Management**: Full CRUD with categories, ingredients, and instructions.
- **Ingredient-based search**: Advanced filtering with dietary tags.
- **Reviews and ratings**: Community feedback with average score display.
- **Collaborative Editing**: Approval workflow with attribution history.
- **Search Autocomplete**: Real-time suggestions for recipes and ingredients.
- **Secure File Uploads**: Sanitized and renamed image uploads stored outside public root.

## Technical Architecture

- **Frontend**: HTML, CSS, Vanilla JavaScript, Pug.
- **Backend**: Node.js (Latest), Express.js.
- **Database**: MySQL 8.0 (Relational) with indexing for search performance.
- **Security**: 
    - CSRF Protection (csurf module).
    - Security Headers (helmet module).
    - Rate Limiting (express-rate-limit).
    - Password Hashing (bcryptjs).
    - Session Inactivity Timeouts (2 hours HttpOnly/Secure cookies).
- **DevOps**: Docker, Docker Compose, Git.

## Setup Instructions

### 1. Environment Configuration

Copy `env-sample` to `.env` and fill in your credentials.

### 2. Start Application (Docker)

```bash
docker compose up --build -d
```

### 3. Setup Database (First Run Only)

Import `sd2-db.sql` via PHPMyAdmin (http://localhost:8081).
Then seed the demo data:
```bash
docker compose exec web node scripts/seed.js
```

## Security Implementation Notes

- **Password Hashing**: Uses bcryptjs with a salt factor of 12 for high entropy protection.
- **Rate Limit**: Login routes are restricted to 5 attempts per 15 minutes to prevent brute forcing.
- **CORS & CSP**: Controlled Content Security Policy prevents XSS and unauthorized frame embedding.
- **Database Security**: All queries are parameterized to prevent SQL Injection.

## Advanced Search & Autocomplete

- **Debounced Fetch**: Frontend search inputs are debounced at 300ms to optimize server load.
- **Tag Builder**: Ingredient inputs in the recipe form use a dynamic tag-pills system for better UX.

## Authors

- Ernest Tolstonohov Z23608695
- Matenin Dosso A00017688
- Hajar Natiq A00024033
- Baburam Bastola A00022220
