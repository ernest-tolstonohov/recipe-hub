const db = require('../services/db');
const bcrypt = require('bcrypt');

// Show register page
function showRegister(req, res) {
    if (req.session.user) return res.redirect('/');
    res.render('auth/register', { user: null });
}

// Handle register form
async function register(req, res) {
    const { username, email, password } = req.body;

    // Input validation
    if (!username || !email || !password) {
        return res.render('auth/register', {
            error: 'All fields are required.',
            user: null
        });
    }
    if (password.length < 6) {
        return res.render('auth/register', {
            error: 'Password must be at least 6 characters.',
            user: null
        });
    }

    try {
        // Check for existing user
        const existing = await db.query(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [email, username]
        );
        if (existing.length > 0) {
            return res.render('auth/register', {
                error: 'Email or username already in use.',
                user: null
            });
        }

        // Hash password and insert
        const password_hash = await bcrypt.hash(password, 12);
        const result = await db.query(
            'INSERT INTO users (username, email, password_hash, role, is_active) VALUES (?, ?, ?, "user", 1)',
            [username, email, password_hash]
        );

        // Auto-login after registration
        req.session.user = {
            id: result.insertId,
            username,
            email,
            role: 'user'
        };

        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.render('auth/register', {
            error: 'Registration failed. Please try again.',
            user: null
        });
    }
}

// Show login page
function showLogin(req, res) {
    if (req.session.user) return res.redirect('/');
    res.render('auth/login', { user: null });
}

// Handle login form
async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.render('auth/login', { error: 'Email and password are required.', user: null });
    }
    try {
        const users = await db.query(
            'SELECT * FROM users WHERE email = ?', [email]
        );
        if (users.length === 0) {
            return res.render('auth/login', { error: 'Invalid email or password.', user: null });
        }
        const user = users[0];
        if (!user.is_active) {
            return res.render('auth/login', { error: 'This account has been deactivated.', user: null });
        }
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.render('auth/login', { error: 'Invalid email or password.', user: null });
        }
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.render('auth/login', { error: 'Something went wrong. Try again.', user: null });
    }
}

// Handle logout
function logout(req, res) {
    req.session.destroy(() => {
        res.redirect('/');
    });
}

module.exports = { showRegister, register, showLogin, login, logout };