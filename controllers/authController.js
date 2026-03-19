const bcrypt = require('bcryptjs');
const User = require('../models/user');

class AuthController {
    /**
     * Show registration form.
     */
    static getRegister(req, res) {
        if (req.session.user) return res.redirect('/');
        res.render('auth/register', { error: null, fields: {} });
    }

    /**
     * Process registration.
     */
    static async postRegister(req, res) {
        const { username, email, password, confirmPassword } = req.body;
        const fields = { username, email };

        // 1. Validation
        if (!username || username.length < 2) {
            return res.render('auth/register', { error: 'Username must be at least 2 characters.', fields });
        }
        if (!email || !email.includes('@')) {
            return res.render('auth/register', { error: 'Please enter a valid email address.', fields });
        }
        if (!password || password.length < 8) {
            return res.render('auth/register', { error: 'Password must be at least 8 characters.', fields });
        }
        if (password !== confirmPassword) {
            return res.render('auth/register', { error: 'Passwords do not match.', fields });
        }

        try {
            // 2. Check for duplicate email
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.render('auth/register', { error: 'Email already in use.', fields });
            }

            // 3. Hash password and create user
            const passwordHash = await bcrypt.hash(password, 12);
            const result = await User.create({ username, email, passwordHash });

            // 4. Set session
            req.session.user = { 
                id: result.insertId, 
                username, 
                email, 
                role: 'user' 
            };
            res.redirect('/');
        } catch (err) {
            console.error(err);
            res.render('auth/register', { error: 'An error occurred. Please try again.', fields });
        }
    }

    /**
     * Show login form.
     */
    static getLogin(req, res) {
        if (req.session.user) return res.redirect('/');
        res.render('auth/login', { error: null, fields: {} });
    }

    /**
     * Process login.
     */
    static async postLogin(req, res) {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.render('auth/login', { error: 'All fields are required.', fields: { email } });
        }

        try {
            const user = await User.findByEmail(email);
            if (!user || !(await bcrypt.compare(password, user.password_hash))) {
                return res.render('auth/login', { error: 'Invalid email or password.', fields: { email } });
            }

            req.session.user = { 
                id: user.id, 
                username: user.username, 
                email: user.email, 
                role: user.role 
            };

            const returnTo = req.session.returnTo || '/';
            delete req.session.returnTo;
            res.redirect(returnTo);
        } catch (err) {
            console.error(err);
            res.render('auth/login', { error: 'An error occurred. Please try again.', fields: { email } });
        }
    }

    /**
     * Process logout.
     */
    static logout(req, res) {
        req.session.destroy(() => {
            res.redirect('/login');
        });
    }
}

module.exports = AuthController;
