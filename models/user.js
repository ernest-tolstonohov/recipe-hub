const db = require('../app/services/db');

class User {
    /**
     * Find a user by their ID.
     * @param {number} id 
     * @returns {Promise<Object|null>}
     */
    static async findById(id) {
        const rows = await db.query(
            'SELECT id, username, email, role, is_active, created_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    }

    /**
     * Find a user by their email (includes password hash for auth).
     * @param {string} email 
     * @returns {Promise<Object|null>}
     */
    static async findByEmail(email) {
        const rows = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0] || null;
    }

    /**
     * Create a new user.
     * @param {Object} userData 
     * @returns {Promise<Object>}
     */
    static async create({ username, email, passwordHash, role = 'user' }) {
        const result = await db.query(
            'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [username, email, passwordHash, role]
        );
        return result;
    }
}

module.exports = User;
