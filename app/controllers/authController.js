const db = require('../services/db');
const bcrypt = require('bcrypt');

// Show login page
function showLogin(req, res) {
    const user = req.session ? req.session.user : null;
    res.render('auth/login', { user: user });
}

// Handle login form
async function login(req, res) {
    const { email, password } = req.body;
    try {
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
        if (!user.is_active) {
            return res.render('auth/login', { 
                error: 'This account has been deactivated.',
                user: null
            });
        }
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.render('auth/login', { 
                error: 'Invalid email or password!',
                user: null
            });
        }
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

module.exports = { showLogin, login, logout };