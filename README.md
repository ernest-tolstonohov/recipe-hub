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
- Database: MySQL (normalized, relational) with MySQL2 package for Node.js compatibility.
- DevOps: Docker, Git, GitHub Actions.
- Development: Node.js runs with supervisor for automatic rebuild on file changes.
- Security: Environment variables managed via .env file (dotenv package).

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

## System Requirements

If running on your own computer (not Azure labs):

- [Node.js](https://nodejs.org/en/download/) (for Windows)
- [Docker Desktop](https://docs.docker.com/desktop/windows/install/) (for Windows, includes Linux Subsystem for Windows)

## Setup Instructions

### 1. Environment Configuration

For security, this project uses a `.env` file for credentials. A sample is provided in the `env-sample` file.

**Important:** Copy `env-sample` to `.env` before first run. Do NOT commit the `.env` file to your repository (it's already in .gitignore).

### 2. Install Dependencies

```bash
npm install
```

### 3. Start MySQL Database (Docker)

Make sure no other containers are running (`docker ps`), then:

```bash
docker compose up -d --build
```

### Database persistence & seeding (important)

This project persists MySQL data between container restarts.

- `docker compose up` does NOT delete the database.
- In [docker-compose.yml](docker-compose.yml) we use a bind mount: `./db:/var/lib/mysql`, so the data is stored on disk in the project’s `db/` folder.

The database will only be removed if you:

- delete the `db/` folder manually, or
- run SQL containing `DROP TABLE ...` (there is a drop section in [sd2-db.sql](sd2-db.sql)), or
- intentionally wipe Docker storage/volumes.

How new (demo) data appears:

1. First create the tables (for example by importing [sd2-db.sql](sd2-db.sql) via phpMyAdmin).
2. Then run the seed script (demo data):

```bash
docker compose exec web node scripts/seed.js
```

Important: `scripts/seed.js` is not run automatically during `docker compose up` — it only runs when you execute it.

This will set up:

- MySQL database server
- PHPMyAdmin (web-based database management)
- Node.js application with auto-restart on file changes

### 4. Start the Server

```bash
npm start
```

### 5. Access the Application

- **Express App:** http://localhost:3000
- **PHPMyAdmin:** http://localhost:8081/

### Database Credentials

- Host: localhost
- Port: 3308 (from your host machine; published as `3308:3306`)
- Database: recipehub
- Username: recipehub_user
- Password: recipehub_pass

Note: inside the Docker network (container-to-container), the DB host is `db` on port `3306`.

## Database Service

The project includes a `db.js` service file (`app/services/db.js`) that handles all database connections using credentials from the `.env` file. It provides a `query()` function for sending queries to the database.

To use the database service in your code:

```javascript
const db = require("./services/db");
```

## What's Included

- **Docker Setup:** Preconfigured MySQL, PHPMyAdmin, and Node.js environment where all components can communicate.
- **Database Service:** Ready-to-use database connection module with query functionality.
- **Environment Configuration:** Secure credential management via `.env` file.
- **Auto-Restart:** File changes automatically trigger app rebuild during development.
- **Volume Mounting:** Local files are mounted into containers for seamless development.

## Useful Commands

### Access Container Shell

```bash
docker exec -it <container name> bash -l
```

### MySQL CLI Access

Once inside the database container:

```bash
mysql -uroot -p<password>
```

### View Running Containers

```bash
docker ps
```

## Author

- Ernest Tolstonohov Z23608695
- Matenin Dosso A00017688
- Hajar Natiq A00024033
- Baburam Bastola A00022220
