/**
 * Authentication Middleware
 */

/**
 * Ensures the user is logged in.
 * Redirects to /login if not authenticated.
 */
function requireAuth(req, res, next) {
    if (req.session.user) {
        return next();
    }
    
    // Save the original URL to return to after login
    req.session.returnTo = req.originalUrl;
    res.redirect('/login');
}

/**
 * Ensures the user has an 'admin' role.
 * Renders an error page if not authorized.
 */
function requireAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    
    // Redirect unauthorized users to /login instead of exposing the route
    res.redirect('/login');
}

module.exports = {
    requireAuth,
    requireAdmin
};
