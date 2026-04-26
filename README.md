# Recipe Hub

RecipeHub is a professional, student-focused, database-driven web application for sharing and discovering recipes. It supports the 2026 module theme of “Sharing, exchange and building community” by enabling knowledge exchange, collaboration, and community support around student cooking.

## Problem Statement

University students often face limited cooking skills, high food waste, tight budgets, and social isolation. Existing recipe sites often lack structured collaboration, student-focused features, and efficient ingredient-based search tools that help reduce waste.

## Core Objectives

- **Knowledge Sharing**: Encourage the exchange of budget-friendly and easy-to-cook recipes among students.
- **Waste Reduction**: Implementation of advanced ingredient-based search to help students cook with what they currently have.
- **Recipe Ownership**: Protection of recipe integrity through approval-based collaborative edits and clear attribution.
- **Community Building**: Promoting social interaction via ratings, comments, and collaborative content creation.

## Key Features

- **Advanced Search & Autocomplete**:
  - Real-time **debounced (300ms)** autocomplete for the global search bar.
  - Specialized **Ingredient Tag Builder** with removable light-green rounded pills.
- **User Management**: Secure registration, login profiles, and role-based access control (User/Admin).
- **Recipe Ecosystem**: Full CRUD operations with dynamic category management and multi-step instructions.
- **Community interaction**: Integrated rating system with average score analytics and review sections.
- **Collaborative Editing**: Structured workflow for recipe improvements with full attribution history.

## Technical Architecture

| Layer | Technology |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript, Pug Templating |
| **Backend** | Node.js (Latest), Express.js framework |
| **Database** | MySQL 8.0 (Normalized, Relational) |
| **Security** | BCrypt, csurf, helmet, rate-limit |
| **Infrastructure** | Docker, Docker Compose |

## Project Organization

```text
recipe-hub/
├── app/                    # Inner Controller Stack (Core API)
│   ├── controllers/        # Logical handlers for app stack
│   ├── models/             # Shared database models
│   ├── routes/             # Authentication and internal routes
│   └── services/           # DB connection and utility providers
├── controllers/            # Primary Controller Stack
├── routes/                 # Primary Route Stack
├── middleware/             # Hardened security & logging layers
├── static/                 # Front-end assets (CSS, JS, Images)
├── views/                  # Pug Template source files
├── secure_uploads/        # Non-public directory for user images
├── logs/                   # System audit and admin activity logs
├── .env.example            # Environment variable template
└── CHANGELOG.md           # Implementation history (April 2026)
```

## Security Posture

The application has undergone a comprehensive security hardening audit:
- **Identity Security**: All passwords are hashed using **BCrypt (12 salt rounds)**.
- **Session Protection**: 2-hour inactivity timeouts with HttpOnly, Strict, and Secure cookie flags.
- **Anti-Brute Force**: Express-rate-limit active on all login points (max 5 attempts per 15 min).
- **Integrity Management**: Native CSRF token protection on all state-changing forms.
- **Content Policy**: Strict CSP, X-Frame-Options: DENY, and Referrer policies via Helmet.
- **Input Sanitization**: Server-side validation for all forms (Titles, Descriptions, Ratings).
- **Obfuscation**: Administrative panels moved to non-obvious paths (e.g., `/management-console`).

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/ernest-tolstonohov/recipe-hub.git
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Open `.env` and fill in your unique `SESSION_SECRET`.

4. **Launch with Docker**
   ```bash
   docker compose up --build -d
   ```

## Maintenance & Deployment

### Push changes to GitHub
```bash
git add .
git commit -m "Your descriptive commit message"
git push origin feature-autocomplete
```

### Pull latest changes
```bash
git pull origin feature-autocomplete
```

## Contributors

- **Ernest Tolstonohov**
- **Matenin Dosso**
- **Hajar Natiq**
- **Baburam Bastola**

---
*Developed for the SD2 2026 Core Module.*
