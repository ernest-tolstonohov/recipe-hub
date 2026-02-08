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

- User management: registration, login, profiles, and dashboards.
- Recipe management: full CRUD with categories, ingredients, and instructions.
- Ingredient-based search with dietary filters.
- Reviews and ratings with average score display.
- Collaborative editing system with approval workflow and attribution history.

## Technical Architecture

- Frontend: HTML, CSS, JavaScript, Pug.
- Backend: Node.js, Express.js, RESTful routes.
- Database: MySQL (normalized, relational).
- DevOps: Docker, Git, GitHub Actions.

## Project Structure

```
recipe-hub/
├── backend/
│   ├── server.js
│   └── public/
│       ├── index.html
│       ├── css/
│       └── images/
├── docker/
│   └── mysql/
│       └── Dockerfile
├── docker-compose.yml
└── package.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Start MySQL Database (Docker)

```bash
docker compose up -d --build
```

### 3. Start the Server

```bash
npm start
```

Visit http://localhost:3000 to see the application.

### Database Credentials

- Host: localhost
- Port: 3306
- Database: recipehub
- Username: recipehub_user
- Password: recipehub_pass

## Author

- Ernest Tolstonohov Z23608695
- Matenin Dosso A00017688
- Hajar Natiq A00024033
- Baburam Bastola A00022220
