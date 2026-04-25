# Recipe Hub

A full-stack web application for sharing, discovering, and managing recipes.
Built with HTML, CSS, JavaScript, Pug templates, and Node.js/Express.

## Features

- **User Accounts and Profiles**: Secure registration, login, and personalized recipe management.
- **Recipe Uploads with Images**: Capability to create recipes with detailed steps, images, and ingredients.
- **Comments and Ratings**: Community-driven feedback system for recipe validation.
- **Admin Dashboard**: Centralized control for system management and content moderation.
- **Autocomplete Search and Ingredient Input**: Real-time suggestions for searching recipes and building ingredient lists.

## Tech Stack

- **Frontend**: HTML, CSS, Vanilla JavaScript, Pug Templates
- **Backend**: Node.js, Express
- **Database**: MySQL (Normalized relational structure)
- **Session**: express-session with MySQL store for persistent login states

## Security

- **Password Hashing**: Passwords securely hashed with bcrypt (12 salt rounds).
- **Session Management**: Session timeout after 2 hours of inactivity; HttpOnly, Secure, and SameSite cookies.
- **Rate Limiting**: Protection on the login route (max 5 attempts per 15 minutes).
- **CSRF Protection**: Native protection implemented on all state-changing forms.
- **Security Headers**: Hardened HTTP headers via Helmet implementation.
- **File Upload Security**: Strict validation, UUID renaming, and storage outside the public root.
- **Access Control**: Role-based admin access control for sensitive system operations.

## Getting Started

1. **Clone the repo**
   ```bash
   git clone https://github.com/ernest-tolstonohov/recipe-hub.git
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Copy env example and fill in your values**
   ```bash
   cp .env.example .env
   ```

4. **Start the app**
   ```bash
   npm start
   ```

---

*This project was developed as a collaboration by Ernest Tolstonohov, Matenin Dosso, Hajar Natiq, and Baburam Bastola.*
