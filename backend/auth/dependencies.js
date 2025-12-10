/**
 * Authentication dependencies for route protection
 */

/**
 * Middleware that ensures the request has an authenticated user.
 * Must be used after firebaseAuthMiddleware.
 */
function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            detail: 'Not authenticated',
            headers: { 'WWW-Authenticate': 'Bearer' }
        });
    }
    next();
}

/**
 * Helper function to get current user from request.
 * Throws if no user is authenticated.
 * @param {Request} req - Express request object
 * @returns {object} The authenticated user's decoded token
 */
function getCurrentUser(req) {
    if (!req.user) {
        const error = new Error('Not authenticated');
        error.status = 401;
        throw error;
    }
    return req.user;
}

module.exports = {
    requireAuth,
    getCurrentUser
};
