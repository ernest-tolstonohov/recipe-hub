# Recipe Hub — Ultimate Edition

RecipeHub is a professional, student-centric, database-driven web ecosystem designed for sharing, discovering, and collaboratively managing culinary knowledge. Built in 2026, it addresses the core theme of “Building Community through Exchange” by providing students with the tools to reduce food waste, share budget-friendly recipes, and validate quality through a social feedback loop.

---

## 🎯 Project Vision

### Problem Statement
University students frequently struggle with:
- **Skill Gaps**: Limited experience in meal preparation.
- **Economic Pressure**: Tight budgets leading to suboptimal nutrition.
- **Environmental Impact**: Significant food waste due to poor pantry management.
- **Social Isolation**: A lack of community-driven knowledge exchange.

### Core Objectives
- **Knowledge Exchange**: Centralize budget-friendly and student-tested recipes.
- **Waste Reduction**: Implement **Ingredient-Based Search** and real-time autocomplete to encourage cooking with existing supplies.
- **Data Integrity**: Protect recipe ownership through structured collaborative edits and clear attribution.
- **Social Validation**: Harness community feedback through ratings, reviews, and a recipe saving (bookmark) system.

---

## 🚀 Key Features

### 🔍 Advanced Discovery
- **Global Search Autocomplete**: High-performance, debounced (300ms) suggestions for recipe titles.
- **Ingredient Tag Builder**: A dynamic UI allowing users to build ingredient lists using suggestions and removable "pill" tags.
- **Advanced Filtering**: Categorization by dietary types, difficulty levels, and preparation time.

### 🍱 Recipe Management
- **Full CRUD Support**: Create, Read, Update, and Delete recipes with multi-step instructions and image uploads.
- **Collaborative Editing**: A secure workflow allowing community members to suggest improvements with admin-backed approval.
- **Bookmark System**: Personalized "Saved Recipes" portal for quick access to favorite meals.

### 💬 Social & Community
- **Review Engine**: Full comment and rating (1–5 stars) system with server-side length and range validation.
- **User Dashboard**: Personalized profiles tracking contributed and saved recipes.
- **Admin Command Center**: Role-based access to a restricted moderation panel for system oversight.

---

## 🛡️ Security Audit (April 2026 Milestone)

The application has been hardened against modern web vulnerabilities:

- **Identity & Sessions**: 
  - Passwords hashed with **BCrypt (12 salt rounds)**.
  - Automatic **2-hour inactivity session destruction**.
  - Secure, HttpOnly, and SameSite (Strict) cookie management.
- **Inbound Protection**:
  - **Rate Limiting**: Protection against brute force on login routes (5 attempts / 15 mins).
- **Content Security**:
  - **Helmet.js Implementation**: Strict CSP, X-Frame-Options (DENY), and Referrer Policy.
  - **File Security**: UUID-based renaming for uploads and storage outside the web root.
- **Infrastructure Safety**: 
  - Strictly parameterized database queries (MySQL2 pool) to eliminate SQL injection.
  - Obfuscated administrative endpoints (`/management-console`).

---

## 🛠️ Technical Stack

| Category | Technology |
| :--- | :--- |
| **Architectural Pattern** | Parallel Controller Stacks (Standard/Inner) |
| **Logic Layer** | Node.js (Latest LTS), Express.js |
| **Data Layer** | MySQL 8.0 (Normalized Relational Schema) |
| **Presentation** | Pug (Jade) Templates, Vanilla JavaScript, CSS3 |
| **Security** | BCrypt, helmet, express-rate-limit |
| **Orchestration** | Docker, Docker Compose |

---

## 📂 Project Organization

```text
recipe-hub/
├── app/                    # Core Business Logic (Inner Stack)
│   ├── controllers/        # Logical handlers for app stack
│   ├── models/             # Shared database models
│   ├── routes/             # Authentication & internal API routes
│   └── services/           # DB connection & query providers
├── controllers/            # Primary Controller Stack
├── routes/                 # Primary Route Stack
├── middleware/             # Security & Auditing Layer
│   ├── adminLogger.js      # CSV-based action auditing
│   ├── auth.js             # RBAC logic (User/Admin)
│   └── upload.js           # Multer-secure file handler
├── views/                  # Pug Templating source
├── static/                 # Front-end assets (Styles, Scripts, Icons)
├── secure_uploads/        # Restricted directory for user images
├── logs/                   # System and Administrative logs
├── .env.example            # Environment variable template
```

---

## 🏁 Getting Started

### 1. Configure the Environment
The project uses a `.env` file for all sensitive secrets. **Do not commit this file.**
- Save placeholder values into your local `.env`.
- Ensure `SESSION_SECRET` is a long, random string.

### 2. Launching with Docker
```bash
docker compose up --build -d
```

### 3. Administrative Access
- Configure a user with `role = 'admin'` in the database via PHPMyAdmin (http://localhost:8081).
- Access the management panel at `/management-console`.

---

## 🔧 Maintenance Commands

### Committing Changes
```bash
git add .
git commit -m "Update descriptive message"
git push origin feature-autocomplete
```

### Viewing Logs
```bash
docker compose logs -f web
```

---

## 👥 Contributors

- **Ernest Tolstonohov**
- **Matenin Dosso**
- **Hajar Natiq**
- **Baburam Bastola**

*Developed for the SD2 2026 Core Module.*
