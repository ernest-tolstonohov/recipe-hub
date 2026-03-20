/**
 * requireAuth — redirect to /login if no session user
 */
function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/login');
}

/**
 * requireAdmin — redirect to / if user is not admin
 */
function requireAdmin(req, res, next) {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    res.redirect('/');
}

module.exports = { requireAuth, requireAdmin };
