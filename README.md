# Recipe Hub

A professional, student-focused full-stack web application designed for sharing, discovering, and collaboratively managing cooking recipes. Built with a focus on community building and food waste reduction.

## Folder Structure

```text
recipe-hub/
├── app/                    # Backend Core (Inner Stack)
│   ├── controllers/        # Logic for parallel stack
│   ├── models/             # Shared DB models
│   ├── routes/             # Authentication & API routes
│   └── services/           # DB connection provider
├── controllers/            # Primary Controller Stack
├── routes/                 # Primary Route Stack
├── middleware/             # Security & Logging Middlewares
│   ├── adminLogger.js      # CSV-based activity auditor
│   ├── auth.js             # RBAC authentication
│   └── upload.js           # Multer configuration
├── models/                 # Primary Model definitions
├── views/                  # Pug Template engine source
├── static/                 # Public assets (CSS, JS, Images)
├── secure_uploads/        # Non-public image repository
├── logs/                   # System and Admin audit logs
├── .env.example            # Environment template
└── docker-compose.yml      # Orchestration config
```

## Features

- **Personalized Accounts**: Complete RBAC system with secure login/registration.
- **Recipe Collaboration**: CRUD operations with approval workflows and edit history.
- **Real-time Search**: Debounced autocomplete for recipes and ingredient tagging.
- **Community Interaction**: Rating system and moderation-ready review sections.
- **Advanced UI**: CSS-driven "Tag Builder" for ingredients and responsive layouts.

## Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, Vanilla JS, Pug |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL 8.0 (Normalized) |
| **Security** | BCrypt, csurf, helmet, rate-limit |
| **DevOps** | Docker, Docker Compose |

## Security Implementation

The platform has been hardened with the following enterprise-grade security protocols:
- **Identity Protection**: Passwords hashed with **BCrypt (12 rounds)**.
- **Session Safety**: 2-hour inactivity timeout with HttpOnly/Strict cookies.
- **Brute Force Prevention**: 5-attempt rate limit per 15 mins on login routes.
- **Integrity**: CSRF token protection on every state-changing transaction.
- **XSS/Clickjacking**: Rigorous Content Security Policy and X-Frame-Options via Helmet.
- **Storage isolation**: Uploaded files are renamed via UUID and stored outside the web root.
- **Obfuscation**: Administrative panels use non-obvious endpoint names.

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/ernest-tolstonohov/recipe-hub.git
   ```

2. **Install local dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Open .env and fill in your unique SESSION_SECRET
   ```

4. **Launch with Docker**
   ```bash
   docker compose up --build -d
   ```

## Environment Variables

> [!NOTE]
> The `.env` file is excluded from version control for security. Refer to `.env.example` for the required keys.

- `SESSION_SECRET`: Cryptographically strong string for session signing.
- `MYSQL_ROOT_PASSWORD`: Password for the containerized DB.
- `NODE_ENV`: Set to `production` to enable Secure cookie flags.

## Contributors

- **Ernest Tolstonohov**
- **Matenin Dosso**
- **Hajar Natiq**
- **Baburam Bastola**

---
*Developed for the SD2 2026 Core Module.*
