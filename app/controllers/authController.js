const db = require('../services/db');
const bcrypt = require('bcrypt');

// Show register page
function showRegister(req, res) {
    res.render('auth/register', { user: req.session.user });
}

// Show login page
function showLogin(req, res) {
    res.render('auth/login', { user: req.session.user });
}

// Handle register form
async function register(req, res) {
    const { username, email, password } = req.body;

    try {
        // Check if email already exists
        const existing = await db.query(
            'SELECT * FROM users WHERE email = ?', [email]
        );

        if (existing.length > 0) {
            return res.render('auth/register', { 
                error: 'Email already registered!',
                user: null
            });
        }

        // Encrypt the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user to database
        const result = await db.query(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        // Auto login after register
        req.session.user = { 
            user_id: result.insertId, 
            username: username,
            email: email
        };

        res.redirect('/');

    } catch (err) {
        console.error(err);
        res.render('auth/register', { 
            error: 'Something went wrong, try again.',
            user: null
        });
    }
}

// Handle login form
async function login(req, res) {
    const { email, password } = req.body;

    try {
        // Find user by email
        const users = await db.query(
            'SELECT * FROM users WHERE email = ?', [email]
        );

        if (users.length === 0) {
            return res.render('auth/login', { 
                error: 'Invalid email or password!',
                user: null
            });
        }

        const user = users[0];

        // Check if account is active
        if (!user.is_active) {
            return res.render('auth/login', { 
                error: 'This account has been deactivated.',
                user: null
            });
        }

        // Check password
        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            return res.render('auth/login', { 
                error: 'Invalid email or password!',
                user: null
            });
        }

        // Save user to session
        req.session.user = { 
            user_id: user.user_id, 
            username: user.username,
            email: user.email,
            role: user.role
        };

        res.redirect('/');

    } catch (err) {
        console.error(err);
        res.render('auth/login', { 
            error: 'Something went wrong, try again.',
            user: null
        });
    }
}

// Handle logout
function logout(req, res) {
    req.session.destroy();
    res.redirect('/');
}

module.exports = { showRegister, showLogin, register, login, logout };